"use client";

import { PracticeScene } from "@/components/PracticeScene";
import { householdLabel, PRACTICE_DISCLAIMER, PRODUCT_NAME } from "@/lib/scenario";
import type { BackupRetryComparison } from "@/lib/evaluate";
import type { HouseholdId, RehearsalResults } from "@/lib/types";

interface ResultsScreenProps {
  household: HouseholdId;
  results: RehearsalResults;
  retryComparison: BackupRetryComparison | null;
  onPracticeAgain: () => void;
  onRetryBackupMoment: () => void;
  onEditHousehold: () => void;
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

        <h2>What this rehearsal revealed</h2>
        {results.phoneDependent ? (
          <p>Your lighting and communication choices both depended on a phone.</p>
        ) : (
          <p>Lighting and communication did not both depend on a phone in this practice.</p>
        )}
        {results.backupIdentified && results.backupLabel ? (
          <p>Backup identified in practice: {results.backupLabel}</p>
        ) : results.backupUnanswered ? (
          <p>This backup is unanswered in practice.</p>
        ) : null}

        <h2>Details to prepare</h2>
        {results.detailsToPrepare.length === 0 ? (
          <p>No unanswered details were selected in this practice.</p>
        ) : (
          <ul>
            {results.detailsToPrepare.map((item) => (
              <li key={item.stepId}>
                <strong>{item.choice.label}</strong>
                <div>{item.task}</div>
              </li>
            ))}
          </ul>
        )}

        <h2>Existing preparation</h2>
        {results.plansIdentified.length === 0 ? (
          <p>No existing plans were selected in this practice.</p>
        ) : (
          <ul>
            {results.plansIdentified.map((item) => (
              <li key={item.stepId}>
                {item.questionTitle}: {item.choice.label}
              </li>
            ))}
          </ul>
        )}

        {retryComparison ? (
          <>
            <h2>Retry comparison</h2>
            <p>First response: {retryComparison.firstLabel}</p>
            <p>Revised response: {retryComparison.revisedLabel}</p>
            <p>{retryComparison.summary}</p>
          </>
        ) : null}
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

          <div className="result-block">
            <h2 className="section-heading">What this rehearsal revealed</h2>
            {results.phoneDependent ? (
              <p className="result-body">
                Your lighting and communication choices both depended on a phone.
              </p>
            ) : (
              <p className="result-body">
                Lighting and communication did not both depend on a phone in this
                practice.
              </p>
            )}
            {results.backupIdentified && results.backupLabel ? (
              <p className="result-body">
                Backup identified in practice: {results.backupLabel}
              </p>
            ) : results.backupUnanswered ? (
              <p className="result-body">This backup is unanswered in practice.</p>
            ) : (
              <p className="result-empty">No communication backup step was recorded.</p>
            )}
          </div>

          {retryComparison ? (
            <div className="result-block">
              <h2 className="section-heading">Retry comparison</h2>
              <p className="result-title">First response</p>
              <p className="result-body">{retryComparison.firstLabel}</p>
              <p className="result-title">Revised response</p>
              <p className="result-body">{retryComparison.revisedLabel}</p>
              <p className="result-body">{retryComparison.summary}</p>
              {!retryComparison.firstIdentified && retryComparison.revisedIdentified ? (
                <p className="result-body">
                  A previously unanswered backup is now identified.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="result-block">
            <h2 className="section-heading">Details to prepare</h2>
            {results.detailsToPrepare.length === 0 ? (
              <p className="result-empty">
                No unanswered details were selected in this practice.
              </p>
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

          <div className="result-block">
            <h2 className="section-heading">Plans you identified</h2>
            {results.plansIdentified.length === 0 ? (
              <p className="result-empty">
                No existing plans were selected in this practice.
              </p>
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
