import type { Question } from "./types.ts";

export const DEFAULT_XAI_IMAGE_MODEL = "grok-imagine-image-2.0";
export const IMAGE_GENERATIONS_URL = "https://api.x.ai/v1/images/generations";
export const SCENE_ASPECT_RATIO = "16:9";
export const GROK_IMAGINE_CREDIT = "Illustration generated with Grok Imagine";
export const SCENE_NOT_YOUR_HOME =
  "Illustrated practice scene — not a depiction of your home.";

export const SCENE_IDS = ["outage-room", "phone-backup"] as const;
export type SceneId = (typeof SCENE_IDS)[number];

export const SCENE_PROMPTS: Record<SceneId, string> = {
  "outage-room":
    "A calm apartment living room during a nighttime power outage, unlit electric fixtures, soft moonlight through a window, midnight navy palette, cinematic editorial illustration, no people, no flames, no text.",
  "phone-backup":
    "Close-up of a phone casting a small pool of light on a table in a dark apartment, navy and amber palette, cinematic editorial illustration, no people, no flames, no readable screen text, no battery percentage, no text overlay.",
};

export interface SceneAssetRecord {
  id: SceneId;
  file: string;
  prompt: string;
}

export interface SceneManifest {
  model: string | null;
  generatedAt: string | null;
  aspectRatio: string;
  assets: Partial<Record<SceneId, SceneAssetRecord>>;
}

export const EMPTY_SCENE_MANIFEST: SceneManifest = {
  model: null,
  generatedAt: null,
  aspectRatio: SCENE_ASPECT_RATIO,
  assets: {},
};

export function sceneIdForQuestion(question: Question): SceneId {
  return question.id === "backup-phone-battery" ? "phone-backup" : "outage-room";
}

export function detectImageExtension(bytes: Uint8Array): string {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return "gif";
  }
  return "jpg";
}

export function existingSceneFile(
  files: string[],
  sceneId: SceneId,
): string | null {
  const match = files.find((name) => {
    const lower = name.toLowerCase();
    return (
      lower.startsWith(`${sceneId}.`) &&
      !lower.endsWith(".json") &&
      !lower.endsWith(".txt")
    );
  });
  return match ?? null;
}
