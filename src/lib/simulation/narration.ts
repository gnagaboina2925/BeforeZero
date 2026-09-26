import { scenePrompt, sceneTitle } from "./reducer.ts";
import type { SimState } from "./types.ts";

export function sceneNarration(state: SimState): string {
  const parts = [
    "This is a practice scenario, not a live emergency.",
    sceneTitle(state.sceneId) + ".",
    scenePrompt(state.sceneId, state),
  ];

  if (state.lighting === "phone") {
    parts.push("A phone flashlight is lighting a small area of the room.");
  } else if (state.lighting === "flashlight") {
    parts.push("A flashlight you reported is lighting the room.");
  } else if (state.lighting === "candles") {
    parts.push("You reported candles as lighting. This practice records that answer.");
  } else {
    parts.push("The room is still dark.");
  }

  if (state.network === "interrupted") {
    parts.push("Calls and texts are interrupted in this practice scene.");
  }
  if (state.phoneBattery === "low") {
    parts.push("The phone battery is treated as low in this scripted event. That is not a real reading.");
  }
  if (state.messages.some((item) => item.status === "attempted")) {
    parts.push("An outgoing fictional message is shown. Delivery is not confirmed.");
  }

  return parts.join(" ");
}
