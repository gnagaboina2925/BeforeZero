import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CASE_STUDIES } from "./cases.ts";

describe("historical case studies", () => {
  it("includes two official U.S. events with source links", () => {
    assert.equal(CASE_STUDIES.length, 2);
    for (const study of CASE_STUDIES) {
      assert.ok(study.timeline.length >= 3);
      assert.ok(study.sources.length >= 2);
      assert.match(study.reconstructionNote, /not documentary/i);
      assert.ok(study.sources.some((source) => /nhc\.noaa\.gov|fema\.gov/i.test(source.url)));
    }
  });
});
