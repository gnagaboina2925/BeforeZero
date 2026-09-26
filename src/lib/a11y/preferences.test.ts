import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyPreferencesToDocument,
  DEFAULT_PREFERENCES,
  parsePreferences,
} from "./preferences.ts";

describe("access preferences", () => {
  it("fills defaults for incomplete stored values", () => {
    const parsed = parsePreferences({ textSize: "larger", captions: false });
    assert.equal(parsed.textSize, "larger");
    assert.equal(parsed.captions, false);
    assert.equal(parsed.narration, DEFAULT_PREFERENCES.narration);
    assert.equal(parsed.contrast, "default");
  });

  it("rejects unknown enums instead of inventing modes", () => {
    const parsed = parsePreferences({ textSize: "huge", motion: "off" });
    assert.equal(parsed.textSize, "default");
    assert.equal(parsed.motion, "system");
  });

  it("writes data attributes used by CSS", () => {
    const attrs: Record<string, string> = {};
    applyPreferencesToDocument(
      { ...DEFAULT_PREFERENCES, textSize: "large", contrast: "high", captions: false, narration: true, motion: "reduce" },
      {
        setAttribute: (name, value) => {
          attrs[name] = value;
        },
        removeAttribute: () => undefined,
      },
    );
    assert.equal(attrs["data-text-size"], "large");
    assert.equal(attrs["data-contrast"], "high");
    assert.equal(attrs["data-captions"], "off");
    assert.equal(attrs["data-narration"], "on");
    assert.equal(attrs["data-motion"], "reduce");
  });
});
