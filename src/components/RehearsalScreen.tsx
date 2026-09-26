"use client";

import { GrokAnswerPanel, type GrokPanelStatus } from "@/components/GrokAnswerPanel";
import { PracticeScene } from "@/components/PracticeScene";
import { QuestionListen } from "@/components/QuestionListen";
import { PRACTICE_DISCLAIMER, STEP_ORDER } from "@/lib/scenario";
import { sceneIdForQuestion } from "@/lib/sceneAssets";
import type { Answers, HouseholdId, InterpretSuccess, Question } from "@/lib/types";

interface RehearsalScreenProps {
  question: Question;
  household: HouseholdId;
  priorAnswers: Answers;
  stepIndex: number;
  selectedChoiceId: string | undefined;
  typedAnswer: string;
  grokStatus: GrokPanelStatus;
  grokResult: InterpretSuccess | null;
  grokError: string | null;
  grokConfirmed: boolean;
  onSelectChoice: (choiceId: string) => void;
  onTypedAnswerChange: (value: string) => void;
  onCheckAnswer: () => void;
  onConfirmInterpretation: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export function RehearsalScreen({
  question,
  household,
  priorAnswers,
  stepIndex,
  selectedChoiceId,
  typedAnswer,
  grokStatus,
  grokResult,
  grokError,
  grokConfirmed,
  onSelectChoice,
  onTypedAnswerChange,
  onCheckAnswer,
  onConfirmInterpretation,
  onContinue,
  onBack,
}: RehearsalScreenProps) {
  const total = STEP_ORDER.length;
  const stepNumber = stepIndex + 1;
  const progressPercent = (stepNumber / total) * 100;
  const sceneId = sceneIdForQuestion(question);

  return (
    <section className="screen-split animate-in" aria-labelledby="rehearsal-heading">
      <PracticeScene sceneId={sceneId} />
      <div className="screen-main">
      <div className="meta-row">
        <p className="kicker">{PRACTICE_DISCLAIMER}</p>
        <p className="step-count" aria-live="polite">
          Step {stepNumber} of {total}
        </p>
      </div>

      <div
        className="progress"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={stepNumber}
        aria-label={`Rehearsal progress, step ${stepNumber} of ${total}`}
      >
        <span className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="prompt-heading">
        <p className="section-label">{question.title}</p>
        {question.eventNotice ? (
          <p className="event-notice">{question.eventNotice}</p>
        ) : null}
      </div>
      <h1 id="rehearsal-heading" className="question">
        {question.prompt}
      </h1>
      <QuestionListen
        key={`${household}-${question.id}`}
        household={household}
        question={question}
        priorAnswers={priorAnswers}
      />

      <fieldset className="choice-set compact-choices">
        <legend className="sr-only">Choose a response</legend>
        <div className="option-stack" role="radiogroup" aria-labelledby="rehearsal-heading">
          {question.choices.map((choice) => {
            const selected = selectedChoiceId === choice.id;
            return (
              <label
                key={choice.id}
                className={`option-card ${selected ? "is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name={`step-${question.stepId}`}
                  value={choice.id}
                  checked={selected}
                  onChange={() => onSelectChoice(choice.id)}
                />
                <span className="option-copy">
                  <span className="option-title">{choice.label}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <GrokAnswerPanel
        question={question}
        typedAnswer={typedAnswer}
        status={grokStatus}
        result={grokResult}
        errorMessage={grokError}
        confirmed={grokConfirmed}
        onTypedAnswerChange={onTypedAnswerChange}
        onCheck={onCheckAnswer}
        onConfirm={onConfirmInterpretation}
      />

      <div className="action-row">
        <button
          type="button"
          className="btn-ghost"
          onClick={onBack}
          disabled={stepIndex === 0 || grokStatus === "checking"}
        >
          Back
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={onContinue}
          disabled={!selectedChoiceId || grokStatus === "checking"}
        >
          {stepIndex === total - 1 ? "See results" : "Continue"}
        </button>
      </div>
      </div>
    </section>
  );
}
