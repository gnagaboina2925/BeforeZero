import {
  beatsForMode,
  practiceFeedback,
  type LessonActionId,
  type LessonBeat,
  type LessonOverlayId,
  type PracticeFeedback,
} from "./catalog.ts";

export type LessonMode = "guided" | "practice";

export interface LessonState {
  mode: LessonMode | null;
  beatIndex: number;
  started: boolean;
  decisions: Partial<Record<string, LessonActionId>>;
  feedback: Partial<Record<string, PracticeFeedback>>;
}

export type LessonEvent =
  | { type: "START"; mode: LessonMode }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "GO_TO"; index: number }
  | { type: "APPLY_DECISION"; actionId: LessonActionId }
  | { type: "RETRY_DECISION" }
  | { type: "RESTART" };

export function createInitialLessonState(): LessonState {
  return {
    mode: null,
    beatIndex: 0,
    started: false,
    decisions: {},
    feedback: {},
  };
}

export function lessonBeats(state: LessonState): LessonBeat[] {
  if (!state.mode) return [];
  return beatsForMode(state.mode);
}

export function currentBeat(state: LessonState): LessonBeat | undefined {
  return lessonBeats(state)[state.beatIndex];
}

export function lessonReducer(state: LessonState, event: LessonEvent): LessonState {
  switch (event.type) {
    case "RESTART":
      return createInitialLessonState();
    case "START":
      return { ...createInitialLessonState(), started: true, mode: event.mode, beatIndex: 0 };
    case "PREV": {
      if (!state.started) return state;
      return { ...state, beatIndex: Math.max(0, state.beatIndex - 1) };
    }
    case "NEXT": {
      const beat = currentBeat(state);
      if (!beat || !state.mode) return state;
      if (beat.kind === "decision" && !state.decisions[beat.id]) return state;
      const last = lessonBeats(state).length - 1;
      return { ...state, beatIndex: Math.min(state.beatIndex + 1, last) };
    }
    case "GO_TO": {
      if (!state.started || !state.mode) return state;
      const beats = lessonBeats(state);
      const target = Math.max(0, Math.min(event.index, beats.length - 1));
      if (target === state.beatIndex) return state;
      if (target < state.beatIndex) return { ...state, beatIndex: target };
      for (let index = state.beatIndex; index < target; index += 1) {
        const item = beats[index];
        if (item.kind === "decision" && !state.decisions[item.id]) {
          return { ...state, beatIndex: index };
        }
      }
      return { ...state, beatIndex: target };
    }
    case "APPLY_DECISION": {
      const beat = currentBeat(state);
      if (!beat || beat.kind !== "decision") return state;
      return {
        ...state,
        decisions: { ...state.decisions, [beat.id]: event.actionId },
        feedback: { ...state.feedback, [beat.id]: practiceFeedback(beat.id, event.actionId) },
      };
    }
    case "RETRY_DECISION": {
      const beat = currentBeat(state);
      if (!beat || beat.kind !== "decision") return state;
      const decisions = { ...state.decisions };
      const feedback = { ...state.feedback };
      delete decisions[beat.id];
      delete feedback[beat.id];
      return { ...state, decisions, feedback };
    }
    default:
      return state;
  }
}

export function beatDisplayText(state: LessonState): { caption: string; narration: string } {
  const beat = currentBeat(state);
  if (!beat) return { caption: "", narration: "" };
  const feedback = state.feedback[beat.id];
  if (beat.kind === "decision" && feedback) {
    return {
      caption: `${feedback.chosen} ${feedback.explanation} ${feedback.recommended}`,
      narration: `${feedback.chosen} ${feedback.explanation} ${feedback.recommended}`,
    };
  }
  return { caption: beat.caption, narration: beat.narration };
}

export function overlayForState(state: LessonState): LessonOverlayId {
  const beat = currentBeat(state);
  if (!beat) return "none";
  const feedback = beat.kind === "decision" ? state.feedback[beat.id] : undefined;
  return feedback?.overlay ?? beat.overlay;
}
