import type { RunResult } from "./simulation-types";
import { normalizeDisplayName } from "./onboarding";
import { missionBreakdown } from "./results";

/** Explicit production setting only. Never infer an address from this browser. */
export function productionAppUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      !host.includes(".") ||
      /(^|\.)(localhost|local|test|invalid|example)$/.test(host) ||
      host === "example.com" ||
      host.endsWith(".example.com") ||
      host === "example.org" ||
      host === "example.net" ||
      /^[\d.]+$/.test(host) ||
      host.includes(":")
    )
      return null;
    url.hash = "";
    url.search = "";
    return url.href.replace(/\/$/, "");
  } catch {
    return null;
  }
}
export interface ShareOptions {
  displayName?: string;
  appUrl?: string | null;
}
export function shareData(run: RunResult, options: ShareOptions = {}) {
  return {
    title: "Raiku: Inside the Block",
    name: normalizeDisplayName(options.displayName ?? ""),
    score: run.score,
    maxScore: run.maxScore,
    missions: missionBreakdown(run),
    version: run.config.version,
    seed: run.config.seed,
    appUrl: productionAppUrl(options.appUrl),
    community: "Community-built simulation.",
    challenge: "Can you read the next opportunity?",
    disclaimer:
      "Community-built educational simulation. Not affiliated with or endorsed by Raiku.",
  };
}
export function resultText(run: RunResult, options: ShareOptions = {}): string {
  const data = shareData(run, options);
  return `${data.name ? `${data.name} · ` : ""}${data.title}\nLearning score: ${data.score}/${data.maxScore} · ${data.missions.map((mission) => `${mission.id} ${mission.score}/${mission.max}`).join(" · ")}\nScenario ${data.version} · seed ${data.seed}. Compare only the same version and seed.\n${data.community} ${data.challenge}\nIllustrative learning points, not investment performance.${data.appUrl ? `\n${data.appUrl}` : ""}`;
}
export function xComposerUrl(text: string): string {
  return `https://twitter.com/intent/tweet?${new URLSearchParams({ text })}`;
}
export function xResultText(
  run: RunResult,
  options: ShareOptions = {},
): string {
  const data = shareData(run, options);
  return `${data.name ? `${data.name} · ` : ""}${data.title}\n${data.score}/${data.maxScore} learning points | ${data.missions.map((mission) => `${mission.id} ${mission.score}/${mission.max}`).join(" · ")}\nv${data.version} / seed ${data.seed}\n${data.community}\n${data.challenge}${data.appUrl ? `\n${data.appUrl}` : ""}`;
}
export function fitImage(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
) {
  if (width <= 0 || height <= 0)
    throw new Error("Image dimensions must be positive.");
  const scale = Math.min(maxWidth / width, maxHeight / height);
  return { width: width * scale, height: height * scale };
}
