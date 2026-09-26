import { mkdir, readdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  DEFAULT_XAI_IMAGE_MODEL,
  detectImageExtension,
  existingSceneFile,
  IMAGE_GENERATIONS_URL,
  SCENE_ASPECT_RATIO,
  SCENE_IDS,
  SCENE_PROMPTS,
  type SceneId,
  type SceneManifest,
} from "../src/lib/sceneAssets.ts";

const ROOT = process.cwd();
const SCENES_DIR = path.join(ROOT, "public", "scenes");
const PUBLIC_MANIFEST = path.join(SCENES_DIR, "manifest.json");
const SRC_MANIFEST = path.join(ROOT, "src", "lib", "scene-manifest.json");

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

function configuredImageModel(): string {
  return process.env.XAI_IMAGE_MODEL?.trim() || DEFAULT_XAI_IMAGE_MODEL;
}

async function writeManifest(manifest: SceneManifest): Promise<void> {
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  await writeFile(PUBLIC_MANIFEST, json, "utf8");
  await writeFile(SRC_MANIFEST, json, "utf8");
}

async function generateScene(sceneId: SceneId, apiKey: string, model: string): Promise<string> {
  const response = await fetch(IMAGE_GENERATIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: SCENE_PROMPTS[sceneId],
      n: 1,
      aspect_ratio: SCENE_ASPECT_RATIO,
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    throw new Error(`Image generation failed for ${sceneId} (HTTP ${response.status}).`);
  }

  const payload = (await response.json()) as {
    data?: Array<{ b64_json?: string }>;
  };
  const encoded = payload.data?.[0]?.b64_json;
  if (!encoded) {
    throw new Error(`Image generation returned no base64 data for ${sceneId}.`);
  }

  const bytes = Buffer.from(encoded, "base64");
  const extension = detectImageExtension(bytes);
  const fileName = `${sceneId}.${extension}`;
  await writeFile(path.join(SCENES_DIR, fileName), bytes);
  return fileName;
}

async function main(): Promise<void> {
  loadEnvLocal();
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("XAI_API_KEY is missing. Add it to the environment or .env.local.");
  }

  await mkdir(SCENES_DIR, { recursive: true });
  const existingNames = await readdir(SCENES_DIR);
  const model = configuredImageModel();
  const assets: SceneManifest["assets"] = {};
  let generatedAny = false;

  for (const sceneId of SCENE_IDS) {
    const already = existingSceneFile(existingNames, sceneId);
    if (already) {
      console.log(`Skipping ${sceneId}; ${already} already exists.`);
      assets[sceneId] = {
        id: sceneId,
        file: already,
        prompt: SCENE_PROMPTS[sceneId],
      };
      continue;
    }

    console.log(`Generating ${sceneId}…`);
    const file = await generateScene(sceneId, apiKey, model);
    existingNames.push(file);
    generatedAny = true;
    assets[sceneId] = {
      id: sceneId,
      file,
      prompt: SCENE_PROMPTS[sceneId],
    };
  }

  const manifest: SceneManifest = {
    model: generatedAny || Object.keys(assets).length === SCENE_IDS.length ? model : null,
    generatedAt: new Date().toISOString(),
    aspectRatio: SCENE_ASPECT_RATIO,
    assets,
  };
  await writeManifest(manifest);
  console.log("Scene manifest saved.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Scene generation failed.";
  console.error(message);
  process.exit(1);
});
