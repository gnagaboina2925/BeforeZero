import { getHazardConfig } from "./hazards.ts";
import {
  COMPLICATION_KINDS,
  type ComplicationKind,
  type PlanDependency,
  type PlanHazardId,
  type SelectedComplication,
} from "./types.ts";

export function rehearsalKinds(
  dependencies: PlanDependency[],
  allowedKinds?: readonly ComplicationKind[],
): ComplicationKind[] {
  const pool = allowedKinds ?? COMPLICATION_KINDS;
  return pool.filter((kind) => dependencies.some((item) => item.kind === kind));
}

export function selectSupportedComplication(
  dependencies: PlanDependency[],
  options: { usedExample?: boolean; chosenKind?: ComplicationKind | null; hazardId?: PlanHazardId } = {},
): SelectedComplication | null {
  const allowed = options.hazardId ? getHazardConfig(options.hazardId).kinds : COMPLICATION_KINDS;
  const kinds = rehearsalKinds(dependencies, allowed);
  const chosen =
    options.chosenKind && kinds.includes(options.chosenKind)
      ? options.chosenKind
      : kinds.length === 1
        ? kinds[0]
        : null;
  if (!chosen) return null;
  return { kind: chosen, source: options.usedExample ? "example" : "plan" };
}

export function exampleComplication(hazardId: PlanHazardId = "hurricane"): SelectedComplication {
  return { kind: getHazardConfig(hazardId).exampleKind, source: "example" };
}

export function isComplicationKind(value: string, allowedKinds?: readonly ComplicationKind[]): value is ComplicationKind {
  const pool = allowedKinds ?? COMPLICATION_KINDS;
  return (pool as readonly string[]).includes(value);
}
