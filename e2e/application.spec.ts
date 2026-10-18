import { expect, test, type Page } from "@playwright/test";

async function finishNineRounds(page: Page, allPass = false) {
  for (let index = 0; index < 9; index++) {
    await expect(
      page.getByText(`RUN ${index + 1} OF 9`, { exact: false }),
    ).toBeVisible();
    const pass = allPass || [1, 2, 4].includes(index);
    if (!pass && [6, 7].includes(index))
      await page
        .getByRole("radio", { name: /Raiku co-location example/ })
        .check();
    if (index === 8)
      await expect(
        page.getByRole("radio", { name: /Raiku co-location example/ }),
      ).toBeDisabled();
    await page
      .getByRole("button", {
        name: pass ? "Pass · no trade" : "Act · submit",
        exact: true,
      })
      .click();
    await expect(
      page.getByText("ROUND CONTRIBUTION:", { exact: false }),
    ).toBeVisible();
    if (index === 7 && !allPass) {
      await expect(
        page.getByRole("heading", { name: "Included · execution succeeded" }),
      ).toBeVisible();
      await page.screenshot({
        path: `/tmp/raiku-land-review-${test.info().project.name}.png`,
        fullPage: true,
      });
    }
    await page
      .getByRole("button", {
        name:
          index === 8
            ? "See full run results"
            : [2, 5].includes(index)
              ? `Continue to ${index === 2 ? "ACT" : "LAND"}`
              : "Next round",
        exact: true,
      })
      .click();
  }
}

test("header navigation and direct tutorial refresh render the existing application", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Inside the Block", exact: true }),
  ).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await nav.getByRole("link", { name: "About", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A window into the block." }),
  ).toBeVisible();
  await nav.getByRole("link", { name: "How to play", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A small example. A clearer picture." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Act.*Check and submit/ }),
  ).toBeVisible();
  await nav.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: "Inside the Block", exact: true }),
  ).toBeVisible();
});

test("complete tutorial, play, download, reload, replay, and clear progress", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Inside");
  await page.screenshot({
    path: `/tmp/raiku-home-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page
    .locator("main")
    .getByRole("link", { name: "Enter the Block", exact: true })
    .click();
  await page.getByRole("button", { name: /Act.*Check and submit/ }).click();
  await expect(
    page.getByRole("heading", { name: "Transaction #07 changes the market." }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Next moment" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Your signal is already 120 ticks old.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next moment" }).click();
  await page.getByRole("button", { name: "Next moment" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Included. But not executed successfully.",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Start the three missions" }).click();
  await page.screenshot({
    path: `/tmp/raiku-game-${test.info().project.name}.png`,
    fullPage: true,
  });
  await finishNineRounds(page);
  await expect(
    page.getByRole("heading", { name: "Your decisions, unpacked." }),
  ).toBeVisible();
  await expect(
    page.getByText("SCENARIO 3.0.0 · SEED 42", { exact: true }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download share card" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("raiku-inside-the-block.svg");
  await download.saveAs(`/tmp/raiku-share-${test.info().project.name}.svg`);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your decisions, unpacked." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Replay this seed" }).click();
  await expect(
    page.getByRole("button", { name: "Act · submit", exact: true }),
  ).toBeVisible();
  await page.goto("/about");
  await page.getByRole("button", { name: "Clear my local progress" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Personal progress cleared from this browser.",
  );
  await page.goto("/results");
  await expect(
    page.getByRole("heading", { name: "A block of possibilities." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("all routes fit the viewport and support reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [
    "/",
    "/tutorial",
    "/game",
    "/results",
    "/about",
    "/missing",
  ]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("footer")).toContainText(
      "Community-built educational simulation. Not affiliated with or endorsed by Raiku.",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  expect(
    await page
      .locator(".illustration-pulse")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});

test("optional name and tutorial replay persist locally and reset together", async ({
  page,
}) => {
  await page.goto("/tutorial");
  const name = page.getByRole("textbox", { name: "Display name" });
  await name.fill("A".repeat(30));
  await expect(name).toHaveValue("A".repeat(24));
  await name.fill("Ada");
  await page.getByRole("button", { name: "Save name" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome, Ada." }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Pass.*Don’t submit/ }).click();
  await page
    .getByRole("button", { name: "Replay moment 4: The outcome" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "No transaction. No execution attempt.",
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Welcome, Ada." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Replay moment 4: The outcome" }),
  ).toHaveAttribute("aria-current", "step");
  await page.getByRole("link", { name: "Skip to the three missions" }).click();
  await expect(page.getByText("YOUR MOVE, Ada")).toBeVisible();
  await page.goto("/tutorial");
  await page
    .getByRole("button", { name: "Reset this device’s progress" })
    .click();
  await expect(name).toHaveValue("");
  await expect(
    page.getByRole("heading", { name: "You’re welcome as a guest." }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(
    "Name, tutorial, and game progress reset on this device.",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Is this opportunity still worth taking?",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Play as guest", exact: true }).click();
  await expect(page).toHaveURL(/\/game$/);
});

test("keyboard decisions, replay, and term tooltips work without hover", async ({
  page,
}) => {
  await page.goto("/tutorial");
  const act = page.getByRole("button", { name: /Act.*Check and submit/ });
  await act.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Transaction #07 changes the market." }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Next moment" }).focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("heading", {
      name: "Your signal is already 120 ticks old.",
    }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Try another choice" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Is this opportunity still worth taking?",
    }),
  ).toBeFocused();
  for (const term of [
    "block",
    "validator",
    "signal age",
    "inclusion",
    "net result",
  ]) {
    const button = page.getByRole("button", {
      name: `Explain ${term}`,
      exact: true,
    });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("tooltip")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  }
});

test("landing and onboarding have 44px controls and readable narrow layouts", async ({
  page,
}) => {
  for (const route of ["/", "/tutorial"]) {
    await page.goto(route);
    for (const control of await page.locator("a, button, input").all()) {
      if (!(await control.isVisible())) continue;
      const bounds = await control.boundingBox();
      expect(
        bounds!.height,
        (await control.textContent()) || "input",
      ).toBeGreaterThanOrEqual(44);
      expect(bounds!.width).toBeGreaterThanOrEqual(44);
    }
    // Check actual content, not just the page width, so clipping cannot hide overflow.
    expect(
      await page.locator("main").evaluate((el) =>
        [...el.querySelectorAll("h1,h2,h3,p,button,input")].every((node) => {
          const box = node.getBoundingClientRect();
          return box.left >= 0 && box.right <= window.innerWidth;
        }),
      ),
    ).toBe(true);
  }
  await page.goto("/");
  await page.getByRole("button", { name: "Pause illustration" }).click();
  expect(
    await page
      .locator(".illustration-pulse")
      .first()
      .evaluate((el) => getComputedStyle(el).animationPlayState),
  ).toBe("paused");
  await page.getByRole("button", { name: "Resume illustration" }).click();
  expect(
    await page
      .locator(".illustration-pulse")
      .first()
      .evaluate((el) => getComputedStyle(el).animationPlayState),
  ).toBe("running");
  await page.getByRole("link", { name: "How it works", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "An opportunity is only the beginning.",
    }),
  ).toBeInViewport();
  await page.goto("/tutorial");
  for (const term of [
    "block",
    "validator",
    "signal age",
    "inclusion",
    "net result",
  ]) {
    const button = page.getByRole("button", {
      name: `Explain ${term}`,
      exact: true,
    });
    if (test.info().project.name === "desktop") await button.click();
    else await button.tap();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `/tmp/raiku-onboarding-${test.info().project.name}.png`,
    fullPage: true,
  });
});

test("tutorial remains interactive with storage blocked", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Blocked");
      },
    }),
  );
  await page.goto("/tutorial");
  await page.getByRole("button", { name: /Pass.*Don’t submit/ }).click();
  await expect(page.getByRole("status")).toContainText(
    "Browser storage is unavailable",
  );
  await page
    .getByRole("button", { name: "Replay moment 4: The outcome" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "No transaction. No execution attempt.",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Reset this device’s progress" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Is this opportunity still worth taking?",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Play as guest", exact: true }).click();
  await expect(page).toHaveURL(/\/game$/);
});

test("blocked local storage still permits playing and viewing results", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage blocked");
      },
    });
  });
  await page.goto("/game");
  await finishNineRounds(page, true);
  await expect(
    page.getByText("Your browser blocked local storage.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your decisions, unpacked." }),
  ).toBeVisible();
});

// The decision projection must stay unchanged while the player reads; later events are absent.
test("decisions pause ticks, hide later market events, and resume exact round reviews", async ({
  page,
}) => {
  await page.goto("/game?seed=42");
  const decision = page.getByText("DECISION PAUSED AT TICK 6", { exact: true });
  await expect(decision).toBeVisible();
  await page.waitForTimeout(400);
  await expect(decision).toHaveText("DECISION PAUSED AT TICK 6");
  await page.getByRole("button", { name: "Act · submit", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "A recent observation", exact: true }),
  ).toBeFocused();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Included · execution succeeded" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next round", exact: true }).click();
  await page.reload();
  await expect(
    page.getByText("DECISION PAUSED AT TICK 70", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Another executed event changes the market", {
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Pass · no trade", exact: true })
    .click();
  await page.getByText("Replay recorded events", { exact: true }).click();
  await page
    .getByRole("button", {
      name: "Event 2: Another executed event changes the market",
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Another executed event changes the market",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
