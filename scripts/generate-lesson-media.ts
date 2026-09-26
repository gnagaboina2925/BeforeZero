import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import {
  CLIP_PROMPTS,
  IMAGINE_CLIP_IDS,
  SCENE_CLIP_SOURCE,
  TORNADO_CLIP_PROMPTS,
  TORNADO_IMAGINE_CLIP_IDS,
  TORNADO_SCENE_CLIP_SOURCE,
  VIDEO_ASPECT_RATIO,
  VIDEO_DURATION_SECONDS,
  VIDEO_GENERATIONS_URL,
  VIDEO_MODEL,
  VIDEO_RESOLUTION,
  VIDEO_STATUS_URL,
  HOME_FIRE_CLIP_PROMPTS,
  HOME_FIRE_IMAGINE_CLIP_IDS,
  emptyHomeFireMediaManifest,
  emptyLessonMediaManifest,
  emptyTornadoMediaManifest,
  homeFireStillForScene,
  narrationClips,
  narrationFingerprint,
  svgDocument,
  vttFromNarration,
  xmlSafeText,
  type HomeFireImagineClipId,
  type ImagineClipId,
  type TornadoImagineClipId,
} from "../src/lib/lesson/media.ts";
import type { HurricaneSceneId } from "../src/lib/lesson/catalog.ts";
import { HOME_FIRE_BEATS, HOME_FIRE_LESSON_ID } from "../src/lib/lesson/home-fire.ts";
import { TORNADO_BEATS, TORNADO_LESSON_ID } from "../src/lib/lesson/tornado.ts";
import { TTS_URL, ttsVoice } from "../src/lib/voice.ts";

const ROOT = process.cwd();
const LESSON_DIR = path.join(ROOT, "public", "lesson");
const SOURCE_DIR = path.join(LESSON_DIR, "source");
const AUDIO_DIR = path.join(LESSON_DIR, "audio");
const MUX_DIR = path.join(LESSON_DIR, "muxed");
const CAPTION_DIR = path.join(LESSON_DIR, "captions");
const STILL_DIR = path.join(LESSON_DIR, "stills");
const PUBLIC_MANIFEST = path.join(LESSON_DIR, "manifest.json");
const SRC_MANIFEST = path.join(ROOT, "src", "lib", "lesson", "media-manifest.json");
const JOBS_PATH = path.join(LESSON_DIR, "jobs.json");
const HASH_PATH = path.join(LESSON_DIR, "narration-hashes.json");
const TORNADO_DIR = path.join(LESSON_DIR, "tornado");
const TORNADO_SOURCE_DIR = path.join(TORNADO_DIR, "source");
const TORNADO_AUDIO_DIR = path.join(TORNADO_DIR, "audio");
const TORNADO_MUX_DIR = path.join(TORNADO_DIR, "muxed");
const TORNADO_CAPTION_DIR = path.join(TORNADO_DIR, "captions");
const TORNADO_JOBS_PATH = path.join(TORNADO_DIR, "jobs.json");
const TORNADO_HASH_PATH = path.join(TORNADO_DIR, "narration-hashes.json");
const TORNADO_DIAGRAM_BEATS = new Set(["tornado-demo-shelter", "tornado-warning-decision"]);
const HOME_FIRE_DIR = path.join(LESSON_DIR, "home-fire");
const HOME_FIRE_SOURCE_DIR = path.join(HOME_FIRE_DIR, "source");
const HOME_FIRE_AUDIO_DIR = path.join(HOME_FIRE_DIR, "audio");
const HOME_FIRE_MUX_DIR = path.join(HOME_FIRE_DIR, "muxed");
const HOME_FIRE_CAPTION_DIR = path.join(HOME_FIRE_DIR, "captions");
const HOME_FIRE_STILL_DIR = path.join(HOME_FIRE_DIR, "stills");
const HOME_FIRE_JOBS_PATH = path.join(HOME_FIRE_DIR, "jobs.json");
const HOME_FIRE_HASH_PATH = path.join(HOME_FIRE_DIR, "narration-hashes.json");
const HOME_FIRE_DIAGRAM_BEATS = new Set(["fire-demo-plan", "fire-alarm-decision", "fire-blocked-decision"]);
const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const FFPROBE = "/opt/homebrew/bin/ffprobe";

interface JobRecord {
  requestId: string | null;
  status: "missing" | "pending" | "saved" | "failed";
  diagnostic: string | null;
  sourceFile: string | null;
}

type JobFile = Record<ImagineClipId, JobRecord>;
type TornadoJobFile = Record<TornadoImagineClipId, JobRecord>;
type HomeFireJobFile = Record<HomeFireImagineClipId, JobRecord>;

function loadEnvLocal(): void {
  const envPath = path.join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!key || process.env[key]) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function emptyJobs(): JobFile {
  return {
    watch: { requestId: null, status: "missing", diagnostic: null, sourceFile: null },
    street: { requestId: null, status: "missing", diagnostic: null, sourceFile: null },
    flood: { requestId: null, status: "missing", diagnostic: null, sourceFile: null },
    interior: { requestId: null, status: "missing", diagnostic: null, sourceFile: null },
  };
}

function readJobs(): JobFile {
  if (!existsSync(JOBS_PATH)) return emptyJobs();
  try {
    const parsed = JSON.parse(readFileSync(JOBS_PATH, "utf8")) as Partial<JobFile>;
    return { ...emptyJobs(), ...parsed };
  } catch {
    return emptyJobs();
  }
}

function writeJobs(jobs: JobFile): void {
  writeFileSync(JOBS_PATH, `${JSON.stringify(jobs, null, 2)}\n`);
}

function emptyTornadoJobs(): TornadoJobFile {
  return {
    sky: { requestId: null, status: "missing", diagnostic: null, sourceFile: null },
    shelter: { requestId: null, status: "missing", diagnostic: null, sourceFile: null },
  };
}

function readTornadoJobs(): TornadoJobFile {
  if (!existsSync(TORNADO_JOBS_PATH)) return emptyTornadoJobs();
  try {
    const parsed = JSON.parse(readFileSync(TORNADO_JOBS_PATH, "utf8")) as Partial<TornadoJobFile>;
    return { ...emptyTornadoJobs(), ...parsed };
  } catch {
    return emptyTornadoJobs();
  }
}

function writeTornadoJobs(jobs: TornadoJobFile): void {
  writeFileSync(TORNADO_JOBS_PATH, `${JSON.stringify(jobs, null, 2)}\n`);
}

function readTornadoHashes(): Record<string, string> {
  if (!existsSync(TORNADO_HASH_PATH)) return {};
  try {
    const parsed = JSON.parse(readFileSync(TORNADO_HASH_PATH, "utf8")) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeTornadoHashes(hashes: Record<string, string>): void {
  writeFileSync(TORNADO_HASH_PATH, `${JSON.stringify(hashes, null, 2)}\n`);
}

function readHashes(): Record<string, string> {
  if (!existsSync(HASH_PATH)) return {};
  try {
    const parsed = JSON.parse(readFileSync(HASH_PATH, "utf8")) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeHashes(hashes: Record<string, string>): void {
  writeFileSync(HASH_PATH, `${JSON.stringify(hashes, null, 2)}\n`);
}

function sanitizeDiagnostic(input: {
  httpStatus?: number;
  status?: string;
  code?: string;
}): string {
  const parts = [
    input.httpStatus != null ? `http_${input.httpStatus}` : null,
    input.status ?? null,
    input.code ?? null,
  ].filter(Boolean);
  return parts.join(":") || "video_generation_failed";
}

function requireFfmpeg(): void {
  if (!existsSync(FFMPEG) || !existsSync(FFPROBE)) {
    throw new Error("Missing local dependency: ffmpeg (including ffprobe). Install with: brew install ffmpeg");
  }
}

function probeDuration(filePath: string): number {
  const result = spawnSync(
    FFPROBE,
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath],
    { encoding: "utf8" },
  );
  const value = Number.parseFloat(result.stdout.trim());
  return Number.isFinite(value) ? value : VIDEO_DURATION_SECONDS;
}

function extractStill(sourcePath: string, stillPath: string): boolean {
  const result = spawnSync(FFMPEG, ["-y", "-i", sourcePath, "-frames:v", "1", stillPath], {
    encoding: "utf8",
  });
  return result.status === 0 && existsSync(stillPath);
}

function muxNarration(sourcePath: string, audioPath: string, outputPath: string, audioSeconds: number): boolean {
  const videoSeconds = probeDuration(sourcePath);
  const pad = Math.max(0, audioSeconds - videoSeconds + 0.15);
  const args = [
    "-y",
    "-i",
    sourcePath,
    "-i",
    audioPath,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-shortest",
    outputPath,
  ];
  if (pad > 0.05) {
    args.splice(
      6,
      0,
      "-filter_complex",
      `[0:v]tpad=stop_mode=clone:stop_duration=${pad.toFixed(3)}[v]`,
      "-map",
      "[v]",
    );
    args[args.indexOf("-map")] = "-map";
    // rebuild args more clearly
  }
  const built =
    pad > 0.05
      ? [
          "-y",
          "-i",
          sourcePath,
          "-i",
          audioPath,
          "-filter_complex",
          `[0:v]tpad=stop_mode=clone:stop_duration=${pad.toFixed(3)}[v]`,
          "-map",
          "[v]",
          "-map",
          "1:a:0",
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-c:a",
          "aac",
          outputPath,
        ]
      : [
          "-y",
          "-an",
          "-i",
          sourcePath,
          "-i",
          audioPath,
          "-map",
          "0:v:0",
          "-map",
          "1:a:0",
          "-c:v",
          "copy",
          "-c:a",
          "aac",
          "-shortest",
          outputPath,
        ];
  const result = spawnSync(FFMPEG, built, { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`ffmpeg mux failed (${result.status ?? "unknown"}).`);
    return false;
  }
  return existsSync(outputPath);
}

async function startGeneration(apiKey: string, prompt: string): Promise<{ requestId: string } | { diagnostic: string }> {
  const response = await fetch(VIDEO_GENERATIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: VIDEO_MODEL,
      prompt,
      duration: VIDEO_DURATION_SECONDS,
      aspect_ratio: VIDEO_ASPECT_RATIO,
      resolution: VIDEO_RESOLUTION,
    }),
  });
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const code =
      payload && typeof payload === "object" && (payload as { error?: { code?: string } }).error?.code
        ? String((payload as { error: { code: string } }).error.code)
        : undefined;
    return { diagnostic: sanitizeDiagnostic({ httpStatus: response.status, code }) };
  }
  const requestId =
    payload && typeof payload === "object" && typeof (payload as { request_id?: unknown }).request_id === "string"
      ? (payload as { request_id: string }).request_id
      : null;
  if (!requestId) {
    return { diagnostic: sanitizeDiagnostic({ httpStatus: response.status, status: "missing_request_id" }) };
  }
  return { requestId };
}

async function pollAndSave(
  apiKey: string,
  clipId: ImagineClipId,
  requestId: string,
): Promise<{ sourceFile: string } | { diagnostic: string }> {
  const deadline = Date.now() + 12 * 60 * 1000;
  while (Date.now() < deadline) {
    const response = await fetch(`${VIDEO_STATUS_URL}/${requestId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    if (!response.ok) {
      const code =
        payload && typeof payload === "object" && (payload as { error?: { code?: string } }).error?.code
          ? String((payload as { error: { code: string } }).error.code)
          : undefined;
      return { diagnostic: sanitizeDiagnostic({ httpStatus: response.status, code }) };
    }
    const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const status = typeof record.status === "string" ? record.status : "pending";
    if (status === "pending") {
      const progress = typeof record.progress === "number" ? ` ${record.progress}%` : "";
      console.log(`Polling ${clipId}${progress}…`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }
    if (status === "failed" || status === "expired") {
      const code =
        record.error && typeof record.error === "object" && typeof (record.error as { code?: unknown }).code === "string"
          ? (record.error as { code: string }).code
          : undefined;
      return { diagnostic: sanitizeDiagnostic({ status, code }) };
    }
    if (status === "done") {
      const video = record.video && typeof record.video === "object" ? (record.video as Record<string, unknown>) : {};
      const url = typeof video.url === "string" ? video.url : null;
      const moderated = video.respect_moderation === true;
      if (!url || !moderated) {
        return { diagnostic: sanitizeDiagnostic({ status: "done", code: "empty_or_unusable_video" }) };
      }
      const download = await fetch(url);
      if (!download.ok) {
        return { diagnostic: sanitizeDiagnostic({ httpStatus: download.status, status: "download_failed" }) };
      }
      const bytes = Buffer.from(await download.arrayBuffer());
      if (bytes.byteLength < 10_000) {
        return { diagnostic: sanitizeDiagnostic({ status: "done", code: "file_too_small" }) };
      }
      const sourceFile = `source/${clipId}.mp4`;
      writeFileSync(path.join(LESSON_DIR, sourceFile), bytes);
      console.log(`Saved ${sourceFile} (${bytes.byteLength} bytes).`);
      return { sourceFile };
    }
    return { diagnostic: sanitizeDiagnostic({ status }) };
  }
  return { diagnostic: sanitizeDiagnostic({ status: "poll_timeout" }) };
}

async function generateClip(apiKey: string, clipId: ImagineClipId, jobs: JobFile): Promise<void> {
  const sourcePath = path.join(SOURCE_DIR, `${clipId}.mp4`);
  if (existsSync(sourcePath)) {
    jobs[clipId] = {
      requestId: jobs[clipId].requestId,
      status: "saved",
      diagnostic: null,
      sourceFile: `source/${clipId}.mp4`,
    };
    writeJobs(jobs);
    console.log(`Skipping Imagine for ${clipId}; source file already exists.`);
    return;
  }
  if (jobs[clipId].status === "failed") {
    console.log(`Skipping ${clipId}; previous attempt failed (${jobs[clipId].diagnostic ?? "video_generation_failed"}).`);
    return;
  }
  let requestId = jobs[clipId].requestId;
  if (!requestId) {
    console.log(`Submitting Imagine job for ${clipId}…`);
    const started = await startGeneration(apiKey, CLIP_PROMPTS[clipId]);
    if ("diagnostic" in started) {
      jobs[clipId] = { requestId: null, status: "failed", diagnostic: started.diagnostic, sourceFile: null };
      writeJobs(jobs);
      console.error(`${clipId} failed: ${started.diagnostic}`);
      return;
    }
    requestId = started.requestId;
    jobs[clipId] = { requestId, status: "pending", diagnostic: null, sourceFile: null };
    writeJobs(jobs);
  } else {
    console.log(`Polling existing ${clipId} job…`);
  }
  const saved = await pollAndSave(apiKey, clipId, requestId);
  if ("diagnostic" in saved) {
    jobs[clipId] = { requestId, status: "failed", diagnostic: saved.diagnostic, sourceFile: null };
    writeJobs(jobs);
    console.error(`${clipId} failed: ${saved.diagnostic}`);
    return;
  }
  jobs[clipId] = { requestId, status: "saved", diagnostic: null, sourceFile: saved.sourceFile };
  writeJobs(jobs);
}

async function generateNarration(
  apiKey: string,
  id: string,
  text: string,
  force: boolean,
  lessonDir = LESSON_DIR,
): Promise<string | null> {
  const audioRel = `audio/${id}.mp3`;
  const audioPath = path.join(lessonDir, audioRel);
  if (existsSync(audioPath) && !force) {
    console.log(`Skipping TTS for ${id}; audio already exists.`);
    return audioRel;
  }
  const response = await fetch(TTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voice_id: ttsVoice(),
      language: "en",
    }),
  });
  if (!response.ok) {
    console.error(`${id} narration failed: ${sanitizeDiagnostic({ httpStatus: response.status })}`);
    return null;
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength === 0) {
    console.error(`${id} narration failed: empty_audio`);
    return null;
  }
  writeFileSync(audioPath, bytes);
  console.log(`Saved ${audioRel} (${bytes.byteLength} bytes).`);
  return audioRel;
}

function writeManifest(jobs: JobFile, hashes: Record<string, string>): void {
  const manifest = emptyLessonMediaManifest();
  manifest.generatedAt = new Date().toISOString();
  let savedCount = 0;
  for (const clipId of IMAGINE_CLIP_IDS) {
    const job = jobs[clipId];
    const stillRel = job.sourceFile ? `stills/${clipId}.jpg` : null;
    if (job.sourceFile && stillRel && !existsSync(path.join(LESSON_DIR, stillRel))) {
      extractStill(path.join(LESSON_DIR, job.sourceFile), path.join(LESSON_DIR, stillRel));
    }
    manifest.clips[clipId] = {
      requestId: job.requestId,
      sourceFile: job.sourceFile,
      stillFile: stillRel && existsSync(path.join(LESSON_DIR, stillRel)) ? stillRel : null,
      status: job.status,
      diagnostic: job.diagnostic,
    };
    if (job.status === "saved") savedCount += 1;
  }
  for (const clip of narrationClips()) {
    const visual = hurricaneVisual(clip.scene);
    const audioRel = existsSync(path.join(AUDIO_DIR, `${clip.id}.mp3`)) ? `audio/${clip.id}.mp3` : null;
    const muxRel = existsSync(path.join(MUX_DIR, `${clip.id}.mp4`)) ? `muxed/${clip.id}.mp4` : null;
    const captionRel = existsSync(path.join(CAPTION_DIR, `${clip.id}.vtt`)) ? `captions/${clip.id}.vtt` : null;
    const stillRel = manifest.clips[visual].stillFile;
    const sourceRel = jobs[visual].sourceFile;
    const expectedHash = narrationFingerprint(clip.text);
    const storedHash = hashes[clip.id] ?? null;
    const audioIsCurrent = Boolean(audioRel && storedHash === expectedHash);
    let muxStatus: "ready" | "audio-only" | "still-only" | "missing" = "missing";
    let narrationStatus: "current" | "stale" | "missing" = "missing";
    let note = "On-screen teaching text is current. Grok Voice narration has not been generated for this script yet.";
    if (audioRel && !audioIsCurrent) {
      narrationStatus = "stale";
      note =
        "On-screen teaching text is current. Existing voice audio is from a previous script and is not attached until you regenerate narration.";
    }
    if (audioIsCurrent && muxRel) {
      muxStatus = "ready";
      narrationStatus = "current";
      note = "Generated practice clip with current muxed narration. Not documentary footage.";
    } else if (audioIsCurrent) {
      muxStatus = "audio-only";
      narrationStatus = "current";
      note = "Current narration is available. Video mux is missing, so a still or source clip is shown.";
    } else if (stillRel || sourceRel) {
      muxStatus = stillRel && !sourceRel ? "still-only" : "missing";
    }
    manifest.beats[clip.id] = {
      video: audioIsCurrent && muxRel ? muxRel : sourceRel,
      audio: audioIsCurrent ? audioRel : null,
      captions: audioIsCurrent ? captionRel : null,
      still: stillRel,
      visualSource: visual,
      muxStatus,
      narrationStatus,
      narrationFingerprint: audioIsCurrent ? expectedHash : storedHash,
      note,
    };
  }
  manifest.videoStatus = savedCount === IMAGINE_CLIP_IDS.length ? "ready" : savedCount > 0 ? "partial" : "not-generated";
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(PUBLIC_MANIFEST, json);
  writeFileSync(SRC_MANIFEST, json);
}

function hurricaneVisual(scene: string): ImagineClipId {
  if (scene in SCENE_CLIP_SOURCE) return SCENE_CLIP_SOURCE[scene as HurricaneSceneId];
  return "watch";
}

function selectedLessonId(): string {
  const index = process.argv.indexOf("--lesson");
  const value = index >= 0 ? process.argv[index + 1] : "hurricane-flood-1";
  if (value === "tornado" || value === "tornado-home-1") return TORNADO_LESSON_ID;
  if (value === "home-fire" || value === "home-fire-1") return HOME_FIRE_LESSON_ID;
  return "hurricane-flood-1";
}

function tornadoVisual(scene: string): TornadoImagineClipId {
  return scene === "tornado-sky" ? "sky" : "shelter";
}

function tornadoStillFile(clipId: TornadoImagineClipId): string {
  return clipId === "sky" ? "stills/sky.jpg" : "stills/shelter.svg";
}

function writeTornadoLocalMedia(): void {
  mkdirSync(TORNADO_CAPTION_DIR, { recursive: true });
  mkdirSync(path.join(TORNADO_DIR, "stills"), { recursive: true });
  mkdirSync(TORNADO_SOURCE_DIR, { recursive: true });
  mkdirSync(TORNADO_AUDIO_DIR, { recursive: true });
  mkdirSync(TORNADO_MUX_DIR, { recursive: true });
  for (const beat of TORNADO_BEATS) {
    const existing = path.join(TORNADO_CAPTION_DIR, `${beat.id}.vtt`);
    if (!existsSync(existing)) {
      writeFileSync(existing, vttFromNarration(beat.narration, VIDEO_DURATION_SECONDS));
    }
  }
  if (!existsSync(path.join(TORNADO_DIR, "manifest.json"))) {
    const manifest = emptyTornadoMediaManifest();
    const json = `${JSON.stringify(manifest, null, 2)}\n`;
    writeFileSync(path.join(TORNADO_DIR, "manifest.json"), json);
    writeFileSync(path.join(ROOT, "src", "lib", "lesson", "tornado-media-manifest.json"), json);
  }
  console.log(
    `Tornado local stills/captions ready. Paid generation: ${TORNADO_IMAGINE_CLIP_IDS.length} Imagine clips (${Object.keys(TORNADO_CLIP_PROMPTS).join(", ")}) and ${TORNADO_BEATS.length} TTS jobs. Scene map: ${JSON.stringify(TORNADO_SCENE_CLIP_SOURCE)}.`,
  );
}

function writeTornadoManifest(jobs: TornadoJobFile, hashes: Record<string, string>): void {
  const manifest = emptyTornadoMediaManifest();
  manifest.generatedAt = new Date().toISOString();
  let savedCount = 0;
  for (const clipId of TORNADO_IMAGINE_CLIP_IDS) {
    const job = jobs[clipId];
    const stillRel = tornadoStillFile(clipId);
    manifest.clips[clipId] = {
      requestId: job.requestId,
      sourceFile: job.sourceFile,
      stillFile: stillRel,
      status: job.status,
      diagnostic: job.diagnostic,
    };
    if (job.status === "saved") savedCount += 1;
  }
  for (const clip of narrationClips(TORNADO_BEATS)) {
    const visual = tornadoVisual(clip.scene);
    const audioRel = existsSync(path.join(TORNADO_AUDIO_DIR, `${clip.id}.mp3`)) ? `audio/${clip.id}.mp3` : null;
    const muxRel = existsSync(path.join(TORNADO_MUX_DIR, `${clip.id}.mp4`)) ? `muxed/${clip.id}.mp4` : null;
    const captionRel = existsSync(path.join(TORNADO_CAPTION_DIR, `${clip.id}.vtt`)) ? `captions/${clip.id}.vtt` : null;
    const stillRel = tornadoStillFile(visual);
    const keepDiagram = TORNADO_DIAGRAM_BEATS.has(clip.id);
    const expectedHash = narrationFingerprint(clip.text);
    const storedHash = hashes[clip.id] ?? null;
    const audioIsCurrent = Boolean(audioRel && storedHash === expectedHash);
    let muxStatus: "ready" | "audio-only" | "still-only" | "missing" = "still-only";
    let narrationStatus: "current" | "stale" | "missing" = "missing";
    let note =
      "On-screen teaching text is current. Tornado video and Grok Voice narration have not been generated.";
    if (audioRel && !audioIsCurrent) {
      narrationStatus = "stale";
      note =
        "On-screen teaching text is current. Existing voice audio is from a previous script and is not attached until you regenerate narration.";
    }
    if (audioIsCurrent && keepDiagram) {
      muxStatus = "audio-only";
      narrationStatus = "current";
      note =
        "Current narration is available. The labeled shelter diagram is the instructional visual. Generated footage is illustrative only.";
    } else if (audioIsCurrent && muxRel && !keepDiagram) {
      muxStatus = "ready";
      narrationStatus = "current";
      note =
        "Generated practice clip with current muxed narration. Not documentary footage. Shelter instructions stay in the sourced text and labeled diagram.";
    } else if (audioIsCurrent) {
      muxStatus = "audio-only";
      narrationStatus = "current";
      note = "Current narration is available. A labeled still is shown.";
    }
    manifest.beats[clip.id] = {
      video: audioIsCurrent && muxRel && !keepDiagram ? muxRel : null,
      audio: audioIsCurrent ? audioRel : null,
      captions: audioIsCurrent ? captionRel : null,
      still: stillRel,
      visualSource: visual,
      muxStatus,
      narrationStatus,
      narrationFingerprint: audioIsCurrent ? expectedHash : storedHash,
      note,
    };
  }
  manifest.videoStatus =
    savedCount === TORNADO_IMAGINE_CLIP_IDS.length ? "ready" : savedCount > 0 ? "partial" : "not-generated";
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(path.join(TORNADO_DIR, "manifest.json"), json);
  writeFileSync(path.join(ROOT, "src", "lib", "lesson", "tornado-media-manifest.json"), json);
}

async function pollAndSaveTo(
  apiKey: string,
  clipId: string,
  requestId: string,
  lessonDir: string,
): Promise<{ sourceFile: string } | { diagnostic: string }> {
  const deadline = Date.now() + 12 * 60 * 1000;
  while (Date.now() < deadline) {
    const response = await fetch(`${VIDEO_STATUS_URL}/${requestId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    if (!response.ok) {
      const code =
        payload && typeof payload === "object" && (payload as { error?: { code?: string } }).error?.code
          ? String((payload as { error: { code: string } }).error.code)
          : undefined;
      return { diagnostic: sanitizeDiagnostic({ httpStatus: response.status, code }) };
    }
    const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const status = typeof record.status === "string" ? record.status : "pending";
    if (status === "pending") {
      const progress = typeof record.progress === "number" ? ` ${record.progress}%` : "";
      console.log(`Polling ${clipId}${progress}…`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }
    if (status === "failed" || status === "expired") {
      const code =
        record.error && typeof record.error === "object" && typeof (record.error as { code?: unknown }).code === "string"
          ? (record.error as { code: string }).code
          : undefined;
      return { diagnostic: sanitizeDiagnostic({ status, code }) };
    }
    if (status === "done") {
      const video = record.video && typeof record.video === "object" ? (record.video as Record<string, unknown>) : {};
      const url = typeof video.url === "string" ? video.url : null;
      const moderated = video.respect_moderation === true;
      if (!url || !moderated) {
        return { diagnostic: sanitizeDiagnostic({ status: "done", code: "empty_or_unusable_video" }) };
      }
      const download = await fetch(url);
      if (!download.ok) {
        return { diagnostic: sanitizeDiagnostic({ httpStatus: download.status, status: "download_failed" }) };
      }
      const bytes = Buffer.from(await download.arrayBuffer());
      if (bytes.byteLength < 10_000) {
        return { diagnostic: sanitizeDiagnostic({ status: "done", code: "file_too_small" }) };
      }
      const sourceFile = `source/${clipId}.mp4`;
      writeFileSync(path.join(lessonDir, sourceFile), bytes);
      console.log(`Saved ${sourceFile} (${bytes.byteLength} bytes).`);
      return { sourceFile };
    }
    return { diagnostic: sanitizeDiagnostic({ status }) };
  }
  return { diagnostic: sanitizeDiagnostic({ status: "poll_timeout" }) };
}

async function generateTornadoClip(
  apiKey: string,
  clipId: TornadoImagineClipId,
  jobs: TornadoJobFile,
): Promise<string | null> {
  const sourcePath = path.join(TORNADO_SOURCE_DIR, `${clipId}.mp4`);
  if (existsSync(sourcePath)) {
    jobs[clipId] = {
      requestId: jobs[clipId].requestId,
      status: "saved",
      diagnostic: null,
      sourceFile: `source/${clipId}.mp4`,
    };
    writeTornadoJobs(jobs);
    console.log(`Skipping Imagine for tornado ${clipId}; source file already exists.`);
    return null;
  }
  if (jobs[clipId].status === "failed") {
    const diagnostic = jobs[clipId].diagnostic ?? "video_generation_failed";
    console.error(`Tornado ${clipId} previously failed (${diagnostic}). Not retrying in this run.`);
    return diagnostic;
  }
  let requestId = jobs[clipId].requestId;
  if (!requestId) {
    console.log(`Submitting Imagine job for tornado ${clipId}…`);
    const started = await startGeneration(apiKey, TORNADO_CLIP_PROMPTS[clipId]);
    if ("diagnostic" in started) {
      jobs[clipId] = { requestId: null, status: "failed", diagnostic: started.diagnostic, sourceFile: null };
      writeTornadoJobs(jobs);
      console.error(`Tornado ${clipId} failed: ${started.diagnostic}`);
      return started.diagnostic;
    }
    requestId = started.requestId;
    jobs[clipId] = { requestId, status: "pending", diagnostic: null, sourceFile: null };
    writeTornadoJobs(jobs);
  } else {
    console.log(`Polling existing tornado ${clipId} job…`);
  }
  const saved = await pollAndSaveTo(apiKey, clipId, requestId, TORNADO_DIR);
  if ("diagnostic" in saved) {
    jobs[clipId] = { requestId, status: "failed", diagnostic: saved.diagnostic, sourceFile: null };
    writeTornadoJobs(jobs);
    console.error(`Tornado ${clipId} failed: ${saved.diagnostic}`);
    return saved.diagnostic;
  }
  jobs[clipId] = { requestId, status: "saved", diagnostic: null, sourceFile: saved.sourceFile };
  writeTornadoJobs(jobs);
  return null;
}

async function generateTornadoPaidMedia(apiKey: string): Promise<void> {
  requireFfmpeg();
  mkdirSync(TORNADO_SOURCE_DIR, { recursive: true });
  mkdirSync(TORNADO_AUDIO_DIR, { recursive: true });
  mkdirSync(TORNADO_MUX_DIR, { recursive: true });
  mkdirSync(TORNADO_CAPTION_DIR, { recursive: true });
  const jobs = readTornadoJobs();
  const paidFailures: string[] = [];
  for (const clipId of TORNADO_IMAGINE_CLIP_IDS) {
    const failure = await generateTornadoClip(apiKey, clipId, jobs);
    if (failure) {
      paidFailures.push(`${clipId}: ${failure}`);
      console.error(`Stopping remaining Imagine jobs after tornado ${clipId} failed. TTS will still run. Report this error before any retry.`);
      break;
    }
  }

  const hashes = readTornadoHashes();
  for (const clip of narrationClips(TORNADO_BEATS)) {
    const expected = narrationFingerprint(clip.text);
    const audioPath = path.join(TORNADO_AUDIO_DIR, `${clip.id}.mp3`);
    const needsTts = !existsSync(audioPath) || hashes[clip.id] !== expected;
    if (!needsTts) {
      console.log(`Skipping unchanged tornado narration for ${clip.id}.`);
      continue;
    }
    const audioRel = await generateNarration(apiKey, clip.id, clip.text, true, TORNADO_DIR);
    if (!audioRel) {
      paidFailures.push(`${clip.id}: tts_failed`);
      console.error(`Stopping remaining TTS jobs after ${clip.id} failed. Report this error before any retry.`);
      break;
    }
    hashes[clip.id] = expected;
    writeTornadoHashes(hashes);
    const duration = probeDuration(path.join(TORNADO_DIR, audioRel));
    writeFileSync(path.join(TORNADO_CAPTION_DIR, `${clip.id}.vtt`), vttFromNarration(clip.text, duration));
    if (TORNADO_DIAGRAM_BEATS.has(clip.id)) {
      console.log(`Keeping labeled shelter diagram for ${clip.id}; not muxing Imagine footage as the instructional visual.`);
      continue;
    }
    const visual = tornadoVisual(clip.scene);
    const sourceRel = jobs[visual].sourceFile;
    const muxPath = path.join(TORNADO_MUX_DIR, `${clip.id}.mp4`);
    if (sourceRel && existsSync(path.join(TORNADO_DIR, sourceRel))) {
      const ok = muxNarration(path.join(TORNADO_DIR, sourceRel), path.join(TORNADO_DIR, audioRel), muxPath, duration);
      if (!ok) console.error(`${clip.id} mux failed: ffmpeg_error`);
    }
  }

  writeTornadoManifest(jobs, hashes);
  console.log("Tornado lesson media manifest saved.");
  if (paidFailures.length > 0) {
    throw new Error(`Tornado paid generation reported failures: ${paidFailures.join("; ")}`);
  }
}

function svgText(x: number, y: number, fill: string, size: number, text: string): string {
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-family="system-ui,sans-serif">${xmlSafeText(text)}</text>`;
}

function writeHomeFireStills(): void {
  mkdirSync(HOME_FIRE_STILL_DIR, { recursive: true });
  const room = [
    `<rect width="960" height="540" fill="#071018"/>`,
    `<rect x="40" y="40" width="880" height="460" fill="#121c30" stroke="#9aacbf" stroke-width="2"/>`,
    svgText(64, 88, "#f3d19a", 22, "Instructional still - not a live fire and not your house"),
    svgText(64, 150, "#f4f0e6", 32, "Ground-floor bedroom"),
    svgText(64, 200, "#c5cdd8", 22, "Fictional one-story house. Sound is not the only alarm signal."),
    svgText(64, 250, "#c5cdd8", 22, "Not a tornado shelter. Not a flood scene."),
    svgText(64, 430, "#9aacbf", 18, "Source: USFA home fire escape plans and Ready.gov home fires."),
  ].join("\n");
  const plan = [
    `<rect width="960" height="540" fill="#071018"/>`,
    svgText(40, 48, "#f3d19a", 20, "Labeled diagram - not a real house and not a certified route"),
    `<rect x="280" y="80" width="420" height="360" fill="#0b1220" stroke="#9aacbf" stroke-width="3"/>`,
    `<rect x="296" y="100" width="240" height="160" fill="#132033" stroke="#e8b86d" stroke-width="4"/>`,
    svgText(312, 140, "#f3d19a", 22, "Bedroom - you are here"),
    svgText(312, 176, "#c5cdd8", 18, "Hallway door: first way out"),
    svgText(312, 204, "#c5cdd8", 18, "Check the door before opening"),
    `<rect x="560" y="120" width="120" height="80" fill="#1c2b22" stroke="#9aacbf" stroke-width="3"/>`,
    svgText(572, 154, "#f3d19a", 18, "Window"),
    svgText(572, 182, "#f3d19a", 16, "second way"),
    `<rect x="296" y="300" width="388" height="120" fill="#121c30" stroke="#c5cdd8" stroke-width="3"/>`,
    svgText(312, 350, "#d6deea", 22, "Front of house: meeting place"),
    svgText(312, 386, "#9aacbf", 16, "Stay out. Call 9-1-1."),
    svgText(40, 140, "#d6deea", 20, "One-story house"),
    svgText(40, 172, "#d6deea", 20, "Ground-floor bedroom"),
    svgText(40, 500, "#9aacbf", 18, "USFA: two ways out of every room. This is not your floor plan."),
  ].join("\n");
  const yard = [
    `<rect width="960" height="540" fill="#071018"/>`,
    `<rect x="40" y="40" width="880" height="460" fill="#121c30" stroke="#9aacbf" stroke-width="2"/>`,
    svgText(64, 88, "#f3d19a", 22, "Instructional still - outside meeting place, not a live fire"),
    svgText(64, 160, "#f4f0e6", 32, "Meet in front of this house"),
    svgText(64, 220, "#c5cdd8", 22, "Stay outside. Call 9-1-1. Do not go back in."),
    svgText(64, 280, "#c5cdd8", 22, "Tell the operator if someone is still inside."),
    svgText(64, 430, "#9aacbf", 18, "Source: USFA escape plans and Ready.gov home fires."),
  ].join("\n");
  writeFileSync(path.join(HOME_FIRE_STILL_DIR, "room.svg"), svgDocument(room));
  writeFileSync(path.join(HOME_FIRE_STILL_DIR, "escape-plan.svg"), svgDocument(plan));
  writeFileSync(path.join(HOME_FIRE_STILL_DIR, "yard.svg"), svgDocument(yard));
}

function emptyHomeFireJobs(): HomeFireJobFile {
  return {
    room: { requestId: null, status: "missing", diagnostic: null, sourceFile: null },
    yard: { requestId: null, status: "missing", diagnostic: null, sourceFile: null },
  };
}

function readHomeFireJobs(): HomeFireJobFile {
  if (!existsSync(HOME_FIRE_JOBS_PATH)) return emptyHomeFireJobs();
  try {
    const parsed = JSON.parse(readFileSync(HOME_FIRE_JOBS_PATH, "utf8")) as Partial<HomeFireJobFile>;
    return { ...emptyHomeFireJobs(), ...parsed };
  } catch {
    return emptyHomeFireJobs();
  }
}

function writeHomeFireJobs(jobs: HomeFireJobFile): void {
  writeFileSync(HOME_FIRE_JOBS_PATH, `${JSON.stringify(jobs, null, 2)}\n`);
}

function readHomeFireHashes(): Record<string, string> {
  if (!existsSync(HOME_FIRE_HASH_PATH)) return {};
  try {
    const parsed = JSON.parse(readFileSync(HOME_FIRE_HASH_PATH, "utf8")) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeHomeFireHashes(hashes: Record<string, string>): void {
  writeFileSync(HOME_FIRE_HASH_PATH, `${JSON.stringify(hashes, null, 2)}\n`);
}

function rewriteCaptionsFromExistingAudio(
  lessonDir: string,
  beats: { id: string; narration: string }[],
): void {
  const captionDir = path.join(lessonDir, "captions");
  const audioDir = path.join(lessonDir, "audio");
  mkdirSync(captionDir, { recursive: true });
  for (const beat of beats) {
    const audioPath = path.join(audioDir, `${beat.id}.mp3`);
    const duration = existsSync(audioPath) ? probeDuration(audioPath) : VIDEO_DURATION_SECONDS;
    writeFileSync(path.join(captionDir, `${beat.id}.vtt`), vttFromNarration(beat.narration, duration));
    console.log(`Rewrote captions/${beat.id}.vtt using ${existsSync(audioPath) ? "existing audio" : "default"} duration ${duration.toFixed(3)}s.`);
  }
}

function homeFireVisual(scene: string): HomeFireImagineClipId {
  return scene === "fire-outside" ? "yard" : "room";
}

function writeHomeFireLocalMedia(): void {
  writeHomeFireStills();
  mkdirSync(HOME_FIRE_CAPTION_DIR, { recursive: true });
  mkdirSync(HOME_FIRE_SOURCE_DIR, { recursive: true });
  mkdirSync(HOME_FIRE_AUDIO_DIR, { recursive: true });
  mkdirSync(HOME_FIRE_MUX_DIR, { recursive: true });
  for (const beat of HOME_FIRE_BEATS) {
    writeFileSync(path.join(HOME_FIRE_CAPTION_DIR, `${beat.id}.vtt`), vttFromNarration(beat.narration, VIDEO_DURATION_SECONDS));
  }
  const manifest = emptyHomeFireMediaManifest();
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(path.join(HOME_FIRE_DIR, "manifest.json"), json);
  writeFileSync(path.join(ROOT, "src", "lib", "lesson", "home-fire-media-manifest.json"), json);
  console.log(
    `Home-fire local stills and captions saved. Paid generation: ${HOME_FIRE_IMAGINE_CLIP_IDS.length} Imagine clips (${Object.keys(HOME_FIRE_CLIP_PROMPTS).join(", ")}) and ${HOME_FIRE_BEATS.length} TTS jobs.`,
  );
}

function writeHomeFireManifest(jobs: HomeFireJobFile, hashes: Record<string, string>): void {
  const manifest = emptyHomeFireMediaManifest();
  manifest.generatedAt = new Date().toISOString();
  let savedCount = 0;
  for (const clipId of HOME_FIRE_IMAGINE_CLIP_IDS) {
    const job = jobs[clipId];
    const stillRel = clipId === "yard" ? "stills/yard.svg" : "stills/room.svg";
    manifest.clips[clipId] = {
      requestId: job.requestId,
      sourceFile: job.sourceFile,
      stillFile: stillRel,
      status: job.status,
      diagnostic: job.diagnostic,
    };
    if (job.status === "saved") savedCount += 1;
  }
  for (const clip of narrationClips(HOME_FIRE_BEATS)) {
    const visual = homeFireVisual(clip.scene);
    const audioRel = existsSync(path.join(HOME_FIRE_AUDIO_DIR, `${clip.id}.mp3`)) ? `audio/${clip.id}.mp3` : null;
    const muxRel = existsSync(path.join(HOME_FIRE_MUX_DIR, `${clip.id}.mp4`)) ? `muxed/${clip.id}.mp4` : null;
    const captionRel = existsSync(path.join(HOME_FIRE_CAPTION_DIR, `${clip.id}.vtt`)) ? `captions/${clip.id}.vtt` : null;
    const keepDiagram = HOME_FIRE_DIAGRAM_BEATS.has(clip.id);
    const stillRel = keepDiagram ? "stills/escape-plan.svg" : homeFireStillForScene(clip.scene);
    const expectedHash = narrationFingerprint(clip.text);
    const storedHash = hashes[clip.id] ?? null;
    const audioIsCurrent = Boolean(audioRel && storedHash === expectedHash);
    let muxStatus: "ready" | "audio-only" | "still-only" | "missing" = "still-only";
    let narrationStatus: "current" | "stale" | "missing" = "missing";
    let note = "On-screen teaching text is current. Home-fire video and Grok Voice narration have not been generated.";
    if (audioRel && !audioIsCurrent) {
      narrationStatus = "stale";
      note =
        "On-screen teaching text is current. Existing voice audio is from a previous script and is not attached until you regenerate narration.";
    }
    if (audioIsCurrent && keepDiagram) {
      muxStatus = "audio-only";
      narrationStatus = "current";
      note =
        "Current narration is available. The labeled escape diagram is the instructional visual. Generated footage is illustrative only.";
    } else if (audioIsCurrent && muxRel && !keepDiagram) {
      muxStatus = "ready";
      narrationStatus = "current";
      note =
        "Generated practice clip with current muxed narration. Not documentary footage. Escape instructions stay in the sourced text and labeled diagram.";
    } else if (audioIsCurrent) {
      muxStatus = "audio-only";
      narrationStatus = "current";
      note = "Current narration is available. A labeled still is shown.";
    }
    manifest.beats[clip.id] = {
      video: audioIsCurrent && muxRel && !keepDiagram ? muxRel : null,
      audio: audioIsCurrent ? audioRel : null,
      captions: audioIsCurrent ? captionRel : null,
      still: stillRel,
      visualSource: visual,
      muxStatus,
      narrationStatus,
      narrationFingerprint: audioIsCurrent ? expectedHash : storedHash,
      note,
    };
  }
  manifest.videoStatus =
    savedCount === HOME_FIRE_IMAGINE_CLIP_IDS.length ? "ready" : savedCount > 0 ? "partial" : "not-generated";
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(path.join(HOME_FIRE_DIR, "manifest.json"), json);
  writeFileSync(path.join(ROOT, "src", "lib", "lesson", "home-fire-media-manifest.json"), json);
}

async function generateHomeFireClip(
  apiKey: string,
  clipId: HomeFireImagineClipId,
  jobs: HomeFireJobFile,
): Promise<string | null> {
  const sourcePath = path.join(HOME_FIRE_SOURCE_DIR, `${clipId}.mp4`);
  if (existsSync(sourcePath)) {
    jobs[clipId] = {
      requestId: jobs[clipId].requestId,
      status: "saved",
      diagnostic: null,
      sourceFile: `source/${clipId}.mp4`,
    };
    writeHomeFireJobs(jobs);
    console.log(`Skipping Imagine for home-fire ${clipId}; source file already exists.`);
    return null;
  }
  if (jobs[clipId].status === "failed") {
    const diagnostic = jobs[clipId].diagnostic ?? "video_generation_failed";
    console.error(`Home-fire ${clipId} previously failed (${diagnostic}). Not retrying in this run.`);
    return diagnostic;
  }
  let requestId = jobs[clipId].requestId;
  if (!requestId) {
    console.log(`Submitting Imagine job for home-fire ${clipId}…`);
    const started = await startGeneration(apiKey, HOME_FIRE_CLIP_PROMPTS[clipId]);
    if ("diagnostic" in started) {
      jobs[clipId] = { requestId: null, status: "failed", diagnostic: started.diagnostic, sourceFile: null };
      writeHomeFireJobs(jobs);
      console.error(`Home-fire ${clipId} failed: ${started.diagnostic}`);
      return started.diagnostic;
    }
    requestId = started.requestId;
    jobs[clipId] = { requestId, status: "pending", diagnostic: null, sourceFile: null };
    writeHomeFireJobs(jobs);
  } else {
    console.log(`Polling existing home-fire ${clipId} job…`);
  }
  const saved = await pollAndSaveTo(apiKey, clipId, requestId, HOME_FIRE_DIR);
  if ("diagnostic" in saved) {
    jobs[clipId] = { requestId, status: "failed", diagnostic: saved.diagnostic, sourceFile: null };
    writeHomeFireJobs(jobs);
    console.error(`Home-fire ${clipId} failed: ${saved.diagnostic}`);
    return saved.diagnostic;
  }
  jobs[clipId] = { requestId, status: "saved", diagnostic: null, sourceFile: saved.sourceFile };
  writeHomeFireJobs(jobs);
  return null;
}

async function generateHomeFirePaidMedia(apiKey: string): Promise<void> {
  requireFfmpeg();
  mkdirSync(HOME_FIRE_SOURCE_DIR, { recursive: true });
  mkdirSync(HOME_FIRE_AUDIO_DIR, { recursive: true });
  mkdirSync(HOME_FIRE_MUX_DIR, { recursive: true });
  mkdirSync(HOME_FIRE_CAPTION_DIR, { recursive: true });
  const jobs = readHomeFireJobs();
  const paidFailures: string[] = [];
  for (const clipId of HOME_FIRE_IMAGINE_CLIP_IDS) {
    const failure = await generateHomeFireClip(apiKey, clipId, jobs);
    if (failure) {
      paidFailures.push(`${clipId}: ${failure}`);
      console.error(`Stopping remaining Imagine jobs after home-fire ${clipId} failed. TTS will still run. Report this error before any retry.`);
      break;
    }
  }
  const hashes = readHomeFireHashes();
  for (const clip of narrationClips(HOME_FIRE_BEATS)) {
    const expected = narrationFingerprint(clip.text);
    const audioPath = path.join(HOME_FIRE_AUDIO_DIR, `${clip.id}.mp3`);
    const needsTts = !existsSync(audioPath) || hashes[clip.id] !== expected;
    if (!needsTts) {
      console.log(`Skipping unchanged home-fire narration for ${clip.id}.`);
      continue;
    }
    const audioRel = await generateNarration(apiKey, clip.id, clip.text, true, HOME_FIRE_DIR);
    if (!audioRel) {
      paidFailures.push(`${clip.id}: tts_failed`);
      console.error(`Stopping remaining TTS jobs after ${clip.id} failed. Report this error before any retry.`);
      break;
    }
    hashes[clip.id] = expected;
    writeHomeFireHashes(hashes);
    const duration = probeDuration(path.join(HOME_FIRE_DIR, audioRel));
    writeFileSync(path.join(HOME_FIRE_CAPTION_DIR, `${clip.id}.vtt`), vttFromNarration(clip.text, duration));
    if (HOME_FIRE_DIAGRAM_BEATS.has(clip.id)) {
      console.log(`Keeping labeled escape diagram for ${clip.id}; not muxing Imagine footage as the instructional visual.`);
      continue;
    }
    const visual = homeFireVisual(clip.scene);
    const sourceRel = jobs[visual].sourceFile;
    const muxPath = path.join(HOME_FIRE_MUX_DIR, `${clip.id}.mp4`);
    if (sourceRel && existsSync(path.join(HOME_FIRE_DIR, sourceRel))) {
      const ok = muxNarration(path.join(HOME_FIRE_DIR, sourceRel), path.join(HOME_FIRE_DIR, audioRel), muxPath, duration);
      if (!ok) console.error(`${clip.id} mux failed: ffmpeg_error`);
    }
  }
  writeHomeFireManifest(jobs, hashes);
  console.log("Home-fire lesson media manifest saved.");
  if (paidFailures.length > 0) {
    throw new Error(`Home-fire paid generation reported failures: ${paidFailures.join("; ")}`);
  }
}

async function main(): Promise<void> {
  loadEnvLocal();
  if (process.argv.includes("--captions-only")) {
    requireFfmpeg();
    if (selectedLessonId() === HOME_FIRE_LESSON_ID) {
      rewriteCaptionsFromExistingAudio(HOME_FIRE_DIR, HOME_FIRE_BEATS);
      console.log("Home-fire captions rewritten from existing audio. No Imagine or TTS calls.");
      return;
    }
    if (selectedLessonId() === TORNADO_LESSON_ID) {
      rewriteCaptionsFromExistingAudio(TORNADO_DIR, TORNADO_BEATS);
      console.log("Tornado captions rewritten from existing audio. No Imagine or TTS calls.");
      return;
    }
    throw new Error("Use --lesson home-fire-1 or --lesson tornado-home-1 with --captions-only.");
  }
  if (selectedLessonId() === TORNADO_LESSON_ID) {
    writeTornadoLocalMedia();
    if (!process.argv.includes("--confirm-paid")) {
      console.log(
        `No Imagine or TTS calls. Later paid command: npm run generate:lesson-media -- --lesson tornado-home-1 --confirm-paid (${TORNADO_IMAGINE_CLIP_IDS.length} video, ${TORNADO_BEATS.length} TTS).`,
      );
      return;
    }
    const apiKey = process.env.XAI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("XAI_API_KEY is missing. Add it to the environment or .env.local.");
    }
    await generateTornadoPaidMedia(apiKey);
    return;
  }
  if (selectedLessonId() === HOME_FIRE_LESSON_ID) {
    writeHomeFireLocalMedia();
    if (!process.argv.includes("--confirm-paid")) {
      console.log(
        `No Imagine or TTS calls. Later paid command: npm run generate:lesson-media -- --lesson home-fire-1 --confirm-paid (${HOME_FIRE_IMAGINE_CLIP_IDS.length} video, ${HOME_FIRE_BEATS.length} TTS).`,
      );
      return;
    }
    const apiKey = process.env.XAI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("XAI_API_KEY is missing. Add it to the environment or .env.local.");
    }
    await generateHomeFirePaidMedia(apiKey);
    return;
  }
  const narrationOnly = process.argv.includes("--narration-only");
  mkdirSync(SOURCE_DIR, { recursive: true });
  mkdirSync(AUDIO_DIR, { recursive: true });
  mkdirSync(MUX_DIR, { recursive: true });
  mkdirSync(CAPTION_DIR, { recursive: true });
  mkdirSync(STILL_DIR, { recursive: true });

  const jobs = readJobs();
  if (process.argv.includes("--manifest-only")) {
    writeManifest(jobs, readHashes());
    console.log("Lesson media manifest saved (no API calls).");
    return;
  }

  requireFfmpeg();
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("XAI_API_KEY is missing. Add it to the environment or .env.local.");
  }
  if (narrationOnly) {
    console.log("Skipping Imagine clip generation (--narration-only).");
    for (const clipId of IMAGINE_CLIP_IDS) {
      const sourcePath = path.join(SOURCE_DIR, `${clipId}.mp4`);
      if (existsSync(sourcePath)) {
        jobs[clipId] = {
          requestId: jobs[clipId].requestId,
          status: "saved",
          diagnostic: null,
          sourceFile: `source/${clipId}.mp4`,
        };
      }
    }
    writeJobs(jobs);
  } else {
    for (const clipId of IMAGINE_CLIP_IDS) {
      await generateClip(apiKey, clipId, jobs);
    }
  }

  const hashes = readHashes();
  for (const clip of narrationClips()) {
    const expected = narrationFingerprint(clip.text);
    const audioPath = path.join(AUDIO_DIR, `${clip.id}.mp3`);
    const needsTts = !existsSync(audioPath) || hashes[clip.id] !== expected;
    if (!needsTts) {
      console.log(`Skipping unchanged narration for ${clip.id}.`);
      continue;
    }
    const audioRel = await generateNarration(apiKey, clip.id, clip.text, true);
    if (!audioRel) continue;
    hashes[clip.id] = expected;
    writeHashes(hashes);
    const duration = probeDuration(path.join(LESSON_DIR, audioRel));
    writeFileSync(path.join(CAPTION_DIR, `${clip.id}.vtt`), vttFromNarration(clip.text, duration));
    const visual = hurricaneVisual(clip.scene);
    const sourceRel = jobs[visual].sourceFile;
    const muxPath = path.join(MUX_DIR, `${clip.id}.mp4`);
    if (sourceRel && existsSync(path.join(LESSON_DIR, sourceRel))) {
      const ok = muxNarration(path.join(LESSON_DIR, sourceRel), path.join(LESSON_DIR, audioRel), muxPath, duration);
      if (!ok) console.error(`${clip.id} mux failed: ffmpeg_error`);
    }
  }

  writeManifest(jobs, hashes);
  console.log("Lesson media manifest saved.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Lesson media generation failed.";
  console.error(message);
  process.exit(1);
});
