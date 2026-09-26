"use client";

import { MAX_RECORDING_SECONDS, isStaleVoiceResult } from "@/lib/voice";
import { MAX_TYPED_ANSWER_LENGTH, type InterpretError } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

const RECORDER_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

function pickRecorderMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  const supported = RECORDER_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
  if (supported) return supported;
  return "";
}

function voiceFailureMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const error = (payload as { error?: InterpretError }).error;
  if (!error?.message) return fallback;
  return error.diagnostic ? `${error.message} [${error.diagnostic}]` : error.message;
}

interface SpeakAnswerProps {
  questionId: string;
  typedAnswer: string;
  disabled: boolean;
  onTranscript: (transcript: string) => void;
  speakLabel?: string;
  transcriptHint?: string;
  onRecordingStart?: () => void;
}

export function SpeakAnswer({
  questionId,
  typedAnswer,
  disabled,
  onTranscript,
  speakLabel = "Speak my answer",
  transcriptHint = "Transcript added. Review it, then check your answer.",
  onRecordingStart,
}: SpeakAnswerProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const generationRef = useRef(0);
  const ignoreStopRef = useRef(false);
  const inFlightRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const limitRef = useRef<number | null>(null);
  const typedAnswerRef = useRef(typedAnswer);

  function clearTimers() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (limitRef.current !== null) {
      window.clearTimeout(limitRef.current);
      limitRef.current = null;
    }
  }

  function stopTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function teardownMedia(ignoreResult: boolean) {
    ignoreStopRef.current = ignoreResult;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    recorderRef.current = null;
    clearTimers();
    stopTracks();
  }

  function stopRecorder(ignoreResult: boolean) {
    teardownMedia(ignoreResult);
    setRecording(false);
    setElapsed(0);
  }

  useEffect(() => {
    typedAnswerRef.current = typedAnswer;
  }, [typedAnswer]);

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      inFlightRef.current = false;
      ignoreStopRef.current = true;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      recorderRef.current = null;
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (limitRef.current !== null) {
        window.clearTimeout(limitRef.current);
        limitRef.current = null;
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [questionId]);

  async function transcribeBlob(blob: Blob, generation: number) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setBusy(true);
    setStatus("Transcribing…");
    setError(null);

    try {
      const file = new File([blob], "answer.webm", {
        type: blob.type || "audio/webm",
      });
      const form = new FormData();
      form.append("file", file);

      const response = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: form,
      });
      const payload: unknown = await response.json().catch(() => null);

      if (isStaleVoiceResult(generation, generationRef.current)) return;

      if (!response.ok) {
        setError(
          voiceFailureMessage(
            payload,
            "Speech transcription is unavailable right now. You can type your answer instead.",
          ),
        );
        setStatus(null);
        return;
      }

      const transcript =
        payload && typeof payload === "object" && typeof (payload as { transcript?: unknown }).transcript === "string"
          ? (payload as { transcript: string }).transcript.trim()
          : "";

      if (!transcript) {
        setError("No speech was recognized. You can type your answer instead.");
        setStatus(null);
        return;
      }

      const clipped = transcript.slice(0, MAX_TYPED_ANSWER_LENGTH);
      if (typedAnswerRef.current.trim()) {
        setPendingTranscript(clipped);
        setStatus("Review the spoken answer before replacing the text box.");
        return;
      }

      onTranscript(clipped);
      setStatus(transcriptHint);
    } catch {
      if (isStaleVoiceResult(generation, generationRef.current)) return;
      setError("Speech transcription is unavailable right now. You can type your answer instead.");
      setStatus(null);
    } finally {
      if (generation === generationRef.current) {
        inFlightRef.current = false;
        setBusy(false);
      }
    }
  }

  async function startRecording() {
    if (disabled || busy || recording || inFlightRef.current) return;
    setError(null);
    setPendingTranscript(null);
    setStatus(null);
    onRecordingStart?.();

    const mimeType = pickRecorderMimeType();
    if (mimeType === null) {
      setError("This browser can't record audio. Type your answer instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      ignoreStopRef.current = false;

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      const generation = generationRef.current;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        if (isStaleVoiceResult(generation, generationRef.current)) return;
        stopRecorder(true);
        setError("Recording failed. Type your answer instead.");
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });
        chunksRef.current = [];
        stopTracks();
        if (ignoreStopRef.current) return;
        if (isStaleVoiceResult(generation, generationRef.current)) return;
        if (blob.size === 0) {
          setError("That recording was empty.");
          return;
        }
        void transcribeBlob(blob, generation);
      };

      recorder.start();
      setRecording(true);
      setElapsed(0);
      setStatus("Recording…");
      timerRef.current = window.setInterval(() => {
        setElapsed((seconds) => Math.min(seconds + 1, MAX_RECORDING_SECONDS));
      }, 1000);
      limitRef.current = window.setTimeout(() => {
        stopRecorder(false);
      }, MAX_RECORDING_SECONDS * 1000);
    } catch (error) {
      stopTracks();
      const denied =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "PermissionDeniedError");
      setError(
        denied
          ? "Microphone access was denied. Type your answer instead."
          : "Microphone is unavailable. Type your answer instead.",
      );
    }
  }

  function applyPending() {
    if (!pendingTranscript) return;
    onTranscript(pendingTranscript);
    setPendingTranscript(null);
    setStatus(transcriptHint);
  }

  function keepTyped() {
    setPendingTranscript(null);
    setStatus("Kept the text already in the box.");
  }

  return (
    <div className="voice-block">
      <div className="voice-row">
        {recording ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => stopRecorder(false)}
          >
            Stop recording
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              void startRecording();
            }}
            disabled={disabled || busy}
          >
            {speakLabel}
          </button>
        )}
        {recording ? (
          <p className="voice-status" aria-live="polite">
            Recording {elapsed}s / {MAX_RECORDING_SECONDS}s
          </p>
        ) : null}
      </div>
      {busy && status ? (
        <p className="voice-status" aria-live="polite">
          {status}
        </p>
      ) : null}
      {!busy && status && !recording ? (
        <p className="voice-status" aria-live="polite">
          {status}
        </p>
      ) : null}
      {error ? (
        <p className="grok-error" role="alert">
          {error}
        </p>
      ) : null}
      {pendingTranscript ? (
        <div className="voice-confirm">
          <p className="voice-status">
            Replace the text already in the box with the spoken answer?
          </p>
          <div className="voice-row">
            <button type="button" className="btn-primary" onClick={applyPending}>
              Replace text
            </button>
            <button type="button" className="btn-ghost" onClick={keepTyped}>
              Keep current text
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
