"use client";

import { useAccessPreferences } from "@/components/AccessProvider";
import { LessonStage } from "@/components/LessonStage";
import { SceneListen } from "@/components/SceneListen";
import { SpeakAnswer } from "@/components/SpeakAnswer";
import { LESSON_SOURCES } from "@/lib/lesson/sources";
import { beatById } from "@/lib/lesson/catalog";
import type { LessonMediaManifest } from "@/lib/lesson/media";
import hurricaneManifest from "@/lib/lesson/media-manifest.json";
import {
  COMPLICATIONS,
  DEFAULT_PLAN_PREFS,
  FALLBACK_DEPENDENCY_CHOICES,
  PLAN_EXAMPLE,
  PLAN_PROMPT,
  REHEARSAL_CHOICE_LABELS,
  REHEARSAL_CHOICE_PROMPT,
  STEP_FREE_NOTE,
  SUPPORT_PERSON_NOTE,
} from "@/lib/plan/catalog";
import { detectDependenciesFromText } from "@/lib/plan/detect";
import { evaluateRevisedPlan } from "@/lib/plan/evaluate";
import { exampleComplication, rehearsalKinds, selectSupportedComplication } from "@/lib/plan/select";
import type {
  ComplicationKind,
  ConfirmedPlan,
  PlanInterpretation,
  PlanPreferenceFlags,
  PlanStep,
  RevisedPlanReview,
  SelectedComplication,
} from "@/lib/plan/types";
import { MAX_TYPED_ANSWER_LENGTH, type InterpretError } from "@/lib/types";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const manifest = hurricaneManifest as LessonMediaManifest;

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function readReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PlanRehearsalApp() {
  const { prefs: accessPrefs, setPrefs: setAccessPrefs } = useAccessPreferences();
  const [step, setStep] = useState<PlanStep>("prefs");
  const [planPrefs, setPlanPrefs] = useState<PlanPreferenceFlags>({
    ...DEFAULT_PLAN_PREFS,
    spokenGuidance: accessPrefs.narration,
    captions: accessPrefs.captions,
  });
  const [planText, setPlanText] = useState("");
  const [usedExample, setUsedExample] = useState(false);
  const [interpretation, setInterpretation] = useState<PlanInterpretation | null>(null);
  const [selectedKinds, setSelectedKinds] = useState<ComplicationKind[]>([]);
  const [clarificationAnswer, setClarificationAnswer] = useState("");
  const [round, setRound] = useState(0);
  const [confirmed, setConfirmed] = useState<ConfirmedPlan | null>(null);
  const [complication, setComplication] = useState<SelectedComplication | null>(null);
  const [chosenKind, setChosenKind] = useState<ComplicationKind | null>(null);
  const [acknowledgedUnclear, setAcknowledgedUnclear] = useState(false);
  const [offerExample, setOfferExample] = useState(false);
  const [revisedText, setRevisedText] = useState("");
  const [selectedChoiceIds, setSelectedChoiceIds] = useState<string[]>([]);
  const [review, setReview] = useState<RevisedPlanReview | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const interpretGen = useRef(0);
  const pauseMedia = useRef<() => void>(() => undefined);
  const systemReduceMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
  const reduceMotion = accessPrefs.motion === "reduce" || (accessPrefs.motion === "system" && systemReduceMotion);

  useEffect(() => {
    return () => pauseMedia.current();
  }, []);

  useEffect(() => {
    pauseMedia.current();
  }, [step]);

  const copy = complication ? COMPLICATIONS[complication.kind] : null;
  const media = copy ? manifest.beats[copy.mediaBeatId] : undefined;
  const beat = copy ? beatById(copy.mediaBeatId) : undefined;
  const whatToDo = copy ? (planPrefs.plainLanguage ? copy.whatToDoPlain : copy.whatToDo) : "";

  function applyPrefsAndContinue() {
    setAccessPrefs({
      ...accessPrefs,
      narration: planPrefs.spokenGuidance ? true : accessPrefs.narration,
      captions: planPrefs.captions,
    });
    setStep("describe");
  }

  async function interpret(nextRound: number, utterance: string) {
    const text = utterance.trim();
    if (!text || checking) return;
    pauseMedia.current();
    interpretGen.current += 1;
    const generation = interpretGen.current;
    setChecking(true);
    setError(null);
    try {
      const response = await fetch("/api/plan/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utterance: text, round: nextRound }),
      });
      const payload = (await response.json()) as PlanInterpretation | { error?: InterpretError };
      if (generation !== interpretGen.current) return;
      if (!response.ok || !("dependencies" in payload)) {
        const fallbackKinds = detectDependenciesFromText(text).map((item) => item.kind);
        setInterpretation({
          summary: `You reported: ${text.slice(0, 220)}`,
          observations: [],
          dependencies: detectDependenciesFromText(text),
          gaps: [],
          clarification: null,
          usedFallback: true,
          ambiguousKinds: [],
        });
        setSelectedKinds(fallbackKinds);
        setError(
          "error" in payload && payload.error?.message
            ? `${payload.error.message} You can confirm what your words named, or use the labeled example.`
            : "Interpretation is unavailable. Confirm what your words named, or use the labeled example.",
        );
        setStep("confirm");
        return;
      }
      setInterpretation({
        ...payload,
        ambiguousKinds: Array.isArray(payload.ambiguousKinds) ? payload.ambiguousKinds : [],
      });
      setSelectedKinds(payload.dependencies.map((item) => item.kind));
      setAcknowledgedUnclear((payload.ambiguousKinds ?? []).length === 0);
      setStep("confirm");
    } catch {
      if (generation !== interpretGen.current) return;
      const fallback = detectDependenciesFromText(text);
      setInterpretation({
        summary: `You reported: ${text.slice(0, 220)}`,
        observations: [],
        dependencies: fallback,
        gaps: [],
        clarification: null,
        usedFallback: true,
        ambiguousKinds: [],
      });
      setSelectedKinds(fallback.map((item) => item.kind));
      setError("Interpretation is unavailable. Confirm what your words named, or use the labeled example.");
      setStep("confirm");
    } finally {
      if (generation === interpretGen.current) setChecking(false);
    }
  }

  function confirmPlan() {
    if (!interpretation) return;
    if (interpretation.ambiguousKinds.length > 0 && !acknowledgedUnclear) {
      setError(
        "Confirm the unclear parts before continuing. Ambiguous wording is not treated as a dependency until you confirm it.",
      );
      return;
    }
    const extra = interpretation.ambiguousKinds
      .filter((kind) => selectedKinds.includes(kind) && !interpretation.dependencies.some((item) => item.kind === kind))
      .map((kind) => ({
        kind,
        label: `Confirmed after unclear wording (${kind})`,
        evidenceQuote: planText.trim().slice(0, 180) || kind,
      }));
    const dependencies = [
      ...interpretation.dependencies.filter((item) => selectedKinds.includes(item.kind)),
      ...extra,
    ];
    const nextConfirmed: ConfirmedPlan = {
      reportedText: planText.trim(),
      summary: interpretation.summary,
      observations: interpretation.observations,
      dependencies,
      gaps: interpretation.gaps,
      usedExample,
    };
    setConfirmed(nextConfirmed);
    const kinds = rehearsalKinds(dependencies);
    const selected = selectSupportedComplication(dependencies, { usedExample, chosenKind });
    if (kinds.length > 1) {
      setOfferExample(false);
      setComplication(null);
      setChosenKind(null);
      setStep("choose");
      return;
    }
    if (!selected) {
      setOfferExample(true);
      setComplication(null);
      return;
    }
    setOfferExample(false);
    setComplication(selected);
    setStep("teach");
  }

  function continueWithChosenKind() {
    if (!confirmed || !chosenKind) return;
    const selected = selectSupportedComplication(confirmed.dependencies, { usedExample, chosenKind });
    if (!selected) {
      setOfferExample(true);
      return;
    }
    setOfferExample(false);
    setComplication(selected);
    setStep("teach");
  }

  function startExampleScenario() {
    setUsedExample(true);
    setPlanText(PLAN_EXAMPLE.text);
    const dependencies = detectDependenciesFromText(PLAN_EXAMPLE.text);
    setConfirmed({
      reportedText: PLAN_EXAMPLE.text,
      summary: PLAN_EXAMPLE.text,
      observations: [],
      dependencies,
      gaps: [],
      usedExample: true,
    });
    setComplication(exampleComplication());
    setOfferExample(false);
    setStep("teach");
  }

  function finishRevision() {
    if (!complication || !confirmed) return;
    const next = evaluateRevisedPlan({
      kind: complication.kind,
      originalText: confirmed.reportedText,
      revisedText,
      selectedChoiceIds,
    });
    setReview(next);
    setStep(next.otherDependencyNote ? "gap-notice" : "card");
  }

  function continueWithUnresolvedGap() {
    if (!review || !complication) return;
    setStep("card");
  }

  function resetAll() {
    pauseMedia.current();
    setStep("prefs");
    setPlanText("");
    setUsedExample(false);
    setInterpretation(null);
    setSelectedKinds([]);
    setClarificationAnswer("");
    setRound(0);
    setConfirmed(null);
    setComplication(null);
    setChosenKind(null);
    setAcknowledgedUnclear(false);
    setOfferExample(false);
    setRevisedText("");
    setSelectedChoiceIds([]);
    setReview(null);
    setError(null);
  }

  function replayComplication() {
    if (!confirmed || !complication) return;
    pauseMedia.current();
    setRevisedText("");
    setSelectedChoiceIds([]);
    setReview(null);
    setStep("teach");
  }

  const remaining = MAX_TYPED_ANSWER_LENGTH - planText.length;

  return (
    <section className="practice-landing" aria-labelledby="plan-rehearsal-heading">
      <p className="kicker">Hurricane preparation rehearsal</p>
      <h1 id="plan-rehearsal-heading" className="practice-heading">
        Rehearse my plan
      </h1>
      <p className="practice-lede">
        Explore dependencies in a preparation plan. This is not live emergency advice and not a verified assessment.
      </p>

      {step === "prefs" ? (
        <div className="sim-card">
          <h2 className="section-heading">What would help during this rehearsal?</h2>
          <p className="result-note">
            You can skip this. These choices do not ask for a diagnosis. Spoken guidance and captions also live in
            Accessibility.
          </p>
          <fieldset className="a11y-fieldset">
            <legend className="sr-only">Optional rehearsal preferences</legend>
            <PrefCheck
              checked={planPrefs.spokenGuidance}
              onChange={(spokenGuidance) => setPlanPrefs({ ...planPrefs, spokenGuidance })}
              label="Spoken guidance"
            />
            <PrefCheck
              checked={planPrefs.captions}
              onChange={(captions) => setPlanPrefs({ ...planPrefs, captions })}
              label="Captions and visual instructions"
            />
            <PrefCheck
              checked={planPrefs.plainLanguage}
              onChange={(plainLanguage) => setPlanPrefs({ ...planPrefs, plainLanguage })}
              label="Plain-language instructions"
            />
            <PrefCheck
              checked={planPrefs.stepFree}
              onChange={(stepFree) => setPlanPrefs({ ...planPrefs, stepFree })}
              label="Step-free access considerations"
            />
            <PrefCheck
              checked={planPrefs.supportPerson}
              onChange={(supportPerson) => setPlanPrefs({ ...planPrefs, supportPerson })}
              label="Planning with a support person"
            />
          </fieldset>
          <div className="action-row">
            <button type="button" className="btn-primary" onClick={applyPrefsAndContinue}>
              Continue
            </button>
            <button type="button" className="btn-secondary" onClick={() => setStep("describe")}>
              Skip
            </button>
            <Link className="btn-ghost" href="/practice/hurricane">
              Back to hurricane lesson
            </Link>
          </div>
        </div>
      ) : null}

      {step === "describe" ? (
        <div className="sim-card">
          <h2 className="section-heading">Describe a plan</h2>
          <p className="result-body">{PLAN_PROMPT}</p>
          {planPrefs.supportPerson ? <p className="result-note">{SUPPORT_PERSON_NOTE}</p> : null}
          {planPrefs.stepFree ? <p className="result-note">{STEP_FREE_NOTE}</p> : null}
          <p className="result-note">Do not include names, addresses, or medical details. You can use a labeled example instead.</p>
          <div className="example-card">
            <p className="grok-kicker">{PLAN_EXAMPLE.label}</p>
            <p className="result-body">{PLAN_EXAMPLE.text}</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setPlanText(PLAN_EXAMPLE.text);
                setUsedExample(true);
              }}
            >
              Use this example
            </button>
          </div>
          <label className="typed-label" htmlFor="plan-text">
            Your plan in your own words
          </label>
          <div className="typed-with-voice">
            <textarea
              id="plan-text"
              className="typed-input"
              value={planText}
              maxLength={MAX_TYPED_ANSWER_LENGTH}
              rows={5}
              onChange={(event) => {
                setUsedExample(event.target.value === PLAN_EXAMPLE.text);
                setPlanText(event.target.value);
              }}
              disabled={checking}
            />
            <SpeakAnswer
              questionId={`plan-describe-${round}`}
              typedAnswer={planText}
              disabled={checking}
              speakLabel="Speak your plan"
              transcriptHint="Transcript added. Review it, then check your plan."
              onTranscript={(value) => {
                setUsedExample(false);
                setPlanText(value);
              }}
              onRecordingStart={() => pauseMedia.current()}
            />
          </div>
          <p className={`char-count ${remaining < 0 ? "is-over" : ""}`}>
            {planText.length} / {MAX_TYPED_ANSWER_LENGTH}
          </p>
          {error ? (
            <p className="grok-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="action-row">
            <button
              type="button"
              className="btn-primary"
              disabled={!planText.trim() || checking}
              onClick={() => void interpret(round, planText)}
            >
              {checking ? "Checking…" : "Check this plan"}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setStep("prefs")}>
              Back
            </button>
          </div>
        </div>
      ) : null}

      {step === "confirm" && interpretation ? (
        <div className="sim-card">
          <h2 className="section-heading">Confirm what this rehearsal heard</h2>
          <p className="result-note">
            Edit anything that does not match your words. Every listed dependency must come from your plan. Not mentioned
            is different from not planned.
          </p>
          {interpretation.usedFallback ? (
            <p className="result-note">Grok was not used for this summary. Confirm from your words or the example.</p>
          ) : (
            <p className="grok-powered">Powered by Grok</p>
          )}
          <label className="typed-label" htmlFor="plan-summary">
            Short summary
          </label>
          <textarea
            id="plan-summary"
            className="typed-input"
            rows={3}
            value={interpretation.summary}
            onChange={(event) => setInterpretation({ ...interpretation, summary: event.target.value })}
          />
          <ul>
            {interpretation.observations.map((item) => (
              <li key={item.topic} className="result-body">
                {item.note}
                {item.evidenceQuote ? ` Evidence: “${item.evidenceQuote}”.` : ""}
              </li>
            ))}
          </ul>
          <fieldset className="a11y-fieldset">
            <legend>Dependencies from your words</legend>
            {FALLBACK_DEPENDENCY_CHOICES.map((choice) => {
              const detected = interpretation.dependencies.some((item) => item.kind === choice.id);
              const unclear = interpretation.ambiguousKinds.includes(choice.id);
              const enabled = detected || unclear || selectedKinds.includes(choice.id);
              return (
                <label key={choice.id} className="check-row">
                  <input
                    type="checkbox"
                    checked={selectedKinds.includes(choice.id)}
                    disabled={!enabled}
                    onChange={(event) => {
                      setSelectedKinds((current) =>
                        event.target.checked ? [...current, choice.id] : current.filter((kind) => kind !== choice.id),
                      );
                    }}
                  />
                  <span>
                    {choice.label}
                    {detected ? " (found in your words)" : unclear ? " (unclear in your words — confirm before rehearsing)" : " (not found in your words)"}
                  </span>
                </label>
              );
            })}
          </fieldset>
          {interpretation.ambiguousKinds.length > 0 ? (
            <label className="check-row">
              <input
                type="checkbox"
                checked={acknowledgedUnclear}
                onChange={(event) => {
                  setAcknowledgedUnclear(event.target.checked);
                  setError(null);
                }}
              />
              <span>
                I reviewed the unclear parts. Continue only with the dependencies I checked. Unchecked unclear wording
                stays not planned or not mentioned, not a rehearsal dependency.
              </span>
            </label>
          ) : null}
          {interpretation.clarification ? (
            <div>
              <p className="result-body">{interpretation.clarification}</p>
              <label className="typed-label" htmlFor="plan-clarify">
                One clarification
              </label>
              <textarea
                id="plan-clarify"
                className="typed-input"
                rows={3}
                value={clarificationAnswer}
                maxLength={MAX_TYPED_ANSWER_LENGTH}
                onChange={(event) => setClarificationAnswer(event.target.value)}
              />
              <button
                type="button"
                className="btn-secondary"
                disabled={!clarificationAnswer.trim() || checking}
                onClick={() => {
                  const next = `${planText.trim()} ${clarificationAnswer.trim()}`.slice(0, MAX_TYPED_ANSWER_LENGTH);
                  setPlanText(next);
                  setRound(1);
                  setInterpretation({ ...interpretation, clarification: null });
                  void interpret(1, next);
                }}
              >
                Add this clarification
              </button>
            </div>
          ) : null}
          {error ? (
            <p className="grok-error" role="alert">
              {error}
            </p>
          ) : null}
          {offerExample ? (
            <div className="example-card">
              <p className="result-body">
                None of the authored complications match the plan you confirmed. You can try this labeled example
                scenario instead.
              </p>
              <button type="button" className="btn-primary" onClick={startExampleScenario}>
                Use labeled example scenario
              </button>
            </div>
          ) : null}
          <div className="action-row">
            <button type="button" className="btn-primary" onClick={confirmPlan}>
              Continue with this plan
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setStep("describe");
                setError(null);
              }}
            >
              Edit plan
            </button>
          </div>
        </div>
      ) : null}

      {step === "choose" && confirmed ? (
        <div className="sim-card">
          <h2 className="section-heading">{REHEARSAL_CHOICE_PROMPT}</h2>
          <p className="result-note">This run explores one complication. Choose the part to rehearse now.</p>
          <fieldset className="a11y-fieldset">
            <legend className="sr-only">{REHEARSAL_CHOICE_PROMPT}</legend>
            {rehearsalKinds(confirmed.dependencies).map((kind) => (
              <label key={kind} className="check-row">
                <input
                  type="radio"
                  name="rehearsal-part"
                  checked={chosenKind === kind}
                  onChange={() => setChosenKind(kind)}
                />
                <span>{REHEARSAL_CHOICE_LABELS[kind]}</span>
              </label>
            ))}
          </fieldset>
          <div className="action-row">
            <button type="button" className="btn-primary" disabled={!chosenKind} onClick={continueWithChosenKind}>
              Rehearse this part
            </button>
            <button type="button" className="btn-ghost" onClick={() => setStep("confirm")}>
              Back
            </button>
          </div>
        </div>
      ) : null}

      {step === "teach" && copy && complication ? (
        <div className="sim-card">
          <p className="lesson-mode-label">Fictional complication</p>
          <h2 className="section-heading">{copy.title}</h2>
          {complication.source === "example" ? (
            <p className="result-note">This uses the labeled example scenario, not a verified home plan.</p>
          ) : null}
          <LessonStage
            media={media}
            caption={copy.caption}
            narration={copy.narration}
            overlay={copy.overlay}
            overlayDescription={beat?.overlayDescription ?? copy.happening}
            showCaptions={planPrefs.captions || accessPrefs.captions}
            reduceMotion={reduceMotion}
            autoPlay={false}
            onPauseRequest={(pause) => {
              pauseMedia.current = pause;
            }}
          />
          <h3 className="section-heading">What to do</h3>
          <p className="result-body">{whatToDo}</p>
          {planPrefs.stepFree ? <p className="result-note">{STEP_FREE_NOTE}</p> : null}
          <h3 className="section-heading">Why it matters</h3>
          <p className="result-body">{copy.whyItMatters}</p>
          <p className="result-note">{copy.whatToAvoid}</p>
          {planPrefs.spokenGuidance || accessPrefs.narration ? (
            <SceneListen cacheKey={`plan-${copy.kind}`} narration={copy.narration} muted={false} />
          ) : null}
          <ul className="resource-list">
            {copy.sourceIds.map((id) => (
              <li key={id}>
                <a className="resource-link" href={LESSON_SOURCES[id].url} rel="noopener noreferrer" target="_blank">
                  {LESSON_SOURCES[id].title}
                </a>
              </li>
            ))}
          </ul>
          <div className="action-row">
            <button type="button" className="btn-primary" onClick={() => setStep("revise")}>
              Describe a revised plan
            </button>
          </div>
        </div>
      ) : null}

      {step === "revise" && copy ? (
        <div className="sim-card">
          <h2 className="section-heading">Revise this plan</h2>
          <p className="result-body">{copy.revisePrompt}</p>
          <p className="result-note">You can type, speak, or choose a listed option. This still does not prove preparedness.</p>
          <fieldset className="a11y-fieldset">
            <legend>Sourced options</legend>
            {copy.choices.map((choice) => (
              <label key={choice.id} className="check-row">
                <input
                  type="checkbox"
                  checked={selectedChoiceIds.includes(choice.id)}
                  onChange={(event) => {
                    setSelectedChoiceIds((current) =>
                      event.target.checked ? [...current, choice.id] : current.filter((id) => id !== choice.id),
                    );
                  }}
                />
                <span>{choice.label}</span>
              </label>
            ))}
          </fieldset>
          <label className="typed-label" htmlFor="plan-revised">
            Revised response
          </label>
          <div className="typed-with-voice">
            <textarea
              id="plan-revised"
              className="typed-input"
              value={revisedText}
              maxLength={MAX_TYPED_ANSWER_LENGTH}
              rows={4}
              onChange={(event) => setRevisedText(event.target.value)}
            />
            <SpeakAnswer
              questionId={`plan-revise-${copy.kind}`}
              typedAnswer={revisedText}
              disabled={false}
              speakLabel="Speak a revised plan"
              onTranscript={setRevisedText}
              onRecordingStart={() => pauseMedia.current()}
            />
          </div>
          <div className="action-row">
            <button
              type="button"
              className="btn-primary"
              disabled={!revisedText.trim() && selectedChoiceIds.length === 0}
              onClick={finishRevision}
            >
              Save preparation card
            </button>
            <button type="button" className="btn-ghost" onClick={() => setStep("teach")}>
              Back to teaching
            </button>
          </div>
        </div>
      ) : null}

      {step === "gap-notice" && review?.otherDependencyNote && copy && complication ? (
        <div className="sim-card">
          <h2 className="section-heading">This revision is about a different part of the plan</h2>
          <p className="result-body" role="status">
            {review.otherDependencyNote}
          </p>
          <p className="result-note">
            This run still explores {REHEARSAL_CHOICE_LABELS[complication.kind].toLowerCase()}. You can edit the
            response or continue with that backup still unresolved.
          </p>
          <div className="action-row">
            <button type="button" className="btn-secondary" onClick={() => setStep("revise")}>
              Edit the response
            </button>
            <button type="button" className="btn-primary" onClick={continueWithUnresolvedGap}>
              Continue with this gap unresolved
            </button>
          </div>
        </div>
      ) : null}

      {step === "card" && confirmed && review && complication && copy ? (
        <>
          <div className="sim-card no-print">
            <PreparationCard
              confirmed={confirmed}
              complication={complication}
              copyTitle={copy.title}
              review={review}
            />
            <div className="action-row">
              <button type="button" className="btn-primary" onClick={() => window.print()}>
                Print or save
              </button>
              <button type="button" className="btn-secondary" onClick={replayComplication}>
                Replay this moment
              </button>
              <button type="button" className="btn-ghost" onClick={resetAll}>
                Reset
              </button>
              <Link className="btn-ghost" href="/practice/hurricane">
                Back to hurricane lesson
              </Link>
            </div>
          </div>
          <section className="print-card print-only" aria-label="Preparation card">
            <p className="print-kicker">BeforeZero</p>
            <h1>Rehearse my plan</h1>
            <PreparationCard confirmed={confirmed} complication={complication} copyTitle={copy.title} review={review} print />
          </section>
        </>
      ) : null}
    </section>
  );
}

function PrefCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="check-row">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function PreparationCard({
  confirmed,
  complication,
  copyTitle,
  review,
  print = false,
}: {
  confirmed: ConfirmedPlan;
  complication: SelectedComplication;
  copyTitle: string;
  review: RevisedPlanReview;
  print?: boolean;
}) {
  const titleClass = print ? undefined : "section-heading";
  const bodyClass = print ? undefined : "result-body";
  const practiceMoment = REHEARSAL_CHOICE_LABELS[review.selectedKind] || copyTitle;
  return (
    <>
      <h2 className={titleClass}>Practice moment</h2>
      <p className={bodyClass}>
        {practiceMoment}
        {complication.source === "example" ? " (labeled example scenario)" : ""}
      </p>
      <h2 className={titleClass}>What your response addressed</h2>
      <p className={bodyClass}>{review.addressedSummary}</p>
      {review.otherDependencyNote ? <p className={print ? undefined : "result-note"}>{review.otherDependencyNote}</p> : null}
      {review.warning ? <p className={print ? undefined : "result-note"}>{review.warning}</p> : null}
      <h2 className={titleClass}>Still to arrange</h2>
      <ul>
        {review.remainingGaps.length ? (
          review.remainingGaps.map((item) => (
            <li key={item} className={bodyClass}>
              {item}
            </li>
          ))
        ) : (
          <li className={bodyClass}>No additional backup was recorded for this practice moment.</li>
        )}
      </ul>
      {review.otherPlanningTasks.length ? (
        <>
          <h2 className={titleClass}>Other planning tasks you mentioned</h2>
          <ul>
            {review.otherPlanningTasks.map((item) => (
              <li key={item.text} className={bodyClass}>
                {item.text} (not completed in this rehearsal)
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <h2 className={titleClass}>Short, source-backed next steps</h2>
      <ul>
        {review.preparationTasks.map((item) => (
          <li key={item.sourceId} className={bodyClass}>
            {item.text}
          </li>
        ))}
      </ul>
      {print ? (
        <>
          <h2>Original and revised answers</h2>
          <p>
            <strong>Original: </strong>
            {confirmed.reportedText}
          </p>
          <p>
            <strong>Revised: </strong>
            {review.revisedText || "(listed options only)"}
          </p>
          <h2>Source excerpts</h2>
          <ul>
            {review.sourceExcerpts.map((item) => (
              <li key={item.sourceId}>
                {item.title}: {item.excerpt}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <details className="plan-card-details">
            <summary>Original and revised answers</summary>
            <p className="result-body">
              <strong>Original: </strong>
              {confirmed.reportedText}
            </p>
            <p className="result-body">
              <strong>Revised: </strong>
              {review.revisedText || "(listed options only)"}
            </p>
          </details>
          <details className="plan-card-details">
            <summary>Full source excerpts</summary>
            <ul>
              {review.sourceExcerpts.map((item) => (
                <li key={item.sourceId} className="result-body">
                  {item.title}: {item.excerpt}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
      <p className={print ? undefined : "result-note"}>
        This rehearsal does not prove preparedness. Follow local emergency managers for real instructions.
      </p>
    </>
  );
}
