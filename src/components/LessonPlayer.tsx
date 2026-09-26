"use client";

import { useAccessPreferences } from "@/components/AccessProvider";
import { LessonStage } from "@/components/LessonStage";
import { SpeakAnswer } from "@/components/SpeakAnswer";
import {
  conditionLabel,
  type LessonActionId,
  type LessonBeat,
} from "@/lib/lesson/catalog";
import { actionLabelFromBeats, getLesson, type PlatformLessonId } from "@/lib/lesson/lessons";
import { mediaIdForBeat, type LessonMediaManifest } from "@/lib/lesson/media";
import hurricaneManifest from "@/lib/lesson/media-manifest.json";
import tornadoManifest from "@/lib/lesson/tornado-media-manifest.json";
import homeFireManifest from "@/lib/lesson/home-fire-media-manifest.json";
import {
  beatDisplayText,
  createInitialLessonState,
  currentBeat,
  lessonBeats,
  lessonReducer,
  overlayForState,
} from "@/lib/lesson/player";
import { MAX_TYPED_ANSWER_LENGTH, type InterpretError } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function readReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeMotionReady(onChange: () => void) {
  const frame = window.requestAnimationFrame(() => onChange());
  return () => window.cancelAnimationFrame(frame);
}

function readMotionReady(): boolean {
  return true;
}

interface LessonProposal {
  proposedActionIds: LessonActionId[];
  availability: string;
  unsupportedNote: string | null;
  feedback: string;
  clarification: string | null;
}

function chapterKind(beat: LessonBeat): string {
  if (beat.kind === "debrief") return "Review";
  if (beat.kind === "decision") return "Practice";
  if (beat.overlay !== "none") return "Demo";
  return "Teach";
}

function userMediaNote(status: string | undefined): string | null {
  if (status === "current") return null;
  return "Updated narration is being prepared. Text guidance is available.";
}

export function LessonPlayer({ lessonId }: { lessonId: PlatformLessonId }) {
  const lesson = getLesson(lessonId);
  const manifest = (
    lessonId === "tornado-home-1"
      ? tornadoManifest
      : lessonId === "home-fire-1"
        ? homeFireManifest
        : hurricaneManifest
  ) as LessonMediaManifest;
  const { prefs } = useAccessPreferences();
  const [state, dispatch] = useReducer(lessonReducer, lessonId, createInitialLessonState);
  const [utterance, setUtterance] = useState("");
  const [proposal, setProposal] = useState<LessonProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const chapterListRef = useRef<HTMLDetailsElement | null>(null);
  const pauseMedia = useRef<() => void>(() => undefined);
  const systemReduceMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
  const motionReady = useSyncExternalStore(subscribeMotionReady, readMotionReady, () => false);
  const reduceMotion =
    prefs.motion === "reduce" ||
    (motionReady && prefs.motion === "system" && systemReduceMotion);
  const beat = currentBeat(state);
  const copy = beatDisplayText(state);
  const mediaId = beat ? mediaIdForBeat(beat.id, lesson.beats) : lesson.beats[0]?.id;
  const media = mediaId ? manifest.beats[mediaId] : undefined;
  const beats = lessonBeats(state);
  const feedback = beat ? state.feedback[beat.id] : undefined;
  const overlay = overlayForState(state);
  const narrationNote = userMediaNote(media?.narrationStatus);

  useEffect(() => {
    const details = chapterListRef.current;
    if (!details) return;
    const media = window.matchMedia("(min-width: 900px)");
    const sync = () => {
      details.open = media.matches;
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [state.started]);

  async function interpret() {
    const text = utterance.trim();
    if (!text || checking || beat?.kind !== "decision") return;
    pauseMedia.current();
    setChecking(true);
    setError(null);
    setProposal(null);
    try {
      const response = await fetch("/api/lesson/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utterance: text, beatId: beat.id, lessonId }),
      });
      const payload = (await response.json()) as LessonProposal | { error?: InterpretError };
      if (!response.ok || !("proposedActionIds" in payload)) {
        const message =
          "error" in payload && payload.error?.message
            ? payload.error.message
            : "Interpretation is unavailable right now. Use a listed action instead.";
        setError(message);
        return;
      }
      setProposal(payload);
    } catch {
      setError("Interpretation is unavailable right now. Use a listed action instead.");
    } finally {
      setChecking(false);
    }
  }

  function apply(actionId: LessonActionId) {
    pauseMedia.current();
    dispatch({ type: "APPLY_DECISION", actionId });
    setProposal(null);
    setUtterance("");
    setError(null);
  }

  function startGuided() {
    dispatch({ type: "START", mode: "guided" });
  }

  if (!state.started || !beat) {
    return (
      <section className="practice-landing" aria-labelledby="lesson-start-heading">
        <div className="practice-hero">
          <div className="practice-hero-copy">
            <p className="kicker">{lesson.kicker}</p>
            <h1 id="lesson-start-heading" className="practice-heading">
              {lesson.heading}
            </h1>
            <p className="practice-lede">{lesson.lede}</p>
            <div className="action-row">
              <button type="button" className="btn-primary" onClick={startGuided}>
                Start guided lesson
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => dispatch({ type: "START", mode: "practice" })}
              >
                Practice my decisions
              </button>
              {lessonId === "hurricane-flood-1" ? (
                <RehearsePlanEntryLink onNavigate={() => pauseMedia.current()} />
              ) : null}
            </div>
          </div>
          <figure className="practice-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lesson.previewStill} alt="" />
            <button type="button" className="practice-preview-play" onClick={startGuided}>
              <PlayIcon />
              Start guided lesson
            </button>
            <figcaption>
              <strong>{lesson.previewCaption}</strong>
              <span>{lesson.previewNote}</span>
            </figcaption>
          </figure>
        </div>
        <ul className="practice-objectives">
          {lesson.objectives.map((item, index) => (
            <li key={item}>
              <span className="practice-objective-label">{String(index + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ul>
        <ul className="practice-features">
          <li>
            <CaptionIcon />
            Captions
          </li>
          <li>
            <SpeechIcon />
            Spoken guidance
          </li>
          <li>
            <DisplayIcon />
            Adjustable display
          </li>
        </ul>
      </section>
    );
  }

  const overlayDescription = feedback ? `${feedback.recommended} ${beat.overlayDescription}` : beat.overlayDescription;
  const canAdvance = beat.kind !== "decision" || Boolean(feedback);
  const chapterList = (
    <ol className="lesson-chapters">
      {beats.map((item, index) => {
        const selected = index === state.beatIndex;
        return (
          <li key={item.id}>
            <button
              type="button"
              className={selected ? "is-selected" : undefined}
              aria-current={selected ? "step" : undefined}
              onClick={() => {
                pauseMedia.current();
                dispatch({ type: "GO_TO", index });
              }}
            >
              <span className="lesson-chapter-num">{String(index + 1).padStart(2, "0")}</span>
              <span className="lesson-chapter-copy">
                <span className="lesson-chapter-kind">{chapterKind(item)}</span>
                <span className="lesson-chapter-label">{item.title}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <section className="practice-player" aria-labelledby="lesson-beat-title">
      <div className="lesson-workspace">
        <div className="lesson-primary">
          <LessonStage
            key={`${mediaId}-${overlay}`}
            media={media}
            caption={copy.caption}
            narration={copy.narration}
            overlay={overlay}
            overlayDescription={overlayDescription}
            showCaptions={prefs.captions}
            reduceMotion={reduceMotion}
            autoPlay={!reduceMotion && media?.narrationStatus === "current"}
            mediaBasePath={lesson.mediaBasePath}
            onPauseRequest={(pause) => {
              pauseMedia.current = pause;
            }}
          />
          {narrationNote ? <p className="lesson-media-note">{narrationNote}</p> : null}
          {beat.kind !== "debrief" ? (
            <div className="lesson-do-why">
              <div>
                <h2>What to do</h2>
                <p>{beat.whatToDo}</p>
              </div>
              <div>
                <h2>Why it matters</h2>
                <p>{beat.whyItMatters}</p>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="lesson-aside">
          <p className="lesson-mode-label">{state.mode === "guided" ? "Guided lesson" : "Practice mode"}</p>
          <h1 id="lesson-beat-title" className="lesson-now-title">
            {beat.title}
          </h1>
          {conditionLabel(beat.condition) ? <p className="lesson-condition">{conditionLabel(beat.condition)}</p> : null}
          <p className="lesson-now-action">{beat.kind === "debrief" ? beat.whatToDo : beat.happening}</p>
          <h2 className="lesson-aside-label lesson-chapters-heading">Chapters</h2>
          <details ref={chapterListRef} className="lesson-chapters-wrap">
            <summary>Chapters</summary>
            {chapterList}
          </details>
        </aside>
      </div>

      {beat.kind !== "debrief" ? (
        <dl className="lesson-step-notes">
          <div>
            <dt>What is happening</dt>
            <dd>{beat.happening}</dd>
          </div>
          <div>
            <dt>What to avoid</dt>
            <dd>{beat.whatToAvoid}</dd>
          </div>
        </dl>
      ) : null}

      <div className="lesson-next-row">
        <button
          type="button"
          className="btn-ghost"
          disabled={state.beatIndex === 0}
          onClick={() => {
            pauseMedia.current();
            dispatch({ type: "PREV" });
          }}
        >
          Previous
        </button>
        {canAdvance && beat.kind !== "debrief" ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              pauseMedia.current();
              dispatch({ type: "NEXT" });
            }}
          >
            Next
          </button>
        ) : null}
        {beat.kind === "decision" && !feedback ? (
          <p className="lesson-next-hint">Choose an action for this scene to continue.</p>
        ) : null}
      </div>

      {beat.kind === "decision" && !feedback ? (
        <div className="sim-action-bar">
          {beat.prompt ? <p className="sim-narration">{beat.prompt}</p> : null}
          <ul className="option-stack">
            {beat.actions?.map((action) => (
              <li key={action.id}>
                <button type="button" className="btn-secondary" onClick={() => apply(action.id)}>
                  {action.label}
                </button>
              </li>
            ))}
          </ul>
          <SpeakAnswer
              questionId={beat.id}
              typedAnswer={utterance}
              disabled={checking}
              speakLabel="Speak your action"
              transcriptHint="Transcript added. Review it, then interpret the action."
              onTranscript={setUtterance}
              onRecordingStart={() => pauseMedia.current()}
            />
          <label className="field">
            <span className="field-label">Or type your action</span>
            <textarea
              rows={2}
              value={utterance}
              maxLength={MAX_TYPED_ANSWER_LENGTH}
              onChange={(event) => setUtterance(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn-ghost"
            disabled={!utterance.trim() || checking}
            onClick={() => {
              void interpret();
            }}
          >
            {checking ? "Interpreting…" : "Interpret with Grok"}
          </button>
          {error ? (
            <p className="grok-error" role="alert">
              {error}
            </p>
          ) : null}
          {proposal ? (
            <div className="sim-proposal">
              <p className="result-body">{proposal.feedback}</p>
              {proposal.clarification ? <p className="result-body">{proposal.clarification}</p> : null}
              {proposal.unsupportedNote ? <p className="result-note">{proposal.unsupportedNote}</p> : null}
              {proposal.availability === "present" && proposal.proposedActionIds[0] && !proposal.clarification ? (
                <button type="button" className="btn-primary" onClick={() => apply(proposal.proposedActionIds[0])}>
                  Use this listed action
                </button>
              ) : (
                <p className="result-note">That answer was not applied automatically. Choose a listed action.</p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {beat.kind === "decision" && feedback ? (
        <div className="sim-card">
          <h2 className="section-heading">Feedback</h2>
          <p className="result-body">{feedback.chosen}</p>
          <p className="result-body">{feedback.explanation}</p>
          <p className="result-body">{feedback.recommended}</p>
          <p className="result-note">
            {feedback.fits === "fits"
              ? "That fits the stated scene."
              : feedback.fits === "incomplete"
                ? "That is only part of the action for this scene."
                : "That does not fit this scene. The demonstration above shows the recommended action."}
          </p>
          <div className="action-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                pauseMedia.current();
                dispatch({ type: "RETRY_DECISION" });
              }}
            >
              Try this question again
            </button>
          </div>
        </div>
      ) : null}

      {beat.kind === "debrief" ? (
        <>
          <div className="sim-card no-print">
            <DebriefContent lessonId={lessonId} decisions={state.decisions} />
            <div className="action-row">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  pauseMedia.current();
                  dispatch({ type: "START", mode: "practice" });
                }}
              >
                Practice this lesson
              </button>
              {lessonId === "hurricane-flood-1" ? (
                <RehearsePlanEntryLink onNavigate={() => pauseMedia.current()} />
              ) : null}
              <button type="button" className="btn-secondary" onClick={() => window.print()}>
                Print notes
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  pauseMedia.current();
                  dispatch({ type: "RESTART" });
                }}
              >
                Start over
              </button>
            </div>
          </div>
          <section className="print-card print-only" aria-label="Lesson notes">
            <p className="print-kicker">BeforeZero</p>
            <h1>{lesson.printTitle}</h1>
            <DebriefContent lessonId={lessonId} decisions={state.decisions} print />
          </section>
        </>
      ) : (
        <details className="lesson-sources">
          <summary>Sources and access notes</summary>
          <p>{lesson.accessNote.text}</p>
          <ul className="resource-list">
            {lesson.sourceLinks.map((item) => (
              <li key={item.url}>
                <a className="resource-link" href={item.url} rel="noopener noreferrer" target="_blank">
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function DebriefContent({
  lessonId,
  decisions,
  print = false,
}: {
  lessonId: PlatformLessonId;
  decisions: Partial<Record<string, LessonActionId>>;
  print?: boolean;
}) {
  const lesson = getLesson(lessonId);
  const titleClass = print ? undefined : "section-heading";
  const bodyClass = print ? undefined : "result-body";
  const practiced = Object.entries(decisions);
  return (
    <>
      <h2 className={titleClass}>What you learned</h2>
      <ol>
        {lesson.takeaways.map((item) => (
          <li key={item} className={bodyClass}>
            {item}
          </li>
        ))}
      </ol>
      {practiced.length ? (
        <>
          <h2 className={titleClass}>Your practice answers</h2>
          <ul>
            {practiced.map(([beatId, actionId]) =>
              actionId ? (
                <li key={beatId} className={bodyClass}>
                  {actionLabelFromBeats(lesson.beats, actionId)}
                </li>
              ) : null,
            )}
          </ul>
        </>
      ) : (
        <p className={bodyClass}>You watched the guided lesson. Practice questions were not required.</p>
      )}
      <h2 className={titleClass}>{lesson.prepareHeading}</h2>
      <ul>
        {lesson.prepareChecklist.map((item) => (
          <li key={item.text} className={bodyClass}>
            {item.text}
          </li>
        ))}
      </ul>
      <p className={print ? undefined : "result-note"}>{lesson.accessNote.text}</p>
      <h2 className={titleClass}>Sources and further reading</h2>
      <p className={bodyClass}>These links support the teaching above. They are not a substitute for it.</p>
      <ul className={print ? undefined : "resource-list"}>
        {lesson.sourceLinks.map((item) => (
          <li key={item.url}>
            <a className="resource-link" href={item.url} rel="noopener noreferrer" target="_blank">
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

function RehearsePlanEntryLink({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const href = "/practice/hurricane/rehearse-plan";

  function go(event?: { preventDefault: () => void }) {
    event?.preventDefault();
    onNavigate();
    router.push(href);
  }

  return (
    <a
      className="btn-secondary"
      href={href}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          onNavigate();
          return;
        }
        go(event);
      }}
      onKeyDown={(event) => {
        if (event.key === " ") {
          event.preventDefault();
          go();
        }
      }}
    >
      Rehearse my plan
    </a>
  );
}

function PlayIcon() {
  return (
    <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" />
    </svg>
  );
}

function CaptionIcon() {
  return (
    <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 12h4M13 12h4M7 15h10" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SpeechIcon() {
  return (
    <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 15V9h4l5-4v14l-5-4H5z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 9.5a4 4 0 0 1 0 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function DisplayIcon() {
  return (
    <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 21h8M12 17v4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
