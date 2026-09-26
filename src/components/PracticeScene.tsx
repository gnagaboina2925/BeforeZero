"use client";

import {
  GROK_IMAGINE_CREDIT,
  SCENE_NOT_YOUR_HOME,
  type SceneId,
  type SceneManifest,
} from "@/lib/sceneAssets";
import rawManifest from "@/lib/scene-manifest.json";
import { useState } from "react";

const sceneManifest = rawManifest as SceneManifest;

interface PracticeSceneProps {
  sceneId: SceneId;
}

export function PracticeScene({ sceneId }: PracticeSceneProps) {
  const file = sceneManifest.assets[sceneId]?.file;
  const src = file ? `/scenes/${file}` : null;
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <figure className="practice-scene">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="practice-scene-image"
          src={src ?? ""}
          alt={SCENE_NOT_YOUR_HOME}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={`practice-scene-fallback practice-scene-fallback-${sceneId}`}
          aria-hidden="true"
        />
      )}
      <figcaption className="practice-scene-caption">
        <span>{SCENE_NOT_YOUR_HOME}</span>
        {showImage ? <span className="practice-scene-credit">{GROK_IMAGINE_CREDIT}</span> : null}
      </figcaption>
    </figure>
  );
}
