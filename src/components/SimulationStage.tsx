"use client";

import {
  GROK_IMAGINE_CREDIT,
  SCENE_NOT_YOUR_HOME,
  type SceneManifest,
} from "@/lib/sceneAssets";
import rawManifest from "@/lib/scene-manifest.json";
import type { LightingSource } from "@/lib/simulation/types";
import { useState } from "react";

const sceneManifest = rawManifest as SceneManifest;

interface SimulationStageProps {
  lighting: LightingSource;
}

export function SimulationStage({ lighting }: SimulationStageProps) {
  const file = sceneManifest.assets["outage-room"]?.file;
  const src = file ? `/scenes/${file}` : null;
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <figure className={`sim-stage lighting-${lighting}`}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="sim-stage-image"
          src={src ?? ""}
          alt={SCENE_NOT_YOUR_HOME}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="sim-stage-fallback" aria-hidden="true" />
      )}
      <div className="sim-dim" aria-hidden="true" />
      <div className="sim-light" aria-hidden="true" />
      <figcaption className="sr-only">
        {SCENE_NOT_YOUR_HOME}
        {showImage ? ` ${GROK_IMAGINE_CREDIT}` : ""}
      </figcaption>
    </figure>
  );
}
