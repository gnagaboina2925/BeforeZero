export const TEXT_SIZES = ["default", "large", "larger"] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

export const CONTRAST_MODES = ["default", "high"] as const;
export type ContrastMode = (typeof CONTRAST_MODES)[number];

export const MOTION_MODES = ["system", "reduce", "allow"] as const;
export type MotionMode = (typeof MOTION_MODES)[number];

export interface AccessPreferences {
  textSize: TextSize;
  contrast: ContrastMode;
  narration: boolean;
  captions: boolean;
  motion: MotionMode;
}

export const DEFAULT_PREFERENCES: AccessPreferences = {
  textSize: "default",
  contrast: "default",
  narration: false,
  captions: true,
  motion: "system",
};

export const PREFERENCE_STORAGE_KEY = "beforezero-access-preferences";

export function parsePreferences(value: unknown): AccessPreferences {
  if (!value || typeof value !== "object") return { ...DEFAULT_PREFERENCES };
  const record = value as Record<string, unknown>;
  return {
    textSize: TEXT_SIZES.includes(record.textSize as TextSize)
      ? (record.textSize as TextSize)
      : DEFAULT_PREFERENCES.textSize,
    contrast: CONTRAST_MODES.includes(record.contrast as ContrastMode)
      ? (record.contrast as ContrastMode)
      : DEFAULT_PREFERENCES.contrast,
    narration: typeof record.narration === "boolean" ? record.narration : DEFAULT_PREFERENCES.narration,
    captions: typeof record.captions === "boolean" ? record.captions : DEFAULT_PREFERENCES.captions,
    motion: MOTION_MODES.includes(record.motion as MotionMode)
      ? (record.motion as MotionMode)
      : DEFAULT_PREFERENCES.motion,
  };
}

export function applyPreferencesToDocument(
  prefs: AccessPreferences,
  root: { setAttribute: (name: string, value: string) => void; removeAttribute: (name: string) => void },
): void {
  root.setAttribute("data-text-size", prefs.textSize);
  root.setAttribute("data-contrast", prefs.contrast);
  root.setAttribute("data-captions", prefs.captions ? "on" : "off");
  root.setAttribute("data-narration", prefs.narration ? "on" : "off");
  root.setAttribute("data-motion", prefs.motion);
}
