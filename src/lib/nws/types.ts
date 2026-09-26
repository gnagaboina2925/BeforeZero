export const NWS_API_BASE = "https://api.weather.gov";
export const NWS_ALERTS_ACTIVE = `${NWS_API_BASE}/alerts/active`;
export const NWS_DOCS_URL = "https://www.weather.gov/documentation/services-web-api";
export const CENSUS_GEOCODER =
  "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";
export const CENSUS_GEOCODER_DOCS =
  "https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html";

export const NWS_USER_AGENT = "BeforeZero/0.1 (educational emergency-learning website)";
export const NOMINATIM_USER_AGENT =
  "BeforeZero/0.1 (educational emergency-learning website; https://github.com/gnagaboina2925/BeforeZero)";
export const ALERT_CACHE_MS = 10 * 60 * 1000;
export const NOMINATIM_CACHE_MS = 24 * 60 * 60 * 1000;
export const NOMINATIM_MIN_INTERVAL_MS = 1000;
export const NOMINATIM_TIMEOUT_MS = 10_000;

export interface GeocodeCandidate {
  label: string;
  latitude: number;
  longitude: number;
  approximate?: boolean;
  matchKind?: "street" | "place" | "zip";
  source?: "census" | "nominatim";
  placeType?: string;
}

export const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
export const NOMINATIM_DOCS = "https://nominatim.org/release-docs/latest/api/Search/";
export const NOMINATIM_USAGE = "https://operations.osmfoundation.org/policies/nominatim/";
export const OSM_COPYRIGHT = "https://www.openstreetmap.org/copyright";
export const OSM_ATTRIBUTION =
  "Location search uses OpenStreetMap data © OpenStreetMap contributors, ODbL 1.0.";

export interface OfficialAlert {
  id: string;
  event: string;
  senderName: string;
  areaDesc: string;
  sent: string | null;
  effective: string | null;
  expires: string | null;
  instruction: string | null;
  description: string | null;
  urgency: string | null;
  severity: string | null;
  certainty: string | null;
  sourceUrl: string | null;
  updated: string | null;
}

export type AlertFetchStatus = "active" | "none" | "error" | "stale";

export interface AlertLookupResult {
  status: AlertFetchStatus;
  alerts: OfficialAlert[];
  checkedAt: string;
  locationLabel: string;
  message: string;
  cacheAgeMs?: number;
}

export const SAMPLE_ALERT: OfficialAlert = {
  id: "sample-flood-warning-training",
  event: "Flood Warning",
  senderName: "Sample for training — not issued by the National Weather Service",
  areaDesc: "A fictional county used only for demos",
  sent: "2024-01-15T14:00:00+00:00",
  effective: "2024-01-15T14:00:00+00:00",
  expires: "2024-01-15T20:00:00+00:00",
  updated: "2024-01-15T14:00:00+00:00",
  urgency: "Immediate",
  severity: "Severe",
  certainty: "Likely",
  instruction:
    "Ready.gov: Find safe shelter right away. Do not walk, swim, or drive through flood waters. Evacuate if told to do so. This sample is not a live warning.",
  description:
    "This is a training sample. It is not an NWS product and is never mixed into live API results.",
  sourceUrl: "https://www.ready.gov/floods",
};

export function parseCensusMatches(payload: unknown): GeocodeCandidate[] {
  if (!payload || typeof payload !== "object") return [];
  const result = (payload as { result?: { addressMatches?: unknown } }).result;
  if (!result || !Array.isArray(result.addressMatches)) return [];
  const matches: GeocodeCandidate[] = [];
  for (const item of result.addressMatches) {
    if (!item || typeof item !== "object") continue;
    const record = item as {
      matchedAddress?: unknown;
      coordinates?: { x?: unknown; y?: unknown };
    };
    const x = record.coordinates?.x;
    const y = record.coordinates?.y;
    if (typeof x !== "number" || typeof y !== "number") continue;
    const label = typeof record.matchedAddress === "string" ? record.matchedAddress : `${y}, ${x}`;
    matches.push({
      label,
      latitude: y,
      longitude: x,
      matchKind: "street",
      source: "census",
    });
  }
  return matches;
}

export function parseNwsAlerts(payload: unknown): OfficialAlert[] {
  if (!payload || typeof payload !== "object") return [];
  const features = (payload as { features?: unknown }).features;
  if (!Array.isArray(features)) return [];
  const alerts: OfficialAlert[] = [];
  for (const feature of features) {
    if (!feature || typeof feature !== "object") continue;
    const props = (feature as { properties?: Record<string, unknown> }).properties;
    if (!props) continue;
    const id = typeof props.id === "string" ? props.id : null;
    const event = typeof props.event === "string" ? props.event : null;
    if (!id || !event) continue;
    const featureId = (feature as { id?: unknown }).id;
    const sourceUrl =
      typeof featureId === "string" && featureId.startsWith("http")
        ? featureId
        : nwsAlertHref(id);
    const updated =
      typeof props.updated === "string"
        ? props.updated
        : typeof props.sent === "string"
          ? props.sent
          : null;
    alerts.push({
      id,
      event,
      senderName: typeof props.senderName === "string" ? props.senderName : "National Weather Service",
      areaDesc: typeof props.areaDesc === "string" ? props.areaDesc : "Area not listed in this record",
      sent: typeof props.sent === "string" ? props.sent : null,
      effective: typeof props.effective === "string" ? props.effective : null,
      expires: typeof props.expires === "string" ? props.expires : null,
      updated,
      instruction: typeof props.instruction === "string" ? props.instruction : null,
      description: typeof props.description === "string" ? props.description : null,
      urgency: typeof props.urgency === "string" ? props.urgency : null,
      severity: typeof props.severity === "string" ? props.severity : null,
      certainty: typeof props.certainty === "string" ? props.certainty : null,
      sourceUrl,
    });
  }
  return alerts;
}

export function nwsAlertHref(id: string): string {
  return `${NWS_API_BASE}/alerts/${id}`;
}

const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

export interface CityStateQuery {
  city: string;
  stateCode: string;
  stateName: string;
}

export function parseCityStateQuery(query: string): CityStateQuery | null {
  const trimmed = query.trim();
  const match = trimmed.match(/^([A-Za-z .'-]+?)[,\s]+([A-Za-z]{2})$/);
  if (!match) return null;
  const city = match[1].trim();
  const stateCode = match[2].toUpperCase();
  const stateName = US_STATE_NAMES[stateCode];
  if (!city || !stateName) return null;
  return { city, stateCode, stateName };
}

function nominatimPlaceType(record: Record<string, unknown>): string {
  const addresstype = typeof record.addresstype === "string" ? record.addresstype : "";
  const type = typeof record.type === "string" ? record.type : "";
  const cls = typeof record.class === "string" ? record.class : "";
  const blob = `${addresstype} ${type} ${cls}`.toLowerCase();
  if (blob.includes("postcode") || blob.includes("postal_code") || blob.includes("postalcode")) return "ZIP";
  if (blob.includes("county")) return "County";
  if (blob.includes("state") && !blob.includes("city")) return "State";
  if (/\b(city|town|village|municipality|hamlet|suburb|neighbourhood|neighborhood)\b/.test(blob)) return "City";
  const display = typeof record.display_name === "string" ? record.display_name.toLowerCase() : "";
  if (/\bcounty\b/.test(display)) return "County";
  if (/\bcity\b/.test(display)) return "City";
  return "Place";
}

function nominatimInRequestedState(record: Record<string, unknown>, requested: CityStateQuery): boolean {
  const address =
    record.address && typeof record.address === "object" ? (record.address as Record<string, unknown>) : {};
  const state = typeof address.state === "string" ? address.state : "";
  const iso = typeof address["ISO3166-2-lvl4"] === "string" ? address["ISO3166-2-lvl4"] : "";
  const isoCode = iso.replace(/^US-/i, "").toUpperCase();
  if (isoCode) return isoCode === requested.stateCode;
  if (state) {
    return state.toLowerCase() === requested.stateName.toLowerCase() || state.toUpperCase() === requested.stateCode;
  }
  const display = typeof record.display_name === "string" ? record.display_name : "";
  const stateToken = `(?:${requested.stateName}|${requested.stateCode})`;
  return new RegExp(`,\\s*${stateToken}\\s*,`, "i").test(display);
}

function cityNameMatches(record: Record<string, unknown>, city: string): boolean {
  const named = typeof record.name === "string" ? record.name : "";
  const display = typeof record.display_name === "string" ? record.display_name : "";
  const needle = city.toLowerCase();
  return named.toLowerCase() === needle || display.toLowerCase().startsWith(`${needle},`);
}

function rankNominatimCandidate(candidate: GeocodeCandidate, requested: CityStateQuery | null): number {
  let score = 0;
  if (candidate.placeType === "City") score += 50;
  if (candidate.placeType === "ZIP") score += 20;
  if (candidate.placeType === "County") score -= 20;
  if (candidate.placeType === "State") score -= 40;
  if (requested && candidate.label.toLowerCase().includes(requested.city.toLowerCase())) score += 25;
  if (requested && candidate.placeType === "City" && candidate.label.toLowerCase().includes(requested.city.toLowerCase())) {
    score += 40;
  }
  return score;
}

export function parseNominatimMatches(
  payload: unknown,
  matchKind: "place" | "zip",
  requested: CityStateQuery | null = null,
): GeocodeCandidate[] {
  if (!Array.isArray(payload)) return [];
  const matches: GeocodeCandidate[] = [];
  for (const item of payload) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const latitude = typeof record.lat === "string" ? Number(record.lat) : typeof record.lat === "number" ? record.lat : NaN;
    const longitude = typeof record.lon === "string" ? Number(record.lon) : typeof record.lon === "number" ? record.lon : NaN;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    if (requested && !nominatimInRequestedState(record, requested)) continue;
    const placeType = matchKind === "zip" ? "ZIP" : nominatimPlaceType(record);
    if (requested && placeType === "City" && !cityNameMatches(record, requested.city) && nominatimPlaceType(record) === "City") {
      continue;
    }
    const display = typeof record.display_name === "string" ? record.display_name : `${latitude}, ${longitude}`;
    const typed = `${placeType}: ${display}`;
    const label =
      matchKind === "zip"
        ? `${typed} (approximate ZIP representative point — not the entire ZIP Code)`
        : typed;
    matches.push({
      label,
      latitude,
      longitude,
      approximate: true,
      matchKind,
      source: "nominatim",
      placeType,
    });
  }
  return matches.sort((a, b) => rankNominatimCandidate(b, requested) - rankNominatimCandidate(a, requested));
}

export function classifyLocationQuery(query: string): "zip" | "city-state" | "street" | "unknown" {
  const trimmed = query.trim();
  if (/^\d{5}(?:-\d{4})?$/.test(trimmed)) return "zip";
  if (/\d/.test(trimmed) && /\b(st|street|ave|avenue|rd|road|dr|drive|blvd|ln|lane|way|ct|court|pl|place|hwy|pkwy)\b/i.test(trimmed)) {
    return "street";
  }
  if (/^[A-Za-z .'-]+,\s*[A-Za-z]{2}\s*$/.test(trimmed) || /^[A-Za-z .'-]+\s+[A-Za-z]{2}$/.test(trimmed)) {
    return "city-state";
  }
  if (/^\d{5}(?:-\d{4})?\b/.test(trimmed) && !/\d.+\s+\d/.test(trimmed)) return "zip";
  return "unknown";
}

export function emptyLookupMessage(): string {
  return "No active alerts were returned for that point. That does not mean you are safe. Keep using official NWS, NOAA Weather Radio, and local channels.";
}

export function errorLookupMessage(): string {
  return "This app could not retrieve official alerts right now. Do not treat a failed lookup as an all-clear.";
}

export function staleLookupMessage(): string {
  return "Showing previously fetched official alerts because a new request failed. Times below are from the earlier check.";
}
