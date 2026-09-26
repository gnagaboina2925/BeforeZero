"use client";

import { PracticeScene } from "@/components/PracticeScene";
import { PreparationResources } from "@/components/PreparationResources";
import {
  PLANS_REPORTED_HEADING,
  type BackupRetryComparison,
} from "@/lib/evaluate";
import { householdLabel, PRACTICE_DISCLAIMER, PRODUCT_NAME } from "@/lib/scenario";
import type { HouseholdId, RehearsalResults } from "@/lib/types";

interface ResultsScreenProps {
  household: HouseholdId;
  results: RehearsalResults;
  retryComparison: BackupRetryComparison | null;
  onPracticeAgain: () => void;
  onRetryBackupMoment: () => void;
  onEditHousehold: () => void;
}

function RehearsalTakeaways({
  results,
  retryComparison,
  mode,
}: {
  results: RehearsalResults;
  retryComparison: BackupRetryComparison | null;
  mode: "screen" | "print";
}) {
  const print = mode === "print";
  const titleClass = print ? undefined : "section-heading";
  const bodyClass = print ? undefined : "result-body";
  const emptyClass = print ? undefined : "result-empty";

  return (
    <>
      <div className={print ? undefined : "result-block"}>
        <h2 className={titleClass}>What this rehearsal revealed</h2>
        {results.phoneDependent ? (
          <p className={bodyClass}>
            Your lighting and communication choices both depended on a phone.
          </p>
        ) : (
          <p className={bodyClass}>
            Lighting and communication did not both depend on a phone in this
            practice.
          </p>
        )}
        {results.backupStatusLine ? (
          <p className={bodyClass}>{results.backupStatusLine}</p>
        ) : null}
        {results.meetingConflictNote ? (
          <p className={bodyClass}>{results.meetingConflictNote}</p>
        ) : null}
      </div>

      {retryComparison ? (
        <div className={print ? undefined : "result-block"}>
          <h2 className={titleClass}>Retry comparison</h2>
          {print ? (
            <>
              <p>First response: {retryComparison.firstLabel}</p>
              <p>Revised response: {retryComparison.revisedLabel}</p>
              <p>{retryComparison.summary}</p>
            </>
          ) : (
            <>
              <p className="result-title">First response</p>
              <p className="result-body">{retryComparison.firstLabel}</p>
              <p className="result-title">Revised response</p>
              <p className="result-body">{retryComparison.revisedLabel}</p>
              <p className="result-body">{retryComparison.summary}</p>
              {retryComparison.gapFullyResolved &&
              !retryComparison.firstIdentified &&
              retryComparison.revisedIdentified ? (
                <p className="result-body">
                  A previously unanswered backup is now identified.
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      <div className={print ? undefined : "result-block"}>
        <h2 className={titleClass}>Details to prepare</h2>
        {results.detailsToPrepare.length === 0 ? (
          <p className={emptyClass}>No preparation follow-ups were generated for these answers.</p>
        ) : print ? (
          <ul>
            {results.detailsToPrepare.map((item) => (
              <li key={item.stepId}>
                <strong>{item.choice.label}</strong>
                <div>{item.task}</div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="result-list">
            {results.detailsToPrepare.map((item) => (
              <li key={item.stepId}>
                <p className="result-title">{item.choice.label}</p>
                <p className="result-body">{item.task}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={print ? undefined : "result-block"}>
        <h2 className={titleClass}>{PLANS_REPORTED_HEADING}</h2>
        {results.plansIdentified.length === 0 ? (
          <p className={emptyClass}>No plans or resources were reported in this practice.</p>
        ) : print ? (
          <ul>
            {results.plansIdentified.map((item) => (
              <li key={item.stepId}>
                {item.questionTitle}: {item.choice.label}
              </li>
            ))}
          </ul>
        ) : (
          <ul className="result-list">
            {results.plansIdentified.map((item) => (
              <li key={item.stepId}>
                <p className="result-title">{item.questionTitle}</p>
                <p className="result-body">{item.choice.label}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PreparationResources print={print} />
    </>
  );
}

export function ResultsScreen({
  household,
  results,
  retryComparison,
  onPracticeAgain,
  onRetryBackupMoment,
  onEditHousehold,
}: ResultsScreenProps) {
  function printCard() {
    window.print();
  }

  return (
    <>
      <section className="print-card print-only" aria-label="Preparation card">
        <p className="print-kicker">{PRODUCT_NAME}</p>
        <h1>Preparation card</h1>
        <p>Household: {householdLabel(household)}</p>
        <p>Practice notes reflect your answers, not verified preparedness.</p>
        <RehearsalTakeaways
          results={results}
          retryComparison={retryComparison}
          mode="print"
        />
      </section>

      <section className="screen-split animate-in no-print" aria-labelledby="results-heading">
        <PracticeScene sceneId="outage-room" />
        <div className="screen-main">
          <div className="meta-row">
            <p className="kicker">{PRACTICE_DISCLAIMER}</p>
          </div>

          <h1 id="results-heading" className="display-sm">
            Your rehearsal notes
          </h1>
          <p className="lede">Here’s what you identified and what still needs planning.</p>
          <p className="result-note">
            Practice notes reflect your answers, not verified preparedness.
          </p>

          <RehearsalTakeaways
            results={results}
            retryComparison={retryComparison}
            mode="screen"
          />

          <div className="action-row">
            {results.phoneDependent ? (
              <button type="button" className="btn-primary" onClick={onRetryBackupMoment}>
                Practice this moment again
              </button>
            ) : null}
            <button type="button" className="btn-secondary" onClick={printCard}>
              Print / Save preparation card
            </button>
            <button
              type="button"
              className={results.phoneDependent ? "btn-secondary" : "btn-primary"}
              onClick={onPracticeAgain}
            >
              Practice again
            </button>
            <button type="button" className="btn-secondary" onClick={onEditHousehold}>
              Edit household
            </button>
          </div>

          <details className="answer-history">
            <summary>Complete answer history</summary>
            <ol className="result-list">
              {results.recorded.map((item) => (
                <li key={item.stepId}>
                  <p className="result-title">{item.questionTitle}</p>
                  <p className="result-body">{item.choice.label}</p>
                </li>
              ))}
            </ol>
          </details>
        </div>
      </section>
    </>
  );
}
