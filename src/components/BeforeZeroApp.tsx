"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RehearsalScreen } from "@/components/RehearsalScreen";
import type { GrokPanelStatus } from "@/components/GrokAnswerPanel";
import { ResultsScreen } from "@/components/ResultsScreen";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { evaluateRehearsal, compareBackupRetry } from "@/lib/evaluate";
import { canConfirmInterpretation, isFreshInterpretation } from "@/lib/freshness";
import {
  getDependentSteps,
  getQuestion,
  priorAnswersForStep,
  PRODUCT_NAME,
  STEP_ORDER,
  TAGLINE,
} from "@/lib/scenario";
import type {
  Answers,
  ClarificationExchange,
  HouseholdId,
  InterpretError,
  InterpretSuccess,
  Screen,
  StepId,
} from "@/lib/types";

const EMPTY_ANSWERS: Answers = {};

interface GrokStepState {
  text: string;
  status: GrokPanelStatus;
  result: InterpretSuccess | null;
  error: string | null;
  confirmed: boolean;
  submittedText: string;
  clarificationExchange: ClarificationExchange | null;
}

const EMPTY_GROK: GrokStepState = {
  text: "",
  status: "idle",
  result: null,
  error: null,
  confirmed: false,
  submittedText: "",
  clarificationExchange: null,
};

export function BeforeZeroApp() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [household, setHousehold] = useState<HouseholdId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [grokByStep, setGrokByStep] = useState<Partial<Record<StepId, GrokStepState>>>({});
  const [backupFirstAttempt, setBackupFirstAttempt] = useState<Answers | null>(null);
  const requestIdRef = useRef(0);
  const stepIdRef = useRef<StepId>(STEP_ORDER[0]);
  const typedTextRef = useRef("");

  const safeStepIndex = Math.min(Math.max(stepIndex, 0), STEP_ORDER.length - 1);
  const stepId = STEP_ORDER[safeStepIndex];
  const question = useMemo(() => {
    if (!household) return null;
    return getQuestion(stepId, household, answers);
  }, [household, stepId, answers]);

  const results = useMemo(() => {
    if (!household) return null;
    return evaluateRehearsal(household, answers);
  }, [household, answers]);

  const retryComparison = useMemo(() => {
    if (!household || !backupFirstAttempt) return null;
    return compareBackupRetry(household, backupFirstAttempt, answers);
  }, [household, backupFirstAttempt, answers]);

  const grok = grokByStep[stepId] ?? EMPTY_GROK;

  useEffect(() => {
    stepIdRef.current = stepId;
    typedTextRef.current = grok.text;
  }, [stepId, grok.text]);

  function updateGrok(id: StepId, patch: Partial<GrokStepState>) {
    setGrokByStep((prev) => {
      const current = prev[id] ?? EMPTY_GROK;
      return { ...prev, [id]: { ...current, ...patch } };
    });
  }

  function clearGrokSteps(ids: StepId[]) {
    if (ids.length === 0) return;
    setGrokByStep((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        delete next[id];
      }
      return next;
    });
  }

  function invalidateInFlight() {
    requestIdRef.current += 1;
  }

  function clearDependents(fromStep: StepId, nextAnswers: Answers): Answers {
    const dependents = getDependentSteps(fromStep);
    const updated = { ...nextAnswers };
    for (const dependent of dependents) {
      delete updated[dependent];
    }
    clearGrokSteps(dependents);
    return updated;
  }

  function resetPracticeState() {
    invalidateInFlight();
    setAnswers(EMPTY_ANSWERS);
    setGrokByStep({});
    setBackupFirstAttempt(null);
    setStepIndex(0);
  }

  function selectHousehold(id: HouseholdId) {
    if (household && household !== id) {
      resetPracticeState();
    }
    setHousehold(id);
  }

  function startPractice() {
    if (!household) return;
    invalidateInFlight();
    setScreen("rehearsal");
    setStepIndex(0);
  }

  function startDemo() {
    resetPracticeState();
    setHousehold("roommates");
    setScreen("rehearsal");
  }

  function selectChoice(choiceId: string) {
    const current = answers[stepId];
    if (current === choiceId) return;

    setAnswers((prev) => {
      const next = { ...prev, [stepId]: choiceId };
      return current ? clearDependents(stepId, next) : next;
    });
  }

  function changeTypedAnswer(value: string) {
    typedTextRef.current = value;
    const current = grokByStep[stepId] ?? EMPTY_GROK;
    const editedAwayFromSubmission =
      current.result !== null && value.trim() !== current.submittedText;
    if (editedAwayFromSubmission) {
      invalidateInFlight();
    }
    updateGrok(stepId, {
      text: value,
      ...(editedAwayFromSubmission
        ? { status: "idle" as const, result: null, error: null, confirmed: false }
        : {}),
    });
  }

  async function checkAnswer() {
    if (!household || grok.status === "checking") return;
    const typedAnswer = grok.text.trim();
    if (!typedAnswer) return;

    const pendingExchange = grok.clarificationExchange;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const submittedText = typedAnswer;
    const submittedStepId = stepId;

    updateGrok(submittedStepId, {
      status: "checking",
      error: null,
      result: null,
      confirmed: false,
      submittedText,
    });

    try {
      const response = await fetch("/api/rehearsal/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          household,
          stepId: submittedStepId,
          typedAnswer: submittedText,
          priorAnswers: priorAnswersForStep(submittedStepId, answers),
          ...(pendingExchange ? { clarificationExchange: pendingExchange } : {}),
        }),
      });

      const payload = (await response.json()) as
        | InterpretSuccess
        | { error?: InterpretError };

      if (
        !isFreshInterpretation({
          requestId,
          currentRequestId: requestIdRef.current,
          stepId: submittedStepId,
          currentStepId: stepIdRef.current,
          submittedText,
          currentText: typedTextRef.current,
        })
      ) {
        return;
      }

      if (!response.ok || !("matchedChoiceId" in payload)) {
        const message =
          "error" in payload && payload.error?.message
            ? payload.error.diagnostic
              ? `${payload.error.message} [${payload.error.diagnostic}]`
              : payload.error.message
            : "Interpretation is unavailable right now. You can still use the listed choices.";
        updateGrok(submittedStepId, {
          status: "error",
          error: message,
          result: null,
          confirmed: false,
        });
        return;
      }

      updateGrok(submittedStepId, {
        status: "ready",
        result: payload,
        error: null,
        confirmed: false,
        clarificationExchange: payload.clarification
          ? {
              previousAnswer: submittedText,
              clarificationQuestion: payload.clarification,
            }
          : null,
      });
    } catch {
      if (
        !isFreshInterpretation({
          requestId,
          currentRequestId: requestIdRef.current,
          stepId: submittedStepId,
          currentStepId: stepIdRef.current,
          submittedText,
          currentText: typedTextRef.current,
        })
      ) {
        return;
      }
      updateGrok(submittedStepId, {
        status: "error",
        error: "Interpretation is unavailable right now. You can still use the listed choices.",
        result: null,
        confirmed: false,
      });
    }
  }

  function confirmInterpretation() {
    const current = grokByStep[stepId] ?? EMPTY_GROK;
    const choiceId = canConfirmInterpretation(current.result);
    if (!choiceId) return;
    selectChoice(choiceId);
    updateGrok(stepId, { confirmed: true, clarificationExchange: null });
  }

  function continueRehearsal() {
    if (!answers[stepId] || grok.status === "checking") return;
    invalidateInFlight();
    updateGrok(stepId, { clarificationExchange: null });
    if (safeStepIndex >= STEP_ORDER.length - 1) {
      setScreen("results");
      return;
    }
    setStepIndex(safeStepIndex + 1);
  }

  function goBack() {
    if (grok.status === "checking") return;
    invalidateInFlight();
    updateGrok(stepId, { clarificationExchange: null });
    setStepIndex(Math.max(0, safeStepIndex - 1));
  }

  function practiceAgain() {
    resetPracticeState();
    setScreen("rehearsal");
  }

  function retryBackupMoment() {
    if (!answers.contact) return;
    invalidateInFlight();
    setBackupFirstAttempt((prev) => prev ?? { ...answers });
    setAnswers((prev) => {
      const next = { ...prev };
      delete next.commBackup;
      return next;
    });
    clearGrokSteps(["commBackup"]);
    setStepIndex(STEP_ORDER.indexOf("commBackup"));
    setScreen("rehearsal");
  }

  function editHousehold() {
    invalidateInFlight();
    setScreen("welcome");
  }

  return (
    <div className="app-shell">
      <header className="app-header no-print">
        <p className="brand">{PRODUCT_NAME}</p>
        <p className="brand-tag">{TAGLINE}</p>
      </header>

      <main className="app-main">
        <div className="panel">
          {screen === "welcome" && (
            <WelcomeScreen
              household={household}
              onSelectHousehold={selectHousehold}
              onStart={startPractice}
              onDemo={startDemo}
            />
          )}

          {screen === "rehearsal" && household && question && (
            <RehearsalScreen
              question={question}
              household={household}
              priorAnswers={priorAnswersForStep(stepId, answers)}
              stepIndex={safeStepIndex}
              selectedChoiceId={answers[stepId]}
              typedAnswer={grok.text}
              grokStatus={grok.status}
              grokResult={grok.result}
              grokError={grok.error}
              grokConfirmed={grok.confirmed}
              onSelectChoice={selectChoice}
              onTypedAnswerChange={changeTypedAnswer}
              onCheckAnswer={() => {
                void checkAnswer();
              }}
              onConfirmInterpretation={confirmInterpretation}
              onContinue={continueRehearsal}
              onBack={goBack}
            />
          )}

          {screen === "results" && household && results && (
            <ResultsScreen
              household={household}
              results={results}
              retryComparison={retryComparison}
              onPracticeAgain={practiceAgain}
              onRetryBackupMoment={retryBackupMoment}
              onEditHousehold={editHousehold}
            />
          )}
        </div>
      </main>
    </div>
  );
}
