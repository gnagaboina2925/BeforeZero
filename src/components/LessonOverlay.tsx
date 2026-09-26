"use client";

import type { LessonOverlayId } from "@/lib/lesson/catalog";

export function LessonOverlay({
  overlay,
  description,
  reduceMotion,
}: {
  overlay: LessonOverlayId;
  description: string;
  reduceMotion: boolean;
}) {
  if (overlay === "none") return null;
  const motionClass = reduceMotion ? "lesson-overlay is-still" : "lesson-overlay";
  return (
    <div className={motionClass}>
      {overlay === "alert-card" ? <AlertCardOverlay /> : null}
      {overlay === "flooded-road" ? <FloodedRoadOverlay /> : null}
      {overlay === "building-cutaway" ? <BuildingCutawayOverlay /> : null}
      {overlay === "tornado-alert-card" ? <TornadoAlertOverlay /> : null}
      {overlay === "tornado-home-shelter" ? <TornadoHomeShelterOverlay /> : null}
      <p className="sr-only">{description}</p>
    </div>
  );
}

function AlertCardOverlay() {
  return (
    <svg className="lesson-overlay-svg" viewBox="0 0 640 280" role="img" aria-hidden="true">
      <rect x="48" y="28" width="544" height="224" rx="14" fill="#071018" stroke="#e8b86d" strokeWidth="3" />
      <text x="72" y="58" fill="#f3d19a" fontSize="13">
        Fictional practice alert — not a live warning
      </text>
      <text x="72" y="88" fill="#d6deea" fontSize="16">
        Condition: preparation before a storm
      </text>
      <text x="72" y="118" fill="#d6deea" fontSize="15">
        Have several ways to receive alerts.
      </text>
      <text x="72" y="144" fill="#9aacbf" fontSize="14">
        WEA · EAS · NOAA Weather Radio · community alerts
      </text>
      <rect x="64" y="168" width="512" height="58" rx="8" fill="#132033" stroke="#f3d19a" strokeWidth="3" />
      <text x="80" y="204" fill="#f3d19a" fontSize="18">
        Follow local emergency managers.
      </text>
    </svg>
  );
}

function FloodedRoadOverlay() {
  return (
    <svg className="lesson-overlay-svg" viewBox="0 0 640 280" role="img" aria-hidden="true">
      <rect x="0" y="0" width="640" height="280" fill="rgba(7,16,24,0.28)" />
      <path d="M40 210 H600 L560 250 H80 Z" fill="#1a3a55" />
      <path d="M70 222 Q160 208 250 224 T430 220 T570 226" fill="none" stroke="#7eb0d4" strokeWidth="8" />
      <circle cx="320" cy="118" r="46" fill="none" stroke="#e8b86d" strokeWidth="8" />
      <path d="M292 90 L348 146" stroke="#e8b86d" strokeWidth="8" />
      <text x="40" y="36" fill="#f3d19a" fontSize="14">
        Training illustration — not a real street or route
      </text>
      <text x="40" y="70" fill="#d6deea" fontSize="20">
        Do not walk, swim, or drive through flood waters.
      </text>
      <text x="40" y="98" fill="#f3d19a" fontSize="16">
        Turn Around. Don’t Drown.
      </text>
    </svg>
  );
}

function BuildingCutawayOverlay() {
  return (
    <svg className="lesson-overlay-svg" viewBox="0 0 640 280" role="img" aria-hidden="true">
      <rect x="180" y="24" width="280" height="232" fill="#0b1220" stroke="#9aacbf" strokeWidth="2" />
      <rect x="188" y="188" width="264" height="60" fill="#1a3a55" />
      <text x="198" y="224" fill="#7eb0d4" fontSize="13">
        Lower level: flooding
      </text>
      <rect x="188" y="118" width="264" height="70" fill="#132033" />
      <text x="198" y="158" fill="#9aacbf" fontSize="13">
        Middle level
      </text>
      <rect x="188" y="48" width="264" height="70" fill="#1c2b22" stroke="#e8b86d" strokeWidth="3" />
      <text x="198" y="78" fill="#f3d19a" fontSize="14">
        Highest level — go here
      </text>
      <text x="198" y="98" fill="#f3d19a" fontSize="12">
        if trapped by flooding
      </text>
      <rect x="200" y="8" width="240" height="28" fill="#2a1a1a" stroke="#e8b86d" strokeWidth="2" />
      <text x="214" y="27" fill="#e8b86d" fontSize="13">
        Closed attic — do not enter
      </text>
      <text x="20" y="48" fill="#d6deea" fontSize="13">
        Conceptual cutaway.
      </text>
      <text x="20" y="70" fill="#d6deea" fontSize="13">
        Not a real building.
      </text>
      <text x="20" y="92" fill="#d6deea" fontSize="13">
        Not an evacuation map.
      </text>
      <text x="20" y="250" fill="#9aacbf" fontSize="12">
        Stairs may be inaccessible. Plan assistance before a storm.
      </text>
    </svg>
  );
}

function TornadoAlertOverlay() {
  return (
    <svg className="lesson-overlay-svg" viewBox="0 0 640 280" role="img" aria-hidden="true">
      <rect x="24" y="20" width="592" height="240" rx="12" fill="#071018" stroke="#9aacbf" strokeWidth="2" />
      <text x="40" y="48" fill="#f3d19a" fontSize="13">
        Practice card — not a live alert. Words matter more than color or sound.
      </text>
      <rect x="40" y="70" width="268" height="168" rx="8" fill="#121c30" stroke="#c5cdd8" strokeWidth="2" />
      <text x="56" y="100" fill="#f4f0e6" fontSize="18">
        Tornado Watch
      </text>
      <text x="56" y="128" fill="#f3d19a" fontSize="16">
        Be prepared
      </text>
      <text x="56" y="158" fill="#c5cdd8" fontSize="14">
        Tornadoes are possible.
      </text>
      <text x="56" y="182" fill="#c5cdd8" fontSize="14">
        Review your plan.
      </text>
      <rect x="332" y="70" width="268" height="168" rx="8" fill="#121c30" stroke="#e8b86d" strokeWidth="2" />
      <text x="348" y="100" fill="#f4f0e6" fontSize="18">
        Tornado Warning
      </text>
      <text x="348" y="128" fill="#f3d19a" fontSize="16">
        Take action
      </text>
      <text x="348" y="158" fill="#c5cdd8" fontSize="14">
        Sighted or shown on radar.
      </text>
      <text x="348" y="182" fill="#c5cdd8" fontSize="14">
        Go to shelter now.
      </text>
    </svg>
  );
}

function TornadoHomeShelterOverlay() {
  return (
    <svg className="lesson-overlay-svg" viewBox="0 0 640 280" role="img" aria-hidden="true">
      <text x="16" y="28" fill="#f3d19a" fontSize="13">
        Conceptual sturdy house — not a real floor plan, not a mobile home, not a vehicle
      </text>
      <rect x="200" y="44" width="280" height="210" fill="#0b1220" stroke="#9aacbf" strokeWidth="2" />
      <rect x="208" y="52" width="264" height="52" fill="#2a1a1a" />
      <text x="220" y="84" fill="#c5cdd8" fontSize="13">
        Upper floor with windows — avoid windows
      </text>
      <rect x="208" y="108" width="264" height="52" fill="#132033" />
      <text x="220" y="140" fill="#c5cdd8" fontSize="13">
        Main floor — not the first choice here
      </text>
      <rect x="208" y="164" width="264" height="80" fill="#1c2b22" stroke="#e8b86d" strokeWidth="3" />
      <text x="220" y="196" fill="#f3d19a" fontSize="15">
        Interior basement — go here
      </text>
      <text x="220" y="218" fill="#f3d19a" fontSize="13">
        Away from windows
      </text>
      <text x="16" y="70" fill="#d6deea" fontSize="13">
        Setting:
      </text>
      <text x="16" y="92" fill="#d6deea" fontSize="13">
        sturdy house
      </text>
      <text x="16" y="114" fill="#d6deea" fontSize="13">
        with a basement
      </text>
      <text x="16" y="250" fill="#9aacbf" fontSize="12">
        Stairs may be inaccessible. See the access step for sourced wheelchair and limited-mobility notes.
      </text>
    </svg>
  );
}
