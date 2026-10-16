import type { TutorialChoice } from "./simulation";

export const ONBOARDING_KEY = "raiku-inside-the-block:onboarding:v1";
export interface OnboardingProgress {
  displayName: string;
  choice: TutorialChoice | null;
  replayStep: number;
}
export function emptyOnboarding(): OnboardingProgress {
  return { displayName: "", choice: null, replayStep: 0 };
}
export function normalizeDisplayName(name: string): string {
  return Array.from(name.replace(/\p{Cc}/gu, "").trim())
    .slice(0, 24)
    .join("");
}
export function readOnboarding(): OnboardingProgress {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(ONBOARDING_KEY) || "null",
    );
    if (!value || typeof value !== "object") return emptyOnboarding();
    const data = value as Record<string, unknown>;
    const choice =
      data.choice === "act" || data.choice === "pass" ? data.choice : null;
    return {
      displayName:
        typeof data.displayName === "string"
          ? normalizeDisplayName(data.displayName)
          : "",
      choice,
      replayStep:
        choice &&
        Number.isInteger(data.replayStep) &&
        (data.replayStep as number) >= 0 &&
        (data.replayStep as number) <= 3
          ? (data.replayStep as number)
          : 0,
    };
  } catch {
    return emptyOnboarding();
  }
}
export function saveOnboarding(progress: OnboardingProgress): boolean {
  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
