import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, simulateRun } from "./simulation";
import { sensibleActions } from "./test-fixtures";
import {
  fitImage,
  productionAppUrl,
  resultText,
  shareData,
  xComposerUrl,
  xResultText,
} from "./share-data";

const run = simulateRun(DEFAULT_CONFIG, sensibleActions());
describe("local share content", () => {
  it("uses the engine score, mission breakdown, version, seed, and optional name", () => {
    const data = shareData(run, { displayName: "  Ada & friends  " });
    expect(data).toMatchObject({
      title: "Raiku: Inside the Block",
      name: "Ada & friends",
      score: run.score,
      maxScore: 90,
      version: run.config.version,
      seed: run.config.seed,
      community: "Community-built simulation.",
    });
    expect(data.missions.map((mission) => mission.score)).toEqual([30, 30, 30]);
    expect(data.disclaimer).toContain(
      "Not affiliated with or endorsed by Raiku.",
    );
    expect(resultText(run)).not.toContain("Ada");
    expect(shareData(run, { displayName: "A".repeat(30) }).name).toHaveLength(
      24,
    );
  });
  it("never derives an app URL from a preview or browser location", () => {
    for (const value of [
      undefined,
      "",
      "http://localhost:4173",
      "https://localhost",
      "https://127.0.0.1",
      "https://[::1]",
      "https://foo.local",
      "https://test.invalid",
      "https://example.com",
      "https://user:password@blocks.community",
      "javascript:alert(1)",
      "not a URL",
    ])
      expect(productionAppUrl(value)).toBeNull();
    expect(shareData(run).appUrl).toBeNull();
    expect(resultText(run)).not.toContain("http");
    expect(
      productionAppUrl("https://blocks.community/play?preview=1#game"),
    ).toBe("https://blocks.community/play");
    expect(
      shareData(run, { appUrl: "https://blocks.community/play" }).appUrl,
    ).toBe("https://blocks.community/play");
    expect(
      resultText(run, { appUrl: "https://blocks.community/play" }),
    ).toContain("https://blocks.community/play");
  });
  it("opens only a text composer, with exact encoded text and no upload or posting API", () => {
    const text = xResultText(run, { displayName: "Ada & Bo" });
    const url = new URL(xComposerUrl(text));
    expect(url.origin).toBe("https://twitter.com");
    expect(url.pathname).toBe("/intent/tweet");
    expect(url.searchParams.get("text")).toBe(text);
    expect([...url.searchParams.keys()]).toEqual(["text"]);
    expect(text.length).toBeLessThanOrEqual(280);
    expect(text).toContain("Community-built simulation.");
    expect(text).toContain("SEE 30/30");
    expect(text).not.toContain("http");
  });
  it("preserves original logo proportions for landscape and portrait assets", () => {
    expect(fitImage(400, 100, 142, 60)).toEqual({ width: 142, height: 35.5 });
    expect(fitImage(100, 400, 142, 60)).toEqual({ width: 15, height: 60 });
    expect(() => fitImage(0, 100, 142, 60)).toThrow();
  });
});
