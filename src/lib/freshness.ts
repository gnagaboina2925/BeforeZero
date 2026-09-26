import type { InterpretSuccess } from "./types.ts";

export function isFreshInterpretation(args: {
  requestId: number;
  currentRequestId: number;
  stepId: string;
  currentStepId: string;
  submittedText: string;
  currentText: string;
}): boolean {
  return (
    args.requestId === args.currentRequestId &&
    args.stepId === args.currentStepId &&
    args.submittedText === args.currentText.trim()
  );
}

export function canConfirmInterpretation(result: InterpretSuccess | null): string | null {
  if (!result?.matchedChoiceId || result.clarification) return null;
  return result.matchedChoiceId;
}
