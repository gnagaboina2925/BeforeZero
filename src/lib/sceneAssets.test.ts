import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  detectImageExtension,
  existingSceneFile,
  sceneIdForQuestion,
} from "./sceneAssets.ts";
import { getQuestion } from "./scenario.ts";

describe("scene assets", () => {
  it("detects png, jpeg, and webp from magic bytes", () => {
    assert.equal(detectImageExtension(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), "png");
    assert.equal(detectImageExtension(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])), "jpg");
    assert.equal(
      detectImageExtension(
        Uint8Array.from([
          0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
        ]),
      ),
      "webp",
    );
  });

  it("skips a scene when a matching file already exists", () => {
    assert.equal(
      existingSceneFile(["manifest.json", "outage-room.png", "notes.txt"], "outage-room"),
      "outage-room.png",
    );
    assert.equal(existingSceneFile(["manifest.json"], "phone-backup"), null);
  });

  it("uses the phone-backup scene only for the battery complication", () => {
    const ordinary = getQuestion("lighting", "alone", {});
    const complication = getQuestion("commBackup", "alone", {
      lighting: "phone-light",
      contact: "phone",
    });
    const otherBackup = getQuestion("commBackup", "alone", {
      lighting: "known-flashlight",
      contact: "phone",
    });
    assert.equal(sceneIdForQuestion(ordinary), "outage-room");
    assert.equal(sceneIdForQuestion(complication), "phone-backup");
    assert.equal(sceneIdForQuestion(otherBackup), "outage-room");
  });
});
