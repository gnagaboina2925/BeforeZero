import {
  ALERT_CACHE_MS,
  CENSUS_GEOCODER,
  classifyLocationQuery,
  emptyLookupMessage,
  errorLookupMessage,
  NOMINATIM_CACHE_MS,
  NOMINATIM_MIN_INTERVAL_MS,
  NOMINATIM_SEARCH,
  NOMINATIM_TIMEOUT_MS,
  NOMINATIM_USER_AGENT,
  NWS_ALERTS_ACTIVE,
  NWS_USER_AGENT,
  parseCensusMatches,
  parseCityStateQuery,
  parseNominatimMatches,
  parseNwsAlerts,
  staleLookupMessage,
  type AlertLookupResult,
  type CityStateQuery,
  type GeocodeCandidate,
  type OfficialAlert,
} from "./types.ts";

const alertCache = new Map<string, { result: AlertLookupResult; storedAt: number }>();
const nominatimPayloadCache = new Map<string, { storedAt: number; payload: unknown }>();

let lastNominatimAt = 0;
let nominatimQueue: Promise<void> = Promise.resolve();

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}

function nominatimHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "User-Agent": NOMINATIM_USER_AGENT,
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}

function timeoutMessage(): string {
  return "Location lookup timed out. Alerts were not fetched. This is not an all-clear.";
}

function unavailableMessage(): string {
  return "Location lookup is unavailable right now. Alerts were not fetched. This is not an all-clear.";
}

async function paceNominatim(): Promise<void> {
  const scheduled = nominatimQueue.then(async () => {
    const wait = Math.max(0, NOMINATIM_MIN_INTERVAL_MS - (Date.now() - lastNominatimAt));
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  });
  nominatimQueue = scheduled.catch(() => undefined);
  await scheduled;
}

async function geocodeCensus(
  query: string,
  fetchImpl: typeof fetch,
): Promise<{ ok: true; candidates: GeocodeCandidate[] } | { ok: false; message: string; emptyMatch: boolean }> {
  const url = new URL(CENSUS_GEOCODER);
  url.searchParams.set("address", query);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("format", "json");
  try {
    const response = await fetchImpl(url.toString(), { headers: { Accept: "application/json" } });
    if (!response.ok) {
      return {
        ok: false,
        emptyMatch: false,
        message: "The Census geocoder did not return a location. No coordinates were invented. Alerts were not fetched.",
      };
    }
    const candidates = parseCensusMatches(await response.json());
    if (candidates.length) return { ok: true, candidates };
    return {
      ok: false,
      emptyMatch: true,
      message: "The Census geocoder found no street match.",
    };
  } catch (error) {
    return {
      ok: false,
      emptyMatch: false,
      message: isAbortError(error) ? timeoutMessage() : unavailableMessage(),
    };
  }
}

async function fetchNominatimOnce(
  url: URL,
  fetchImpl: typeof fetch,
): Promise<{ ok: true; payload: unknown } | { ok: false; message: string }> {
  await paceNominatim();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url.toString(), { headers: nominatimHeaders(), signal: controller.signal });
    lastNominatimAt = Date.now();
    if (!response.ok) {
      return { ok: false, message: unavailableMessage() };
    }
    return { ok: true, payload: await response.json() };
  } catch (error) {
    lastNominatimAt = Date.now();
    return { ok: false, message: isAbortError(error) ? timeoutMessage() : unavailableMessage() };
  } finally {
    clearTimeout(timer);
  }
}

async function geocodeNominatim(
  query: string,
  kind: "zip" | "place",
  fetchImpl: typeof fetch,
): Promise<{ ok: true; candidates: GeocodeCandidate[] } | { ok: false; message: string }> {
  const requested: CityStateQuery | null = kind === "place" ? parseCityStateQuery(query) : null;
  const url = new URL(NOMINATIM_SEARCH);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "us");
  if (kind === "zip") {
    const zip = query.match(/\d{5}/)?.[0] ?? query;
    url.searchParams.set("postalcode", zip);
    url.searchParams.set("country", "us");
  } else if (requested) {
    url.searchParams.set("city", requested.city);
    url.searchParams.set("state", requested.stateName);
    url.searchParams.set("country", "us");
  } else {
    url.searchParams.set("q", query);
  }

  const cacheId = url.toString();
  const cached = nominatimPayloadCache.get(cacheId);
  if (cached && Date.now() - cached.storedAt < NOMINATIM_CACHE_MS) {
    return nominatimResultFromPayload(cached.payload, kind, requested);
  }

  const fetched = await fetchNominatimOnce(url, fetchImpl);
  if (!fetched.ok) return fetched;
  nominatimPayloadCache.set(cacheId, { storedAt: Date.now(), payload: fetched.payload });
  return nominatimResultFromPayload(fetched.payload, kind, requested);
}

function nominatimResultFromPayload(
  payload: unknown,
  kind: "zip" | "place",
  requested: CityStateQuery | null,
): { ok: true; candidates: GeocodeCandidate[] } | { ok: false; message: string } {
  const candidates = parseNominatimMatches(payload, kind === "zip" ? "zip" : "place", requested);
  if (candidates.length) return { ok: true, candidates };
  return {
    ok: false,
    message:
      "No U.S. city, state, or ZIP match was returned. No coordinates were invented. This is not an alert lookup.",
  };
}

export async function geocodeQuery(
  query: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true; candidates: GeocodeCandidate[] } | { ok: false; message: string }> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { ok: false, message: "Enter a U.S. city and state, or a ZIP code." };
  }
  const kind = classifyLocationQuery(trimmed);
  if (kind === "zip") {
    return geocodeNominatim(trimmed, "zip", fetchImpl);
  }
  if (kind === "city-state") {
    return geocodeNominatim(trimmed, "place", fetchImpl);
  }
  if (kind === "street") {
    const census = await geocodeCensus(trimmed, fetchImpl);
    if (census.ok) return census;
    if (!census.emptyMatch) return { ok: false, message: census.message };
    const nominatim = await geocodeNominatim(trimmed, "place", fetchImpl);
    if (nominatim.ok) return nominatim;
    return {
      ok: false,
      message: `${census.message} Nominatim also returned no match. No coordinates were invented.`,
    };
  }
  const nominatim = await geocodeNominatim(trimmed, "place", fetchImpl);
  if (nominatim.ok) return nominatim;
  if (/timed out/i.test(nominatim.message)) return nominatim;
  const census = await geocodeCensus(trimmed, fetchImpl);
  if (census.ok) return census;
  return {
    ok: false,
    message:
      "No U.S. city, state, ZIP, or street match was returned. No coordinates were invented. This is not an alert lookup.",
  };
}

export async function fetchAlertsForPoint(
  latitude: number,
  longitude: number,
  locationLabel: string,
  fetchImpl: typeof fetch = fetch,
): Promise<AlertLookupResult> {
  const key = cacheKey(latitude, longitude);
  const now = Date.now();
  const url = `${NWS_ALERTS_ACTIVE}?point=${latitude},${longitude}`;

  try {
    const response = await fetchImpl(url, {
      headers: {
        "User-Agent": NWS_USER_AGENT,
        Accept: "application/geo+json",
      },
    });
    if (!response.ok) {
      return cachedOrError(key, now, locationLabel);
    }
    const payload: unknown = await response.json();
    const alerts = parseNwsAlerts(payload);
    const result: AlertLookupResult = {
      status: alerts.length ? "active" : "none",
      alerts,
      checkedAt: new Date(now).toISOString(),
      locationLabel,
      message: alerts.length
        ? "Official active alerts returned by the National Weather Service API for the confirmed point."
        : emptyLookupMessage(),
    };
    alertCache.set(key, { result, storedAt: now });
    return result;
  } catch {
    return cachedOrError(key, now, locationLabel);
  }
}

function cachedOrError(key: string, now: number, locationLabel: string): AlertLookupResult {
  const cached = alertCache.get(key);
  if (cached) {
    const age = now - cached.storedAt;
    const stale = age > ALERT_CACHE_MS;
    return {
      ...cached.result,
      locationLabel,
      status: stale || cached.result.status !== "error" ? "stale" : "error",
      cacheAgeMs: age,
      message: staleLookupMessage(),
    };
  }
  return {
    status: "error",
    alerts: [],
    checkedAt: new Date(now).toISOString(),
    locationLabel,
    message: errorLookupMessage(),
  };
}

export function resetAlertCacheForTests(): void {
  alertCache.clear();
}

export function resetNominatimCacheForTests(): void {
  nominatimPayloadCache.clear();
  lastNominatimAt = 0;
}

export function storeAlertCacheForTests(lat: number, lon: number, alerts: OfficialAlert[]): void {
  const now = Date.now() - ALERT_CACHE_MS - 1000;
  alertCache.set(cacheKey(lat, lon), {
    storedAt: now,
    result: {
      status: "active",
      alerts,
      checkedAt: new Date(now).toISOString(),
      locationLabel: "cached",
      message: "cached",
    },
  });
}
