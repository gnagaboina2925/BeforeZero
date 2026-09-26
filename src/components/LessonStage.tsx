"use client";

import { LessonOverlay } from "@/components/LessonOverlay";
import { cueAtTime, narrationCues, type Cue, type LessonMediaAsset } from "@/lib/lesson/media";
import type { LessonOverlayId } from "@/lib/lesson/catalog";
import { useEffect, useRef, useState } from "react";

interface LessonStageProps {
  media: LessonMediaAsset | undefined;
  caption: string;
  narration: string;
  overlay: LessonOverlayId;
  overlayDescription: string;
  showCaptions: boolean;
  reduceMotion: boolean;
  autoPlay: boolean;
  onPauseRequest?: (pause: () => void) => void;
}

export function LessonStage({
  media,
  caption,
  narration,
  overlay,
  overlayDescription,
  showCaptions,
  reduceMotion,
  autoPlay,
  onPauseRequest,
}: LessonStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const publicPath = (rel: string | null | undefined) => (rel ? `/lesson/${rel}` : null);
  const narrationReady = media?.narrationStatus === "current";
  const videoSrc = publicPath(media?.video ?? null);
  const audioSrc = publicPath(narrationReady ? media?.audio ?? null : null);
  const stillSrc = publicPath(media?.still ?? null);
  const captionSrc = publicPath(narrationReady ? media?.captions ?? null : null);
  const cues: Cue[] = narrationCues(narration, duration > 0 ? duration : 8);
  const spokenCue = cueAtTime(cues, time);
  const showVideo = Boolean(videoSrc && !reduceMotion);

  useEffect(() => {
    const pause = () => {
      videoRef.current?.pause();
      audioRef.current?.pause();
      setPlaying(false);
    };
    onPauseRequest?.(pause);
  }, [onPauseRequest]);

  function togglePlay() {
    const mediaEl = audioRef.current ?? videoRef.current;
    if (!mediaEl) return;
    if (mediaEl.paused) {
      void mediaEl.play().then(() => setPlaying(true)).catch(() => undefined);
      if (audioRef.current && videoRef.current && audioRef.current !== videoRef.current) {
        void videoRef.current.play().catch(() => undefined);
      }
    } else {
      mediaEl.pause();
      videoRef.current?.pause();
      setPlaying(false);
    }
  }

  function toggleMute() {
    const next = !muted;
    if (audioRef.current) audioRef.current.muted = next;
    if (videoRef.current) videoRef.current.muted = next;
    setMuted(next);
  }

  function replay() {
    if (videoRef.current) videoRef.current.currentTime = 0;
    if (audioRef.current) audioRef.current.currentTime = 0;
    setTime(0);
    const mediaEl = audioRef.current ?? videoRef.current;
    void mediaEl?.play().then(() => setPlaying(true)).catch(() => undefined);
  }

  return (
    <figure className="lesson-stage">
      <div className="lesson-frame">
        {showVideo ? (
          <video
            ref={videoRef}
            className="lesson-video"
            src={videoSrc ?? undefined}
            poster={stillSrc ?? undefined}
            playsInline
            preload="metadata"
            autoPlay={autoPlay && !reduceMotion}
            muted={muted || Boolean(audioSrc) || !narrationReady}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(event) => {
              if (!audioSrc) setTime(event.currentTarget.currentTime);
            }}
            onLoadedMetadata={(event) => {
              if (!audioSrc) setDuration(event.currentTarget.duration || 0);
            }}
          >
            {captionSrc ? (
              <track kind="captions" srcLang="en" label="English captions" src={captionSrc} default={showCaptions} />
            ) : null}
          </video>
        ) : stillSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="lesson-video" src={stillSrc} alt="Practice still. Motion is reduced." />
        ) : (
          <div className="lesson-still" aria-hidden="true" />
        )}
        <LessonOverlay overlay={overlay} description={overlayDescription} reduceMotion={reduceMotion} />
        <p className="lesson-badge">Practice illustration — not documentary</p>
      </div>

      {audioSrc ? (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="metadata"
          autoPlay={autoPlay && !reduceMotion}
          onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      ) : null}

      <div className="lesson-audio-bar">
        <button type="button" className="btn-secondary" onClick={togglePlay}>
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" className="btn-ghost" onClick={replay}>
          Replay clip
        </button>
        <button type="button" className="btn-ghost" onClick={toggleMute}>
          {muted ? "Unmute" : "Mute"}
        </button>
        {reduceMotion ? (
          <p className="result-note">Still image replaces motion. Narration and captions remain available.</p>
        ) : null}
      </div>

      {showCaptions ? (
        <figcaption className="lesson-captions">
          {spokenCue ? <p className="lesson-spoken">{spokenCue}</p> : null}
          <p>{caption}</p>
        </figcaption>
      ) : (
        <figcaption className="sr-only">{spokenCue || caption}</figcaption>
      )}
    </figure>
  );
}
