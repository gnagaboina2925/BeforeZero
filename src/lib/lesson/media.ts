import { LESSON_BEATS, type LessonSceneId } from "./catalog.ts";

export const LESSON_SCENE_IDS = ["watch", "rain", "street", "interior", "flood"] as const;

/** Up to four Imagine clips. `rain` reuses `street` rather than a fifth paid generation. */
export const IMAGINE_CLIP_IDS = ["watch", "street", "flood", "interior"] as const;
export type ImagineClipId = (typeof IMAGINE_CLIP_IDS)[number];

export const SCENE_CLIP_SOURCE: Record<LessonSceneId, ImagineClipId> = {
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

export interface LessonMediaAsset {
  video: string | null;
  audio: string | null;
  captions: string | null;
  still: string | null;
  visualSource: ImagineClipId;
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
    ImagineClipId,
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

export function narrationClips(): NarrationClip[] {
  return LESSON_BEATS.filter((beat) => beat.narration.trim()).map((beat) => ({
    id: beat.id,
    text: beat.narration,
    scene: beat.scene,
  }));
}

export function mediaIdForBeat(beatId: string): string {
  return LESSON_BEATS.some((beat) => beat.id === beatId) ? beatId : "intro";
}

export interface Cue {
  start: number;
  end: number;
  text: string;
}

export function narrationCues(text: string, durationSeconds: number): Cue[] {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
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
