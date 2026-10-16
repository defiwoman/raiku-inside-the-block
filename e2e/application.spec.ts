import { expect, test } from "@playwright/test";

test("complete tutorial, play, download, reload, replay, and clear progress", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Same market.",
  );
  await page.screenshot({
    path: `/tmp/raiku-home-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: "Let’s play" }).click();
  await expect(
    page.getByRole("heading", { name: "First, see what happened." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next: ACT" }).click();
  await expect(
    page.getByRole("heading", { name: "Then, make a decision." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next: LAND" }).click();
  await page.getByRole("link", { name: "Enter the simulation" }).click();
  await expect(
    page.getByRole("button", { name: "Continue to ACT" }),
  ).toBeDisabled();
  await page.getByRole("radio", { name: /Earlier observation/ }).check();
  await page.getByRole("button", { name: "Continue to ACT" }).click();
  await page.getByRole("radio", { name: /Check, then submit/ }).check();
  await page.getByRole("button", { name: "Continue to LAND" }).click();
  await page.getByRole("radio", { name: /Eligible reserved path/ }).check();
  await page.getByRole("button", { name: "Reveal my result" }).click();
  await expect(
    page.getByRole("heading", { name: "The pieces came together." }),
  ).toBeVisible();
  await expect(page.getByText("1 LOCAL RUN · BEST 100/100")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download share card" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("raiku-inside-the-block.svg");
  await download.saveAs(`/tmp/raiku-share-${test.info().project.name}.svg`);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "The pieces came together." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Play another block" }).click();
  await expect(
    page.getByRole("button", { name: "Continue to ACT" }),
  ).toBeDisabled();
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
      .locator(".signal-a")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
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
  await page.getByRole("radio", { name: /Earlier observation/ }).check();
  await page.getByRole("button", { name: "Continue to ACT" }).click();
  await page.getByRole("radio", { name: /Submit immediately/ }).check();
  await page.getByRole("button", { name: "Continue to LAND" }).click();
  await page.getByRole("radio", { name: /Eligible reserved path/ }).check();
  await page.getByRole("button", { name: "Reveal my result" }).click();
  await expect(
    page.getByText("Your browser blocked local storage.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Every choice tells a story." }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Your order was included, but its execution limit was not met.",
      { exact: false },
    ),
  ).toBeVisible();
});
