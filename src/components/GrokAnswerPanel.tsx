"use client";

import { SpeakAnswer } from "@/components/SpeakAnswer";
import { canConfirmInterpretation } from "@/lib/freshness";
import { MAX_TYPED_ANSWER_LENGTH, type InterpretSuccess, type Question } from "@/lib/types";

export type GrokPanelStatus = "idle" | "checking" | "ready" | "error";

interface GrokAnswerPanelProps {
  question: Question;
  typedAnswer: string;
  status: GrokPanelStatus;
  result: InterpretSuccess | null;
  errorMessage: string | null;
  confirmed: boolean;
  onTypedAnswerChange: (value: string) => void;
  onCheck: () => void;
  onConfirm: () => void;
}

export function GrokAnswerPanel({
  question,
  typedAnswer,
  status,
  result,
  errorMessage,
  confirmed,
  onTypedAnswerChange,
  onCheck,
  onConfirm,
}: GrokAnswerPanelProps) {
  const remaining = MAX_TYPED_ANSWER_LENGTH - typedAnswer.length;
  const overLimit = remaining < 0;
  const canCheck =
    typedAnswer.trim().length > 0 && !overLimit && status !== "checking";
  const confirmableId = canConfirmInterpretation(result);
  const matchedChoice = confirmableId
    ? question.choices.find((choice) => choice.id === confirmableId)
    : null;

  return (
    <div className="grok-panel">
      <div className="grok-panel-header">
        <p className="grok-kicker">Answer your way</p>
        <p className="grok-note">Type or speak your answer, then review it.</p>
        <p className="grok-powered">Powered by Grok</p>
      </div>

      <label className="typed-label" htmlFor={`typed-answer-${question.stepId}`}>
        Answer in your own words
      </label>
      <div className="typed-with-voice">
        <textarea
          id={`typed-answer-${question.stepId}`}
          className="typed-input"
          value={typedAnswer}
          maxLength={MAX_TYPED_ANSWER_LENGTH}
          rows={4}
          onChange={(event) => onTypedAnswerChange(event.target.value)}
          disabled={status === "checking"}
        />
        <SpeakAnswer
          key={question.id}
          questionId={question.id}
          typedAnswer={typedAnswer}
          disabled={status === "checking"}
          onTranscript={onTypedAnswerChange}
        />
      </div>

      <p className={`char-count ${overLimit ? "is-over" : ""}`}>
        {overLimit
          ? `${typedAnswer.length - MAX_TYPED_ANSWER_LENGTH} over the ${MAX_TYPED_ANSWER_LENGTH} character limit`
          : `${typedAnswer.length} / ${MAX_TYPED_ANSWER_LENGTH}`}
      </p>

      <div className="action-row">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCheck}
          disabled={!canCheck}
        >
          {status === "checking" ? "Checking answer…" : "Check my answer"}
        </button>
      </div>

      {status === "checking" && (
        <p className="grok-status" aria-live="polite">
          Checking your wording against the listed choices…
        </p>
      )}

      {status === "error" && errorMessage && (
        <p className="grok-error" role="alert">
          {errorMessage} Your typed words are still here. You can revise them
          or pick a listed choice.
        </p>
      )}

      {status === "ready" && result && (
        <div className="grok-result" aria-live="polite">
          <p className="grok-kicker">Grok feedback</p>
          <p className="grok-feedback">{result.feedback}</p>
          {matchedChoice ? (
            <p className="grok-match">
              Interpreted as: {matchedChoice.label}
            </p>
          ) : null}
          {result.clarification ? (
            <p className="grok-clarify">{result.clarification}</p>
          ) : null}
          {confirmableId && matchedChoice && !confirmed ? (
            <button type="button" className="btn-primary" onClick={onConfirm}>
              Use this interpretation
            </button>
          ) : null}
          {confirmed && matchedChoice ? (
            <p className="grok-confirmed">
              Saved as “{matchedChoice.label}”. Continue when you are ready.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
