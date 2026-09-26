import { COMPLICATION_KINDS, type ComplicationKind, type PlanDependency, type SelectedComplication } from "./types.ts";

export function rehearsalKinds(dependencies: PlanDependency[]): ComplicationKind[] {
  return COMPLICATION_KINDS.filter((kind) => dependencies.some((item) => item.kind === kind));
}

export function selectSupportedComplication(
  dependencies: PlanDependency[],
  options: { usedExample?: boolean; chosenKind?: ComplicationKind | null } = {},
): SelectedComplication | null {
  const kinds = rehearsalKinds(dependencies);
  const chosen =
    options.chosenKind && kinds.includes(options.chosenKind)
      ? options.chosenKind
      : kinds.length === 1
        ? kinds[0]
        : null;
  if (!chosen) return null;
  return { kind: chosen, source: options.usedExample ? "example" : "plan" };
}

export function exampleComplication(): SelectedComplication {
  return { kind: "communication", source: "example" };
}

export function isComplicationKind(value: string): value is ComplicationKind {
  return (COMPLICATION_KINDS as readonly string[]).includes(value);
}
