import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProviderRequestError } from "../xai.ts";
import { interpretSimulationUtterance } from "./interpretAction.ts";
import {
  canApplyProposal,
  parseSimulateInterpretRequest,
  sanitizeSimulationInterpretation,
} from "./interpret.ts";

describe("simulation interpretation sanitizer", () => {
  it("keeps multiple permitted actions from one utterance", () => {
    const proposal = sanitizeSimulationInterpretation(
      {
        proposedActionIds: ["phone-light", "text-roommate"],
        availability: "present",
        unsupportedNote: null,
        feedback: "You would use a phone light and send a text.",
        clarification: null,
      },
      "lights-out",
    );
    assert.deepEqual(proposal.proposedActionIds, ["phone-light", "text-roommate"]);
    assert.equal(canApplyProposal(proposal), true);
  });

  it("drops invented action ids instead of remapping them", () => {
    const proposal = sanitizeSimulationInterpretation(
      {
        proposedActionIds: ["evacuate-now", "phone-light"],
        availability: "present",
        unsupportedNote: "Driving to a hospital is not a listed action.",
        feedback: "You mentioned a phone light and leaving.",
        clarification: null,
      },
      "lights-out",
    );
    assert.deepEqual(proposal.proposedActionIds, ["phone-light"]);
    assert.deepEqual(proposal.droppedIds, ["evacuate-now"]);
    assert.match(proposal.unsupportedNote ?? "", /hospital|not a listed/i);
  });

  it("does not apply future intention as a present resource", () => {
    const proposal = sanitizeSimulationInterpretation(
      {
        proposedActionIds: ["flashlight"],
        availability: "intention",
        unsupportedNote: null,
        feedback: "You plan to buy a flashlight later.",
        clarification: "Do you already have a flashlight, or is that still to arrange?",
      },
      "lights-out",
    );
    assert.equal(canApplyProposal(proposal), false);
    assert.equal(proposal.availability, "intention");
    assert.ok(proposal.clarification);
  });

  it("rejects unknown scenes and empty utterances", () => {
    assert.equal(parseSimulateInterpretRequest({}).ok, false);
    assert.equal(
      parseSimulateInterpretRequest({ sceneId: "lights-out", utterance: "   " }).ok,
      false,
    );
    assert.equal(
      parseSimulateInterpretRequest({ sceneId: "debrief", utterance: "hello" }).ok,
      false,
    );
  });
});

describe("interpretSimulationUtterance", () => {
  it("maps a mocked multi-action payload", async () => {
    const result = await interpretSimulationUtterance(
      {
        sceneId: "lights-out",
        utterance: "I'll use my phone flashlight and text my roommate",
        appliedActionIds: [],
      },
      {
        apiKey: "test-key",
        complete: async () => ({
          proposedActionIds: ["phone-light", "text-roommate"],
          availability: "present",
          unsupportedNote: null,
          feedback: "You mentioned a phone flashlight and a text.",
          clarification: null,
        }),
      },
    );
    assert.deepEqual(result.proposedActionIds, ["phone-light", "text-roommate"]);
    assert.equal(canApplyProposal(result), true);
  });

  it("surfaces a mocked provider failure", async () => {
    await assert.rejects(
      () =>
        interpretSimulationUtterance(
          { sceneId: "lights-out", utterance: "phone light" },
          {
            apiKey: "test-key",
            complete: async () => {
              throw new ProviderRequestError("unavailable", "Interpretation is unavailable right now.", null, "unavailable:network");
            },
          },
        ),
      /unavailable|network/i,
    );
  });
});
