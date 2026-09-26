"use client";

import { SceneListen } from "@/components/SceneListen";
import { useAccessPreferences } from "@/components/AccessProvider";
import {
  CENSUS_GEOCODER_DOCS,
  NOMINATIM_DOCS,
  NOMINATIM_USAGE,
  NWS_DOCS_URL,
  OSM_ATTRIBUTION,
  OSM_COPYRIGHT,
  SAMPLE_ALERT,
  type AlertLookupResult,
  type GeocodeCandidate,
  type OfficialAlert,
} from "@/lib/nws/types";
import { useState } from "react";

function formatTime(value: string | null): string {
  if (!value) return "Not stated in this record";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toUTCString();
}

export function AlertsPanel() {
  const { prefs } = useAccessPreferences();
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<GeocodeCandidate[]>([]);
  const [lookup, setLookup] = useState<AlertLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [explanation, setExplanation] = useState<{
    alertId: string;
    explanation: string;
    uncertaintyNote: string;
    version: string;
  } | null>(null);

  async function searchLocation() {
    setBusy(true);
    setError(null);
    setCandidates([]);
    setLookup(null);
    setShowSample(false);
    try {
      const response = await fetch("/api/alerts/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const payload = (await response.json()) as { candidates?: GeocodeCandidate[]; error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Location lookup failed.");
        return;
      }
      setCandidates(payload.candidates ?? []);
    } catch {
      setError("Location lookup failed. No alerts were fetched.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmLocation(candidate: GeocodeCandidate) {
    setBusy(true);
    setError(null);
    setShowSample(false);
    try {
      const response = await fetch("/api/alerts/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: candidate.latitude,
          longitude: candidate.longitude,
          label: candidate.label,
        }),
      });
      const payload = (await response.json()) as AlertLookupResult | { error?: string };
      if (!response.ok || !("status" in payload)) {
        setError("error" in payload ? payload.error ?? "Alert lookup failed." : "Alert lookup failed.");
        return;
      }
      setLookup(payload);
    } catch {
      setError("Alert lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  async function explain(alert: OfficialAlert) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/alerts/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alert }),
      });
      const payload = (await response.json()) as {
        explanation?: string;
        uncertaintyNote?: string;
        version?: string;
        error?: { message?: string };
      };
      if (!response.ok) {
        setError(payload.error?.message ?? "Explanation is unavailable right now.");
        return;
      }
      setExplanation({
        alertId: alert.id,
        explanation: payload.explanation ?? "",
        uncertaintyNote: payload.uncertaintyNote ?? "",
        version: payload.version ?? alert.id,
      });
    } catch {
      setError("Explanation is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  const sampleVisible = Boolean(showSample && lookup && lookup.alerts.length === 0);

  return (
    <section className="panel" aria-labelledby="alerts-heading">
      <p className="kicker">On-demand information</p>
      <h1 id="alerts-heading" className="display-sm">
        Official weather alerts
      </h1>
      <p className="lede">
        Look up active National Weather Service alerts for a U.S. place you confirm. This is not a
        notification service, not dispatch, and not a guarantee. Browser location is not requested.
      </p>
      <p className="result-note">
        Sources: <a href={NWS_DOCS_URL}>NWS API Web Service</a> (`/alerts/active?point=`), the{" "}
        <a href={CENSUS_GEOCODER_DOCS}>Census Geocoding Services API</a> for street addresses, and{" "}
        <a href={NOMINATIM_DOCS}>Nominatim search</a> for U.S. city/state and ZIP lookup (no API key;{" "}
        <a href={NOMINATIM_USAGE}>usage policy</a>). {OSM_ATTRIBUTION}{" "}
        <a href={OSM_COPYRIGHT}>OpenStreetMap copyright and license</a>. ZIP and city matches are representative
        points, not whole areas. A failed location lookup is not “no alerts.” No active alerts does not mean you
        are safe.
      </p>

      <form
        className="alert-form"
        onSubmit={(event) => {
          event.preventDefault();
          void searchLocation();
        }}
      >
        <label className="field">
          <span className="field-label">U.S. city and state, or ZIP code</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <button type="submit" className="btn-primary" disabled={busy || !query.trim()}>
          {busy ? "Looking up…" : "Find location"}
        </button>
      </form>

      {error ? (
        <p className="grok-error" role="alert">
          {error}
        </p>
      ) : null}

      {candidates.length > 1 ? (
        <fieldset className="choice-set">
          <legend className="section-label">Confirm the place</legend>
          <p className="result-note">The geocoder returned more than one match.</p>
          {candidates.map((candidate) => (
            <button
              key={`${candidate.latitude},${candidate.longitude}`}
              type="button"
              className="btn-secondary"
              onClick={() => {
                void confirmLocation(candidate);
              }}
            >
              {candidate.label}
              {candidate.approximate ? " — confirm this representative point" : ""}
            </button>
          ))}
        </fieldset>
      ) : null}

      {candidates.length === 1 ? (
        <p>
          <button type="button" className="btn-primary" onClick={() => void confirmLocation(candidates[0])}>
            Use {candidates[0].label}
          </button>
        </p>
      ) : null}

      {lookup ? (
        <div className="alert-results">
          <p className="result-body">
            Last checked: {formatTime(lookup.checkedAt)} · Place: {lookup.locationLabel} · Status:{" "}
            {lookup.status === "active"
              ? "Active alerts"
              : lookup.status === "none"
                ? "No active alerts returned"
                : lookup.status === "stale"
                  ? "Stale cached data"
                  : "Unable to retrieve alerts"}
          </p>
          <p className="result-note">{lookup.message}</p>
          {lookup.alerts.length === 0 && (lookup.status === "none" || lookup.status === "error") ? (
            <button type="button" className="btn-ghost" onClick={() => setShowSample(true)}>
              Show a marked sample alert for training
            </button>
          ) : null}
          {lookup.alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              sample={false}
              explanation={explanation?.alertId === alert.id ? explanation : null}
              onExplain={() => void explain(alert)}
              showNarration={prefs.narration}
              busy={busy}
            />
          ))}
        </div>
      ) : null}

      {sampleVisible ? (
        <AlertCard
          alert={SAMPLE_ALERT}
          sample
          explanation={explanation?.alertId === SAMPLE_ALERT.id ? explanation : null}
          onExplain={() => void explain(SAMPLE_ALERT)}
          showNarration={prefs.narration}
          busy={busy}
        />
      ) : null}
    </section>
  );
}

function AlertCard({
  alert,
  sample,
  explanation,
  onExplain,
  showNarration,
  busy,
}: {
  alert: OfficialAlert;
  sample: boolean;
  explanation: { explanation: string; uncertaintyNote: string; version: string } | null;
  onExplain: () => void;
  showNarration: boolean;
  busy: boolean;
}) {
  return (
    <article className={`alert-card ${sample ? "is-sample" : ""}`}>
      {sample ? <p className="kicker">Sample for training — not a live NWS alert</p> : null}
      <h2>{alert.event}</h2>
      <p className="result-body">Issuing agency: {alert.senderName}</p>
      <p className="result-body">Affected area: {alert.areaDesc}</p>
      <p className="result-body">Issued: {formatTime(alert.sent)}</p>
      <p className="result-body">Effective: {formatTime(alert.effective)}</p>
      <p className="result-body">Expires: {formatTime(alert.expires)}</p>
      {alert.urgency || alert.severity || alert.certainty ? (
        <p className="result-body">
          Urgency {alert.urgency ?? "not stated"}; severity {alert.severity ?? "not stated"}; certainty{" "}
          {alert.certainty ?? "not stated"}
        </p>
      ) : null}
      {alert.instruction ? (
        <p className="result-body">
          <strong>Official instruction: </strong>
          {alert.instruction}
        </p>
      ) : (
        <p className="result-note">No instruction field was present in this record.</p>
      )}
      {alert.description ? <p className="result-body">{alert.description}</p> : null}
      {alert.sourceUrl ? (
        <p>
          <a className="resource-link" href={alert.sourceUrl} rel="noopener noreferrer" target="_blank">
            Official source record
          </a>
        </p>
      ) : null}
      <button type="button" className="btn-secondary" disabled={busy} onClick={onExplain}>
        Explain this alert
      </button>
      {explanation ? (
        <div className="sim-proposal">
          <h3 className="section-label">Grok explanation</h3>
          <p className="result-note">Keep reading the original alert. Version {explanation.version}</p>
          <p className="result-body">{explanation.explanation}</p>
          <p className="result-note">{explanation.uncertaintyNote}</p>
          {showNarration ? (
            <SceneListen
              cacheKey={`alert:${explanation.version}`}
              narration={`${explanation.explanation} ${explanation.uncertaintyNote}`}
              muted={false}
            />
          ) : (
            <p className="result-note">Turn on narration controls to hear this explanation. The same text is shown above.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}
