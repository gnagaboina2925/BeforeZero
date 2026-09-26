import { isHouseholdId, isStepId } from "./interpret.ts";
import { getQuestion, parseScenarioPriorAnswers, spokenQuestionText } from "./scenario.ts";
import type { HouseholdId, Question, StepId } from "./types.ts";

export const MAX_VOICE_BYTES = 5 * 1024 * 1024;
export const MAX_RECORDING_SECONDS = 30;
export const STT_URL = "https://api.x.ai/v1/stt";
export const TTS_URL = "https://api.x.ai/v1/tts";
export const DEFAULT_STT_MODEL = "grok-voice-transcribe-2.0";
export const DEFAULT_TTS_VOICE = "eve";
export const VOICE_TIMEOUT_MS = 20_000;

const ALLOWED_AUDIO_BASE_TYPES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/aac",
  "audio/m4a",
  "audio/x-m4a",
]);

export function normalizeAudioType(type: string): string {
  return type.split(";")[0].trim().toLowerCase();
}

export function isAllowedAudioType(type: string): boolean {
  const base = normalizeAudioType(type);
  return base.length > 0 && ALLOWED_AUDIO_BASE_TYPES.has(base);
}

export function filenameForAudioType(type: string): string {
  const base = normalizeAudioType(type);
  if (base.includes("mp4") || base.includes("m4a")) return "answer.m4a";
  if (base.includes("ogg")) return "answer.ogg";
  if (base.includes("mpeg") || base.includes("mp3")) return "answer.mp3";
  if (base.includes("wav") || base.includes("wave")) return "answer.wav";
  if (base.includes("aac")) return "answer.aac";
  return "answer.webm";
}

export function validateVoiceUpload(file: {
  size: number;
  type: string;
  name?: string;
}): { ok: true } | { ok: false; message: string } {
  if (!file.size || file.size <= 0) {
    return { ok: false, message: "That recording was empty." };
  }
  if (file.size > MAX_VOICE_BYTES) {
    return { ok: false, message: "Keep recordings under 5 MB." };
  }
  if (isAllowedAudioType(file.type)) {
    return { ok: true };
  }
  const name = file.name ?? "";
  if (/\.(webm|ogg|opus|mp4|m4a|mp3|wav|aac)$/i.test(name)) {
    return { ok: true };
  }
  return { ok: false, message: "That audio format isn't supported." };
}

export function readTranscriptText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const text = (payload as Record<string, unknown>).text;
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const MAX_NARRATION_LENGTH = 2000;

export function parseVoiceContext(
  body: unknown,
):
  | { ok: true; household: HouseholdId; stepId: StepId; question: Question; spokenText: string }
  | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Send a JSON object with the rehearsal step." };
  }
  const record = body as Record<string, unknown>;
  if (!isHouseholdId(record.household)) {
    return { ok: false, message: "Choose a valid household type." };
  }
  if (!isStepId(record.stepId)) {
    return { ok: false, message: "That rehearsal step is not recognized." };
  }
  const priorAnswers = parseScenarioPriorAnswers(record.stepId, record.priorAnswers);
  const question = getQuestion(record.stepId, record.household, priorAnswers);
  return {
    ok: true,
    household: record.household,
    stepId: record.stepId,
    question,
    spokenText: spokenQuestionText(question),
  };
}

export function parseSpeakRequest(
  body: unknown,
): { ok: true; spokenText: string } | { ok: false; message: string } {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.text === "string") {
      const spokenText = record.text.trim();
      if (!spokenText) {
        return { ok: false, message: "Include text to speak." };
      }
      if (spokenText.length > MAX_NARRATION_LENGTH) {
        return { ok: false, message: "Keep narration shorter." };
      }
      return { ok: true, spokenText };
    }
  }
  const parsed = parseVoiceContext(body);
  if (!parsed.ok) return parsed;
  return { ok: true, spokenText: parsed.spokenText };
}

export function sttModel(): string {
  return process.env.XAI_STT_MODEL?.trim() || DEFAULT_STT_MODEL;
}

export function ttsVoice(): string {
  return process.env.XAI_TTS_VOICE?.trim() || DEFAULT_TTS_VOICE;
}

export function isStaleVoiceResult(startedGeneration: number, currentGeneration: number): boolean {
  return startedGeneration !== currentGeneration;
}
