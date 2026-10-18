import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import {
  DEFAULT_CONFIG,
  resolveRound,
  simulateRun,
} from "../src/lib/simulation";
import { sensibleActions } from "../src/lib/test-fixtures";
import { missionBreakdown } from "../src/lib/results";
import { resultText, xResultText } from "../src/lib/share-data";
import type { RunConfig } from "../src/lib/simulation";

async function loadResults(
  page: Page,
  config: RunConfig = DEFAULT_CONFIG,
  withDrop = false,
) {
  const actions = sensibleActions(config);
  actions[7] = { kind: "act", pathId: "raiku" }; // Genuine included-but-unprofitable engine result.
  if (withDrop) actions[6] = { kind: "act", pathId: "public" };
  const run = simulateRun(config, actions);
  const snapshot = { config, actions };
  await page.goto("/");
  await page.evaluate(
    ({ snapshot, scoreKey }) => {
      localStorage.setItem(
        "raiku-inside-the-block:progress:v2",
        JSON.stringify({
          completedRuns: 1,
          lastRun: snapshot,
          best: { [scoreKey]: snapshot },
          history: [{ runNumber: 1, record: snapshot }],
        }),
      );
      localStorage.setItem(
        "raiku-inside-the-block:onboarding:v1",
        JSON.stringify({ displayName: "Ada", choice: "pass", replayStep: 3 }),
      );
    },
    { snapshot, scoreKey: `${config.version}/seed-${config.seed}` },
  );
  await page.goto("/results");
  await expect(
    page.getByRole("heading", { name: "Your decisions, unpacked." }),
  ).toBeVisible();
  return run;
}

test("results and 1200×630 PNG use actual engine values and locally served assets", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const run = await loadResults(page);
  await expect(page.locator(".result-score")).toContainText(String(run.score));
  for (const [index, mission] of missionBreakdown(run).entries()) {
    await expect(
      page.locator(".mission-totals section").nth(index),
    ).toContainText(`${mission.score}`);
    await expect(
      page.locator(".mission-totals section").nth(index),
    ).toContainText(mission.id);
  }
  await expect(
    page.getByRole("heading", { name: "Your local best", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Personal best history" }),
  ).toContainText(`${run.score}/90`);
  await expect(
    page.getByRole("region", { name: "One useful lesson" }),
  ).toContainText("LAND round 2");
  const canvas = page.locator(".share-card-preview");
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await expect(canvas).toHaveAttribute("aria-label", /Ada/);
  expect(
    await canvas.evaluate((element: HTMLCanvasElement) => ({
      width: element.width,
      height: element.height,
      paper: [...element.getContext("2d")!.getImageData(0, 0, 1, 1).data],
      ink: [...element.getContext("2d")!.getImageData(100, 180, 1, 1).data],
    })),
  ).toEqual({
    width: 1200,
    height: 630,
    paper: [239, 238, 233, 255],
    ink: [34, 61, 14, 255],
  });
  expect(
    await page.evaluate(
      () =>
        document.fonts.check("500 44px Geist") &&
        document.fonts.check('400 24px "Geist Mono"'),
    ),
  ).toBe(true);
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download card", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("raiku-inside-the-block.png");
  const path = `/tmp/raiku-results-card-${test.info().project.name}.png`;
  await download.saveAs(path);
  const bytes = await readFile(path);
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);
  await expect(
    page.getByText("PNG card downloaded. Attach it manually when sharing.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(
    requests.filter((url) => /\.woff2?(\?|$)/.test(url)).length,
  ).toBeGreaterThan(0);
  expect(
    requests.every((url) => new URL(url).origin === "http://127.0.0.1:4173"),
  ).toBe(true);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `/tmp/raiku-results-${test.info().project.name}.png`,
    fullPage: true,
  });
});

test("copy and X composer are optional and do not upload the downloaded image", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const run = await loadResults(page);
  const share = page.getByRole("link", { name: "Share on X" });
  const url = new URL((await share.getAttribute("href"))!);
  expect(url.origin).toBe("https://twitter.com");
  expect(url.pathname).toBe("/intent/tweet");
  expect(url.searchParams.get("text")).toBe(
    xResultText(run, { displayName: "Ada" }),
  );
  expect([...url.searchParams.keys()]).toEqual(["text"]);
  await expect(
    page.getByText(
      "No valid production app URL is configured, so no app URL is included.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator(".sharing-explanation")).toContainText(
    "Attach your downloaded PNG manually",
  );
  await page.getByRole("button", { name: "Copy result text" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    resultText(run, { displayName: "Ada" }),
  );
  await page
    .getByRole("checkbox", {
      name: "Include my display name on the card and result text",
    })
    .uncheck();
  await expect(page.locator(".share-card-preview")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(page.locator(".share-card-preview")).not.toHaveAttribute(
    "aria-label",
    /Ada/,
  );
  await page.getByRole("button", { name: "Copy result text" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    resultText(run),
  );
  expect(
    new URL((await share.getAttribute("href"))!).searchParams.get("text"),
  ).toBe(xResultText(run));
});

test("play, pause, backward, forward, and restart show recorded engine events", async ({
  page,
}) => {
  const run = await loadResults(page);
  await page.getByText("Replay recorded events", { exact: true }).click();
  const card = page.locator(".replay-event-card");
  await expect(card).toHaveAttribute(
    "data-event-kind",
    run.rounds[0].events[0].kind,
  );
  await page.clock.install();
  await page.getByRole("button", { name: "Play replay", exact: true }).click();
  await page.clock.runFor(1700);
  await expect(card).toHaveAttribute(
    "data-event-kind",
    run.rounds[0].events[1].kind,
  );
  await page.getByRole("button", { name: "Pause replay", exact: true }).click();
  await page.clock.runFor(6000);
  await expect(card).toHaveAttribute(
    "data-event-kind",
    run.rounds[0].events[1].kind,
  );
  await page.getByRole("button", { name: "Step backward" }).click();
  await expect(card).toHaveAttribute(
    "data-event-tick",
    String(run.rounds[0].events[0].tick),
  );
  await page.getByRole("button", { name: "Step forward" }).click();
  await expect(card).toHaveAttribute(
    "data-event-kind",
    run.rounds[0].events[1].kind,
  );
  await page.getByRole("button", { name: "Replay from beginning" }).click();
  await expect(card).toHaveAttribute("data-event-kind", "executed");
  await expect(
    page.getByRole("button", { name: "Step backward" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Play replay", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", { name: "Pause replay" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("button", { name: "Play replay" })).toBeVisible();
  await expect(page.locator(".text-timeline")).toHaveAttribute("open", "");
  expect(
    await card.evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
});

test("Pass, drop, and included failure timelines exactly match engine events", async ({
  page,
}) => {
  const config = Array.from({ length: 20 }, (_, seed) => ({
    ...DEFAULT_CONFIG,
    seed,
  })).find(
    (config) =>
      resolveRound(config, 5, { kind: "act", pathId: "public" }).status ===
      "failed",
  )!;
  const run = await loadResults(page, config, true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const index of [1, 5, 6, 7]) {
    await page.locator(".round-selector button").nth(index).click();
    for (const title of [
      "What you knew",
      "What you chose",
      "What happened",
      "What to notice next time",
    ])
      await expect(
        page.getByRole("heading", { name: title, exact: true }),
      ).toBeVisible();
    await page.getByText("Replay recorded events", { exact: true }).click();
    await expect(page.locator(".text-timeline")).toHaveAttribute("open", "");
    expect(
      await page.locator(".text-timeline li").evaluateAll((elements) =>
        elements.map((element) => ({
          kind: element.getAttribute("data-event-kind"),
          tick: Number(element.getAttribute("data-event-tick")),
        })),
      ),
    ).toEqual(
      run.rounds[index].events.map((event) => ({
        kind: event.kind,
        tick: event.tick,
      })),
    );
    expect(await page.locator(".text-timeline li p").allTextContents()).toEqual(
      run.rounds[index].events.map((event) => event.detail),
    );
    const stages = page.getByRole("list", { name: "Round replay stages" });
    await expect(stages).toContainText("Event executed");
    await expect(stages).toContainText("Strategy observed");
    await expect(stages).toContainText("Player decided");
    await expect(stages).toContainText("Submission arrived");
    await expect(stages).toContainText("Inclusion/execution outcome");
    if (run.rounds[index].status === "passed")
      await expect(stages).toContainText("no submission");
    if (["passed", "dropped"].includes(run.rounds[index].status))
      await expect(
        page.locator('.text-timeline li[data-event-kind="inclusion"]'),
      ).toHaveCount(0);
    if (run.rounds[index].status === "failed")
      await expect(
        page.locator('.text-timeline li[data-event-kind="inclusion"]'),
      ).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("clipboard and PNG failures are explained without claiming successful sharing", async ({
  page,
}) => {
  await loadResults(page);
  await expect(page.locator(".share-card-preview")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Denied");
        },
      },
    });
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      callback(null);
    };
  });
  await page.getByRole("button", { name: "Copy result text" }).click();
  await expect(
    page.getByRole("textbox", { name: "Copy this result text" }),
  ).toBeFocused();
  await expect(
    page.getByRole("textbox", { name: "Copy this result text" }),
  ).toHaveValue(/Raiku: Inside the Block/);
  await page
    .getByRole("button", { name: "Download card", exact: true })
    .click();
  await expect(
    page.getByText("PNG export was unavailable. Try another browser.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("PNG card downloaded. Attach it manually when sharing.", {
      exact: true,
    }),
  ).toHaveCount(0);
});

test("reset results clears the local best history, profile, and saved result", async ({
  page,
}) => {
  await loadResults(page);
  await page
    .getByRole("button", { name: "Reset local progress", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "A block of possibilities." }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      [
        "raiku-inside-the-block:progress:v2",
        "raiku-inside-the-block:onboarding:v1",
        "raiku-inside-the-block:game:v3",
      ].every((key) => localStorage.getItem(key) === null),
    ),
  ).toBe(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "A block of possibilities." }),
  ).toBeVisible();
});

test("old browser history cannot restore results after progress is cleared elsewhere", async ({
  page,
}) => {
  const run = await loadResults(page);
  await page.evaluate(
    (snapshot) => {
      history.replaceState(
        { ...history.state, usr: { run: snapshot, persisted: true } },
        "",
        location.href,
      );
    },
    { config: run.config, actions: run.actions },
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your decisions, unpacked." }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "About", exact: true })
    .click();
  await page.getByRole("button", { name: "Clear my local progress" }).click();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "A block of possibilities." }),
  ).toBeVisible();
});
