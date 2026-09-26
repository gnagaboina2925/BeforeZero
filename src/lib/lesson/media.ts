import { LESSON_BEATS, type HurricaneSceneId, type LessonSceneId } from "./catalog.ts";
import {
  TORNADO_BEATS,
  TORNADO_LESSON_ID,
} from "./tornado.ts";
import {
  HOME_FIRE_BEATS,
  HOME_FIRE_LESSON_ID,
} from "./home-fire.ts";

export const LESSON_SCENE_IDS = ["watch", "rain", "street", "interior", "flood"] as const;

/** Up to four Imagine clips. `rain` reuses `street` rather than a fifth paid generation. */
export const IMAGINE_CLIP_IDS = ["watch", "street", "flood", "interior"] as const;
export type ImagineClipId = (typeof IMAGINE_CLIP_IDS)[number];

export const SCENE_CLIP_SOURCE: Record<HurricaneSceneId, ImagineClipId> = {
  watch: "watch",
  rain: "street",
  street: "street",
  flood: "flood",
  interior: "interior",
};

export const VIDEO_MODEL = "grok-imagine-video-1.5";
export const VIDEO_GENERATIONS_URL = "https://api.x.ai/v1/videos/generations";
export const VIDEO_STATUS_URL = "https://api.x.ai/v1/videos";
export const VIDEO_DURATION_SECONDS = 8;
export const VIDEO_ASPECT_RATIO = "16:9";
export const VIDEO_RESOLUTION = "720p";

export const CLIP_PROMPTS: Record<ImagineClipId, string> = {
  watch:
    "Fictional practice illustration, not a real storm. Dim interior at a window, weather radio on a table, heavy rain outside, navy and amber light, slow camera. No people, no faces, no readable text, no logos, no maps, no street names, no evacuation arrows.",
  street:
    "Fictional practice illustration, not a real storm. Residential street at dusk with shallow moving rainwater, heavy rain, no cars driving through water, navy palette, slow camera. No people, no readable signs, no maps, no route markings.",
  flood:
    "Fictional practice illustration, not a real storm. Indoor doorway threshold with water spreading across a floor, dim daylight, navy and amber, slow camera. No people, no attic hatch, no exit signs, no readable text, no maps, no routes.",
  interior:
    "Fictional practice illustration, not a real storm. Dim interior stairwell going upward, rain light from a window, navy palette, slow camera. No people, no exit signs, no floor numbers, no readable text, no maps, no evacuation arrows.",
};

export const TORNADO_IMAGINE_CLIP_IDS = ["sky", "shelter"] as const;
export type TornadoImagineClipId = (typeof TORNADO_IMAGINE_CLIP_IDS)[number];

export const TORNADO_CLIP_PROMPTS: Record<TornadoImagineClipId, string> = {
  sky: "Fictional practice illustration, not a real tornado and not documentary footage. View from inside a sturdy site-built house toward a dark overcast sky through a closed window. No flood water, no street flooding, no mobile home, no vehicle, no people, no faces, no readable text, no maps, no sirens, no flashing lights.",
  shelter:
    "Fictional practice illustration, not a real tornado. Windowless interior hallway of a sturdy house on a lowest floor, closed bathroom door, dim practical lighting, navy palette, slow camera. No flood water, no attic, no people, no exit signs, no readable text, no maps.",
};

export const TORNADO_SCENE_CLIP_SOURCE = {
  "tornado-sky": "sky",
  "tornado-shelter": "shelter",
} as const;

export const HOME_FIRE_IMAGINE_CLIP_IDS = ["room", "yard"] as const;
export type HomeFireImagineClipId = (typeof HOME_FIRE_IMAGINE_CLIP_IDS)[number];

export const HOME_FIRE_CLIP_PROMPTS: Record<HomeFireImagineClipId, string> = {
  room: "Fictional practice illustration, not a real fire and not documentary footage. Dim ground-floor bedroom interior of a one-story house, closed bedroom door, window on one wall, navy and amber practical lighting, slow camera. No flames, no smoke filling the room, no people, no faces, no readable text, no maps, no exit signs, no tornado, no flood water.",
  yard: "Fictional practice illustration, not a real fire. Night view of the front of a one-story house from across a small yard, porch light on, navy palette, slow camera. No flames, no fire trucks, no people, no readable address, no maps, no sirens, no flashing emergency lights.",
};

export const HOME_FIRE_SCENE_CLIP_SOURCE = {
  "fire-room": "room",
  "fire-outside": "yard",
} as const;

export interface LessonMediaAsset {
  video: string | null;
  audio: string | null;
  captions: string | null;
  still: string | null;
  visualSource: ImagineClipId | TornadoImagineClipId | HomeFireImagineClipId;
  muxStatus: "ready" | "audio-only" | "still-only" | "missing";
  narrationStatus: "current" | "stale" | "missing";
  narrationFingerprint: string | null;
  note: string;
}

export interface LessonMediaManifest {
  lessonId: string;
  videoModel: string;
  videoStatus: "not-generated" | "partial" | "ready";
  generatedAt: string | null;
  clips: Record<
    string,
    {
      requestId: string | null;
      sourceFile: string | null;
      stillFile: string | null;
      status: "missing" | "pending" | "saved" | "failed";
      diagnostic: string | null;
    }
  >;
  beats: Record<string, LessonMediaAsset>;
}

export interface NarrationClip {
  id: string;
  text: string;
  scene: LessonSceneId;
}

export function narrationFingerprint(text: string): string {
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33) ^ text.charCodeAt(index);
  }
  return (hash >>> 0).toString(16);
}

export function narrationClips(beats = LESSON_BEATS): NarrationClip[] {
  return beats.filter((beat) => beat.narration.trim()).map((beat) => ({
    id: beat.id,
    text: beat.narration,
    scene: beat.scene,
  }));
}

export function mediaIdForBeat(beatId: string, beats = LESSON_BEATS): string {
  return beats.some((beat) => beat.id === beatId) ? beatId : beats[0]?.id ?? "intro";
}

export interface Cue {
  start: number;
  end: number;
  text: string;
}

const ABBREVIATION_DOT = "\uE000";

function splitNarrationSentences(text: string): string[] {
  const protectedText = text
    .replace(/\b(?:[A-Z]\.){2,}/g, (match) => match.replaceAll(".", ABBREVIATION_DOT))
    .replace(/\b(?:Mrs|Ms|Mr|Dr|vs|etc)\./gi, (match) => match.replaceAll(".", ABBREVIATION_DOT));
  return protectedText
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.replaceAll(ABBREVIATION_DOT, ".").trim())
    .filter(Boolean);
}

export function narrationCues(text: string, durationSeconds: number): Cue[] {
  const parts = splitNarrationSentences(text);
  const totalChars = parts.reduce((sum, cue) => sum + cue.length, 0) || 1;
  let elapsed = 0;
  const cues: Cue[] = [];
  for (const part of parts) {
    const share = part.length / totalChars;
    const span = Math.max(1.2, durationSeconds * share);
    const start = elapsed;
    const end = Math.min(durationSeconds, elapsed + span);
    cues.push({ start, end, text: part });
    elapsed = end;
  }
  return cues;
}

export function cueAtTime(cues: Cue[], time: number): string {
  const active = cues.reduce<Cue | undefined>((current, cue) => {
    if (time >= cue.start && time <= cue.end) return cue;
    return current;
  }, undefined);
  return active?.text ?? cues[0]?.text ?? "";
}

export function vttFromNarration(text: string, durationSeconds: number): string {
  const cues = narrationCues(text, durationSeconds);
  const lines = ["WEBVTT", ""];
  for (const cue of cues) {
    lines.push(`${formatCueTime(cue.start)} --> ${formatCueTime(cue.end)}`);
    lines.push(cue.text);
    lines.push("");
  }
  return lines.join("\n");
}

function formatCueTime(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  const whole = Math.floor(secs);
  const ms = Math.round((secs - whole) * 1000)
    .toString()
    .padStart(3, "0");
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(whole).padStart(2, "0")}.${ms}`;
}

export function xmlSafeText(input: string): string {
  let output = "";
  for (const character of input) {
    const code = character.codePointAt(0) ?? 0;
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) continue;
    if (character === "&") output += "&amp;";
    else if (character === "<") output += "&lt;";
    else if (character === ">") output += "&gt;";
    else if (character === '"') output += "&quot;";
    else if (character === "'") output += "&apos;";
    else output += character;
  }
  return output;
}

export function svgDocument(innerMarkup: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-hidden="true">\n${innerMarkup}\n</svg>\n`;
}

export function emptyTornadoMediaManifest(): LessonMediaManifest {
  return {
    lessonId: TORNADO_LESSON_ID,
    videoModel: VIDEO_MODEL,
    videoStatus: "not-generated",
    generatedAt: null,
    clips: {
      sky: { requestId: null, sourceFile: null, stillFile: "stills/sky.jpg", status: "missing", diagnostic: null },
      shelter: {
        requestId: null,
        sourceFile: null,
        stillFile: "stills/shelter.svg",
        status: "missing",
        diagnostic: null,
      },
    },
    beats: Object.fromEntries(
      TORNADO_BEATS.map((beat) => [
        beat.id,
        {
          video: null,
          audio: null,
          captions: `captions/${beat.id}.vtt`,
          still: beat.scene === "tornado-sky" ? "stills/sky.jpg" : "stills/shelter.svg",
          visualSource: TORNADO_SCENE_CLIP_SOURCE[beat.scene === "tornado-sky" ? "tornado-sky" : "tornado-shelter"],
          muxStatus: "still-only" as const,
          narrationStatus: "missing" as const,
          narrationFingerprint: narrationFingerprint(beat.narration),
          note: "On-screen teaching text is current. Tornado video and Grok Voice narration have not been generated.",
        },
      ]),
    ),
  };
}

export function homeFireStillForScene(scene: string): string {
  if (scene === "fire-outside") return "stills/yard.svg";
  return "stills/room.svg";
}

export function emptyHomeFireMediaManifest(): LessonMediaManifest {
  return {
    lessonId: HOME_FIRE_LESSON_ID,
    videoModel: VIDEO_MODEL,
    videoStatus: "not-generated",
    generatedAt: null,
    clips: {
      room: { requestId: null, sourceFile: null, stillFile: "stills/room.svg", status: "missing", diagnostic: null },
      yard: { requestId: null, sourceFile: null, stillFile: "stills/yard.svg", status: "missing", diagnostic: null },
    },
    beats: Object.fromEntries(
      HOME_FIRE_BEATS.map((beat) => [
        beat.id,
        {
          video: null,
          audio: null,
          captions: `captions/${beat.id}.vtt`,
          still: beat.overlay === "none" ? homeFireStillForScene(beat.scene) : "stills/escape-plan.svg",
          visualSource: HOME_FIRE_SCENE_CLIP_SOURCE[beat.scene === "fire-outside" ? "fire-outside" : "fire-room"],
          muxStatus: "still-only" as const,
          narrationStatus: "missing" as const,
          narrationFingerprint: narrationFingerprint(beat.narration),
          note: "On-screen teaching text is current. Home-fire video and Grok Voice narration have not been generated.",
        },
      ]),
    ),
  };
}

export function emptyLessonMediaManifest(): LessonMediaManifest {
  return {
    lessonId: "hurricane-flood-1",
    videoModel: VIDEO_MODEL,
    videoStatus: "not-generated",
    generatedAt: null,
    clips: {
      watch: { requestId: null, sourceFile: null, stillFile: null, status: "missing", diagnostic: null },
      street: { requestId: null, sourceFile: null, stillFile: null, status: "missing", diagnostic: null },
      flood: { requestId: null, sourceFile: null, stillFile: null, status: "missing", diagnostic: null },
      interior: { requestId: null, sourceFile: null, stillFile: null, status: "missing", diagnostic: null },
    },
    beats: {},
  };
}
