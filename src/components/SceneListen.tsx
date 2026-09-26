"use client";

import { isStaleVoiceResult } from "@/lib/voice";
import type { InterpretError } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

const narrationCache = new Map<string, Blob>();

function voiceFailureMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const error = (payload as { error?: InterpretError }).error;
  if (!error?.message) return fallback;
  return error.diagnostic ? `${error.message} [${error.diagnostic}]` : error.message;
}

interface SceneListenProps {
  cacheKey: string;
  narration: string;
  muted: boolean;
  disabled?: boolean;
}

export function SceneListen({ cacheKey, narration, muted, disabled }: SceneListenProps) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const inFlightRef = useRef(false);

  function stopPlayback() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    audioRef.current = null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      inFlightRef.current = false;
      stopPlayback();
    };
  }, [cacheKey]);

  function playBlob(blob: Blob) {
    stopPlayback();
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.onerror = () => {
      setPlaying(false);
      setError("Scene audio could not be played. You can still read the scene.");
    };
    setPlaying(true);
    void audio.play().catch(() => {
      setPlaying(false);
      setError("Scene audio could not be played. You can still read the scene.");
    });
  }

  async function listen() {
    if (disabled || loading || inFlightRef.current) return;
    if (muted) {
      setError("Unmute to hear the scene.");
      return;
    }
    const cached = narrationCache.get(cacheKey);
    if (cached) {
      playBlob(cached);
      return;
    }

    const generation = generationRef.current;
    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: narration }),
      });

      if (isStaleVoiceResult(generation, generationRef.current)) return;

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        setError(
          voiceFailureMessage(payload, "Scene audio is unavailable right now. You can still read the scene."),
        );
        return;
      }

      const blob = await response.blob();
      if (isStaleVoiceResult(generation, generationRef.current)) return;
      if (blob.size === 0) {
        setError("Scene audio is unavailable right now. You can still read the scene.");
        return;
      }

      narrationCache.set(cacheKey, blob);
      playBlob(blob);
    } catch {
      if (isStaleVoiceResult(generation, generationRef.current)) return;
      setError("Scene audio is unavailable right now. You can still read the scene.");
    } finally {
      if (generation === generationRef.current) {
        inFlightRef.current = false;
        setLoading(false);
      }
    }
  }

  return (
    <div className="voice-block">
      <div className="voice-row">
        {playing ? (
          <button type="button" className="btn-ghost" onClick={() => { stopPlayback(); setPlaying(false); }}>
            Stop
          </button>
        ) : (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              void listen();
            }}
            disabled={disabled || loading}
          >
            {loading ? "Preparing audio…" : "Hear scene"}
          </button>
        )}
      </div>
      {error ? (
        <p className="grok-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
