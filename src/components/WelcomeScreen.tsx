"use client";

import { PracticeScene } from "@/components/PracticeScene";
import { HOUSEHOLD_OPTIONS, PRACTICE_DISCLAIMER, PRODUCT_NAME, TAGLINE } from "@/lib/scenario";
import type { HouseholdId } from "@/lib/types";

interface WelcomeScreenProps {
  household: HouseholdId | null;
  onSelectHousehold: (id: HouseholdId) => void;
  onStart: () => void;
  onDemo: () => void;
}

export function WelcomeScreen({
  household,
  onSelectHousehold,
  onStart,
  onDemo,
}: WelcomeScreenProps) {
  return (
    <section className="screen-split animate-in" aria-labelledby="welcome-heading">
      <PracticeScene sceneId="outage-room" />
      <div className="screen-main">
      <p className="kicker">{PRACTICE_DISCLAIMER}</p>
      <h1 id="welcome-heading" className="display">
        {PRODUCT_NAME}
      </h1>
      <p className="tagline">{TAGLINE}</p>
      <p className="lede">
        Practice a power outage, discover gaps in your plan, and leave with
        clear preparation steps.
      </p>

      <fieldset className="choice-set">
        <legend className="section-label">Household</legend>
        <div className="option-stack" role="radiogroup" aria-label="Household type">
          {HOUSEHOLD_OPTIONS.map((option) => {
            const selected = household === option.id;
            return (
              <label
                key={option.id}
                className={`option-card ${selected ? "is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="household"
                  value={option.id}
                  checked={selected}
                  onChange={() => onSelectHousehold(option.id)}
                />
                <span className="option-copy">
                  <span className="option-title">{option.label}</span>
                  <span className="option-help">{option.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="action-row">
        <button
          type="button"
          className="btn-primary"
          onClick={onStart}
          disabled={!household}
        >
          Start practice
        </button>
        <button type="button" className="btn-secondary" onClick={onDemo}>
          Try demo household
        </button>
      </div>
      </div>
    </section>
  );
}
