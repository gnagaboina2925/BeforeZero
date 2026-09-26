"use client";

import type { Answers, HouseholdId, InterpretError, Question } from "@/lib/types";
import { isStaleVoiceResult } from "@/lib/voice";
import { useEffect, useRef, useState } from "react";

const questionAudioCache = new Map<string, Blob>();

function cacheKey(household: HouseholdId, questionId: string): string {
  return `${household}:${questionId}`;
}

function voiceFailureMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const error = (payload as { error?: InterpretError }).error;
  if (!error?.message) return fallback;
  return error.diagnostic ? `${error.message} [${error.diagnostic}]` : error.message;
}

interface QuestionListenProps {
  household: HouseholdId;
  question: Question;
  priorAnswers: Answers;
}

export function QuestionListen({
  household,
  question,
  priorAnswers,
}: QuestionListenProps) {
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

  function stopAndClearPlaying() {
    stopPlayback();
    setPlaying(false);
  }

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      inFlightRef.current = false;
      stopPlayback();
    };
  }, [question.id, household]);

  function playBlob(blob: Blob) {
    stopPlayback();
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      setPlaying(false);
    };
    audio.onerror = () => {
      setPlaying(false);
      setError("Question audio could not be played. You can still read the question.");
    };
    setPlaying(true);
    void audio.play().catch(() => {
      setPlaying(false);
      setError("Question audio could not be played. You can still read the question.");
    });
  }

  async function listen() {
    if (loading || inFlightRef.current) return;
    const key = cacheKey(household, question.id);
    const cached = questionAudioCache.get(key);
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
        body: JSON.stringify({
          household,
          stepId: question.stepId,
          priorAnswers,
        }),
      });

      if (isStaleVoiceResult(generation, generationRef.current)) return;

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        setError(
          voiceFailureMessage(
            payload,
            "Question audio is unavailable right now. You can still read the question.",
          ),
        );
        return;
      }

      const blob = await response.blob();
      if (isStaleVoiceResult(generation, generationRef.current)) return;
      if (blob.size === 0) {
        setError("Question audio is unavailable right now. You can still read the question.");
        return;
      }

      questionAudioCache.set(key, blob);
      playBlob(blob);
    } catch {
      if (isStaleVoiceResult(generation, generationRef.current)) return;
      setError("Question audio is unavailable right now. You can still read the question.");
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
          <button type="button" className="btn-ghost" onClick={stopAndClearPlaying}>
            Stop
          </button>
        ) : (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              void listen();
            }}
            disabled={loading}
          >
            {loading ? "Preparing audio…" : "Listen to question"}
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
