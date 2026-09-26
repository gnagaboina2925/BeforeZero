import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  fetchAlertsForPoint,
  geocodeQuery,
  resetAlertCacheForTests,
  resetNominatimCacheForTests,
  storeAlertCacheForTests,
} from "./client.ts";
import { explanationCacheKey, sanitizeExplanation } from "./explain.ts";
import {
  emptyLookupMessage,
  parseCensusMatches,
  parseNominatimMatches,
  parseNwsAlerts,
  SAMPLE_ALERT,
} from "./types.ts";

describe("NWS and Census parsers", () => {
  it("reads Census coordinates without inventing a match", () => {
    const matches = parseCensusMatches({
      result: {
        addressMatches: [
          { matchedAddress: "Houston, TX", coordinates: { x: -95.3698, y: 29.7604 } },
          { matchedAddress: "bad", coordinates: { x: "nope", y: 1 } },
        ],
      },
    });
    assert.equal(matches.length, 1);
    assert.equal(matches[0].latitude, 29.7604);
    assert.equal(parseCensusMatches({}).length, 0);
  });

  it("maps official alert fields and a source URL", () => {
    const alerts = parseNwsAlerts({
      features: [
        {
          id: "https://api.weather.gov/alerts/urn:oid:2.49.0.1.840.0.test",
          properties: {
            id: "urn:oid:2.49.0.1.840.0.test",
            event: "Flood Warning",
            senderName: "NWS Houston/Galveston TX",
            areaDesc: "Harris, TX",
            sent: "2026-09-25T12:00:00+00:00",
            updated: "2026-09-25T12:30:00+00:00",
            expires: "2026-09-25T18:00:00+00:00",
            instruction: "Turn around, don't drown.",
            description: "Flooding is ongoing.",
            urgency: "Immediate",
            severity: "Severe",
            certainty: "Observed",
          },
        },
      ],
    });
    assert.equal(alerts[0].event, "Flood Warning");
    assert.equal(alerts[0].senderName, "NWS Houston/Galveston TX");
    assert.equal(alerts[0].sourceUrl, "https://api.weather.gov/alerts/urn:oid:2.49.0.1.840.0.test");
    assert.equal(alerts[0].updated, "2026-09-25T12:30:00+00:00");
  });

  it("does not treat the training sample as a live parser result", () => {
    assert.equal(parseNwsAlerts({ features: [] }).length, 0);
    assert.equal(SAMPLE_ALERT.id.startsWith("sample-"), true);
    assert.match(emptyLookupMessage(), /does not mean you are safe/i);
  });
});

describe("alert lookup client", () => {
  it("returns none without mixing in the sample alert", async () => {
    resetAlertCacheForTests();
    const result = await fetchAlertsForPoint(29.76, -95.37, "Houston, TX", async () =>
      new Response(JSON.stringify({ features: [] }), { status: 200 }),
    );
    assert.equal(result.status, "none");
    assert.equal(result.alerts.length, 0);
    assert.match(result.message, /does not mean you are safe/i);
  });

  it("serves stale cache when a later request fails", async () => {
    resetAlertCacheForTests();
    storeAlertCacheForTests(29.76, -95.37, [
      {
        ...SAMPLE_ALERT,
        id: "urn:oid:2.49.0.1.840.0.cached-test",
        senderName: "NWS Houston/Galveston TX",
        sourceUrl: "https://api.weather.gov/alerts/urn:oid:2.49.0.1.840.0.cached-test",
      },
    ]);
    const result = await fetchAlertsForPoint(29.76, -95.37, "Houston, TX", async () => {
      throw new Error("network");
    });
    assert.equal(result.status, "stale");
    assert.equal(result.alerts[0].id, "urn:oid:2.49.0.1.840.0.cached-test");
    assert.match(result.message, /previously fetched/i);
  });

  it("does not invent coordinates when Census returns no matches", async () => {
    resetNominatimCacheForTests();
    const result = await geocodeQuery("ZZZZZ", async (input) => {
      const url = String(input);
      if (url.includes("nominatim")) return new Response("[]", { status: 200 });
      return new Response(JSON.stringify({ result: { addressMatches: [] } }), { status: 200 });
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.message, /no match|not invented|not an alert lookup/i);
    }
  });

  it("uses Nominatim for ZIP-only input and labels the point as approximate", async () => {
    resetNominatimCacheForTests();
    const result = await geocodeQuery("77002", async (input) => {
      const url = String(input);
      assert.match(url, /nominatim\.openstreetmap\.org/);
      assert.match(url, /postalcode=77002/);
      assert.equal(url.includes("geocoding.geo.census.gov"), false);
      return new Response(
        JSON.stringify([{ lat: "29.7604", lon: "-95.3698", display_name: "Houston, Texas, 77002" }]),
        { status: 200 },
      );
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.candidates[0].approximate, true);
      assert.equal(result.candidates[0].matchKind, "zip");
      assert.match(result.candidates[0].label, /entire ZIP/i);
    }
  });
});

describe("alert explanation sanitizer", () => {
  it("keeps cache keys tied to alert id and update version", () => {
    assert.equal(
      explanationCacheKey({ ...SAMPLE_ALERT, id: "abc", updated: "v2" }),
      "abc::v2",
    );
  });

  it("falls back when the model omits text", () => {
    const sanitized = sanitizeExplanation({});
    assert.match(sanitized.explanation, /original official alert/i);
    assert.match(sanitized.uncertaintyNote, /not a forecast/i);
  });
});

describe("Nominatim ranking and policy helpers", () => {
  const houstonPayload = [
    {
      lat: "31.32",
      lon: "-95.15",
      name: "Houston County",
      display_name: "Houston County, Texas, United States",
      addresstype: "county",
      type: "administrative",
      address: { county: "Houston County", state: "Texas", "ISO3166-2-lvl4": "US-TX" },
    },
    {
      lat: "29.76",
      lon: "-95.37",
      name: "Houston",
      display_name: "Houston, Harris County, Texas, United States",
      addresstype: "city",
      type: "administrative",
      address: { city: "Houston", state: "Texas", "ISO3166-2-lvl4": "US-TX" },
    },
    {
      lat: "43.76",
      lon: "-91.57",
      name: "Houston",
      display_name: "Houston, Minnesota, United States",
      addresstype: "city",
      type: "administrative",
      address: { city: "Houston", state: "Minnesota", "ISO3166-2-lvl4": "US-MN" },
    },
    {
      lat: "37.32",
      lon: "-91.96",
      name: "Houston",
      display_name: "Houston, Texas County, Missouri, United States",
      addresstype: "city",
      type: "administrative",
      address: { city: "Houston", county: "Texas County", state: "Missouri", "ISO3166-2-lvl4": "US-MO" },
    },
  ];

  it("prioritizes Houston city in Texas and drops out-of-state matches", () => {
    const matches = parseNominatimMatches(houstonPayload, "place", {
      city: "Houston",
      stateCode: "TX",
      stateName: "Texas",
    });
    assert.equal(matches.length, 2);
    assert.equal(matches[0].placeType, "City");
    assert.match(matches[0].label, /^City:/);
    assert.match(matches[0].label, /Houston, Harris/i);
    assert.equal(matches[1].placeType, "County");
    assert.equal(matches.some((item) => /Minnesota|Missouri/i.test(item.label)), false);
  });

  it("caches identical Nominatim lookups and does not retry a timeout", async () => {
    resetNominatimCacheForTests();
    let calls = 0;
    const zipFetch: typeof fetch = async () => {
      calls += 1;
      return new Response(
        JSON.stringify([{ lat: "29.7604", lon: "-95.3698", display_name: "Houston, Texas, 77002", addresstype: "postcode" }]),
        { status: 200 },
      );
    };
    const first = await geocodeQuery("77002", zipFetch);
    const second = await geocodeQuery("77002", zipFetch);
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    assert.equal(calls, 1);

    resetNominatimCacheForTests();
    let timedOutCalls = 0;
    const timeout = await geocodeQuery("Houston, TX", async () => {
      timedOutCalls += 1;
      const error = new Error("aborted");
      error.name = "AbortError";
      throw error;
    });
    assert.equal(timeout.ok, false);
    if (!timeout.ok) {
      assert.match(timeout.message, /timed out/i);
      assert.match(timeout.message, /not an all-clear/i);
    }
    assert.equal(timedOutCalls, 1);
  });

  it("identifies Nominatim requests with an application User-Agent", async () => {
    resetNominatimCacheForTests();
    await geocodeQuery("Austin, TX", async (_input, init) => {
      const headers = new Headers(init?.headers);
      assert.match(headers.get("User-Agent") ?? "", /BeforeZero/i);
      assert.match(headers.get("User-Agent") ?? "", /github\.com/i);
      return new Response("[]", { status: 200 });
    });
  });
});
