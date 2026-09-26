"use client";

import { PreparationResources } from "@/components/PreparationResources";
import { SceneListen } from "@/components/SceneListen";
import { SimulationStage } from "@/components/SimulationStage";
import { SpeakAnswer } from "@/components/SpeakAnswer";
import { PRODUCT_NAME } from "@/lib/scenario";
import { actionsForScene, SIM_ACTIONS, SIMULATION_LABEL } from "@/lib/simulation/catalog";
import { summarizeSimulation } from "@/lib/simulation/debrief";
import { canApplyProposal } from "@/lib/simulation/interpret";
import { sceneNarration } from "@/lib/simulation/narration";
import { canAdvance, scenePrompt, sceneTitle, simulationReducer } from "@/lib/simulation/reducer";
import { createInitialSimState } from "@/lib/simulation/state";
import type { SimActionProposal } from "@/lib/simulation/types";
import { MAX_TYPED_ANSWER_LENGTH, type ClarificationExchange, type InterpretError } from "@/lib/types";
import { useMemo, useReducer, useRef, useState } from "react";

type GrokStatus = "idle" | "checking" | "ready" | "error";

export function SimulationApp() {
  const [state, dispatch] = useReducer(simulationReducer, undefined, createInitialSimState);
  const [runId, setRunId] = useState(0);
  const [muted, setMuted] = useState(false);
  const [utterance, setUtterance] = useState("");
  const [status, setStatus] = useState<GrokStatus>("idle");
  const [proposal, setProposal] = useState<SimActionProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clarificationExchange, setClarificationExchange] = useState<ClarificationExchange | null>(null);
  const requestIdRef = useRef(0);
  const utteranceRef = useRef("");
  const debrief = useMemo(() => summarizeSimulation(state), [state]);
  const narration = useMemo(() => sceneNarration(state), [state]);
  const suggested = actionsForScene(state.sceneId);

  function invalidate() {
    requestIdRef.current += 1;
  }

  function restart() {
    invalidate();
    dispatch({ type: "RESTART" });
    setRunId((value) => value + 1);
    setUtterance("");
    utteranceRef.current = "";
    setProposal(null);
    setError(null);
    setStatus("idle");
    setClarificationExchange(null);
  }

  function replay() {
    invalidate();
    dispatch({ type: "REPLAY_TURNING_POINT" });
    setRunId((value) => value + 1);
    setUtterance("");
    utteranceRef.current = "";
    setProposal(null);
    setError(null);
    setStatus("idle");
    setClarificationExchange(null);
  }

  async function interpretUtterance() {
    const text = utterance.trim();
    if (!text || status === "checking" || state.sceneId === "debrief") return;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setStatus("checking");
    setError(null);
    setProposal(null);

    try {
      const response = await fetch("/api/simulate/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId: state.sceneId,
          utterance: text,
          appliedActionIds: state.history.map((item) => item.actionId),
          ...(clarificationExchange ? { clarificationExchange } : {}),
        }),
      });
      const payload = (await response.json()) as SimActionProposal | { error?: InterpretError };
      if (requestId !== requestIdRef.current) return;

      if (!response.ok || !("proposedActionIds" in payload)) {
        const message =
          "error" in payload && payload.error?.message
            ? payload.error.diagnostic
              ? `${payload.error.message} [${payload.error.diagnostic}]`
              : payload.error.message
            : "Interpretation is unavailable right now. Use a suggested action instead.";
        setStatus("error");
        setError(message);
        return;
      }

      setProposal(payload);
      setStatus("ready");
      setClarificationExchange(
        payload.clarification
          ? { previousAnswer: text, clarificationQuestion: payload.clarification }
          : null,
      );
    } catch {
      if (requestId !== requestIdRef.current) return;
      setStatus("error");
      setError("Interpretation is unavailable right now. Use a suggested action instead.");
    }
  }

  function applyProposal() {
    if (!proposal || !canApplyProposal(proposal)) return;
    dispatch({ type: "APPLY_ACTIONS", actionIds: proposal.proposedActionIds });
    setProposal(null);
    setStatus("idle");
    setClarificationExchange(null);
    setUtterance("");
    utteranceRef.current = "";
  }

  function applySuggested(actionId: string) {
    dispatch({ type: "APPLY_ACTIONS", actionIds: [actionId] });
    setProposal(null);
    setStatus("idle");
    setClarificationExchange(null);
  }

  const phoneBatteryLabel =
    state.phoneBattery === "low"
      ? "Practice battery: low (scripted event, not a real reading)"
      : "Practice battery: available (not a real reading)";
  const latestEvent = state.eventLog.at(-1);
  const olderEvents = state.eventLog.slice(0, -1);

  return (
    <div className="sim-layout" key={runId}>
      <section className="sim-brief" aria-labelledby="sim-scene-title">
        <div className="sim-brief-top">
          <p className="kicker">{SIMULATION_LABEL}</p>
          <div className="sim-brief-tools">
            <button
              type="button"
              className="btn-ghost"
              aria-pressed={muted}
              onClick={() => setMuted((value) => !value)}
            >
              {muted ? "Unmute" : "Mute"}
            </button>
            <button type="button" className="btn-ghost" onClick={restart}>
              Restart
            </button>
          </div>
        </div>
        <div className="sim-meta">
          <h1 id="sim-scene-title" className="sim-title">
            {sceneTitle(state.sceneId)}
          </h1>
          <p className="sim-time">{state.elapsedLabel}</p>
        </div>
        <p className="sim-narration">{scenePrompt(state.sceneId, state)}</p>
      </section>

      {state.sceneId !== "debrief" ? (
        <>
          <div className="sim-board">
            <SimulationStage lighting={state.lighting} />
            <aside className="sim-rail" aria-label="Phone and recent events">
              <div className="sim-phone">
                <h2 className="section-label">Practice phone</h2>
                <p className="result-body">{phoneBatteryLabel}</p>
                <p className="result-body">
                  {state.network === "interrupted"
                    ? "Network in this scene: interrupted (scripted)"
                    : "Network in this scene: available (fictional)"}
                </p>
                <p className="result-note">Messages here are fictional. Delivery is not confirmed.</p>
                {state.messages.length === 0 ? (
                  <p className="result-empty">No messages yet.</p>
                ) : (
                  <ul className="sim-messages">
                    {state.messages.map((message) => (
                      <li key={message.id} className={`sim-message is-${message.status}`}>
                        <span className="sim-message-meta">
                          Outgoing · {message.status === "blocked" ? "not sent" : "attempted"}
                        </span>
                        <span>{message.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="sim-events">
                <h2 className="section-label">Recent events</h2>
                {latestEvent ? (
                  <p className="sim-latest-event">{latestEvent.text}</p>
                ) : (
                  <p className="result-empty">No events yet.</p>
                )}
                {olderEvents.length > 0 ? (
                  <details className="sim-older-events">
                    <summary>Earlier events ({olderEvents.length})</summary>
                    <ol className="sim-log">
                      {olderEvents.map((entry) => (
                        <li key={entry.id}>{entry.text}</li>
                      ))}
                    </ol>
                  </details>
                ) : null}
              </div>
            </aside>
          </div>

          <div className="sim-action-bar">
            <div className="sim-action-row">
              <SceneListen
                key={muted ? "muted" : "live"}
                cacheKey={narration}
                narration={narration}
                muted={muted}
              />
              <SpeakAnswer
                questionId={`${runId}-${state.sceneId}`}
                typedAnswer={utterance}
                disabled={status === "checking"}
                speakLabel="Speak your action"
                transcriptHint="Transcript added. Review it, then interpret the action."
                onTranscript={(text) => {
                  utteranceRef.current = text;
                  setUtterance(text);
                }}
              />
            </div>
            <label className="field">
              <span className="field-label">Or type your action</span>
              <textarea
                value={utterance}
                maxLength={MAX_TYPED_ANSWER_LENGTH}
                rows={2}
                onChange={(event) => {
                  utteranceRef.current = event.target.value;
                  setUtterance(event.target.value);
                }}
              />
              <span className="char-count">
                {utterance.length} / {MAX_TYPED_ANSWER_LENGTH}
              </span>
            </label>
            <div className="sim-submit-row">
              <button
                type="button"
                className="btn-secondary"
                disabled={!utterance.trim() || status === "checking"}
                onClick={() => {
                  void interpretUtterance();
                }}
              >
                {status === "checking" ? "Interpreting…" : "Interpret action"}
              </button>
              {canAdvance(state.sceneId) ? (
                <button type="button" className="btn-primary" onClick={() => dispatch({ type: "ADVANCE_SCENE" })}>
                  Advance scenario
                </button>
              ) : null}
            </div>
            {error ? (
              <p className="grok-error" role="alert">
                {error}
              </p>
            ) : null}
            {proposal ? (
              <div className="sim-proposal">
                <p className="result-body">{proposal.feedback}</p>
                {proposal.unsupportedNote ? (
                  <p className="result-note">{proposal.unsupportedNote}</p>
                ) : null}
                {proposal.clarification ? (
                  <p className="result-body">{proposal.clarification}</p>
                ) : null}
                {proposal.availability === "intention" || proposal.availability === "mixed" ? (
                  <p className="result-note">
                    That sounds like something still to arrange, so it was not applied as a current resource.
                  </p>
                ) : null}
                {proposal.proposedActionIds.length > 0 ? (
                  <ul className="result-list">
                    {proposal.proposedActionIds.map((id) => (
                      <li key={id}>{SIM_ACTIONS[id].label}</li>
                    ))}
                  </ul>
                ) : null}
                {canApplyProposal(proposal) ? (
                  <button type="button" className="btn-primary" onClick={applyProposal}>
                    Do this
                  </button>
                ) : null}
              </div>
            ) : null}

            <details className="sim-suggested">
              <summary>Suggested actions</summary>
              <ul className="option-stack compact-choices">
                {suggested.map((action) => (
                  <li key={action.id}>
                    <button type="button" className="btn-ghost" onClick={() => applySuggested(action.id)}>
                      {action.label}
                    </button>
                    {action.hint ? <p className="option-help">{action.hint}</p> : null}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </>
      ) : (
        <section className="sim-debrief" aria-labelledby="debrief-heading">
          <section className="print-card print-only" aria-label="Preparation card">
            <p className="print-kicker">{PRODUCT_NAME}</p>
            <h1>Preparation card</h1>
            <p>Fictional roommates household. Practice notes reflect your actions, not verified preparedness.</p>
            <DebriefLists debrief={debrief} print />
            <PreparationResources print />
          </section>

          <div className="sim-card no-print">
            <h1 id="debrief-heading" className="display-sm">
              Your rehearsal notes
            </h1>
            <p className="result-note">Practice notes reflect your actions, not verified preparedness.</p>
            <DebriefLists debrief={debrief} />
            <PreparationResources />
            <div className="action-row">
              <button type="button" className="btn-primary" onClick={replay}>
                Replay the turning point
              </button>
              <button type="button" className="btn-secondary" onClick={() => window.print()}>
                Print / Save preparation card
              </button>
              <button type="button" className="btn-ghost" onClick={restart}>
                Restart
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function DebriefLists({
  debrief,
  print = false,
}: {
  debrief: ReturnType<typeof summarizeSimulation>;
  print?: boolean;
}) {
  const titleClass = print ? undefined : "section-heading";
  const bodyClass = print ? undefined : "result-body";
  return (
    <>
      <h2 className={titleClass}>What you chose</h2>
      <ul>{debrief.whatYouChose.map((item) => <li key={item} className={bodyClass}>{item}</li>)}</ul>
      <h2 className={titleClass}>What the scenario introduced</h2>
      <ul>{debrief.whatScenarioIntroduced.map((item) => <li key={item} className={bodyClass}>{item}</li>)}</ul>
      <h2 className={titleClass}>What you tried next</h2>
      <ul>{debrief.whatYouTriedNext.map((item) => <li key={item} className={bodyClass}>{item}</li>)}</ul>
      <h2 className={titleClass}>What still needs planning</h2>
      <ul>{debrief.stillNeedsPlanning.map((item) => <li key={item} className={bodyClass}>{item}</li>)}</ul>
      {debrief.replayComparison ? (
        <>
          <h2 className={titleClass}>Replay comparison</h2>
          <p className={bodyClass}>{debrief.replayComparison}</p>
        </>
      ) : null}
    </>
  );
}
