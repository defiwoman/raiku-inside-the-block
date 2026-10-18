import type { RunResult } from "./simulation-types";
import { brand } from "./brand";
import { fitImage, shareData } from "./share-data";
import type { ShareOptions } from "./share-data";

function fittedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  size: number,
  weight = 400,
  family = "Geist",
) {
  let fontSize = size;
  context.font = `${weight} ${fontSize}px "${family}", sans-serif`;
  while (context.measureText(text).width > width && fontSize > 10) {
    fontSize -= 1;
    context.font = `${weight} ${fontSize}px "${family}", sans-serif`;
  }
  context.fillText(text, x, y);
}
async function localLogo(path: string): Promise<HTMLImageElement> {
  const url = new URL(path, window.location.origin);
  if (url.origin !== window.location.origin)
    throw new Error("Share card assets must be served locally.");
  const image = new Image();
  image.src = url.href;
  await image.decode();
  return image;
}
/** Browser-only rendering. No network export, third-party image service, or engine calls. */
export async function renderShareCard(
  run: RunResult,
  options: ShareOptions = {},
): Promise<HTMLCanvasElement> {
  const data = shareData(run, options);
  await Promise.all([
    document.fonts.load("500 44px Geist"),
    document.fonts.load("400 20px Geist"),
    document.fonts.load('400 24px "Geist Mono"'),
  ]);
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot create a PNG share card.");
  const tokens = getComputedStyle(document.documentElement);
  const paper = tokens.getPropertyValue("--paper").trim() || brand.paper;
  const ink = tokens.getPropertyValue("--ink").trim() || brand.ink;
  context.fillStyle = paper;
  context.fillRect(0, 0, 1200, 630);
  context.strokeStyle = ink;
  context.lineWidth = 1;
  context.strokeRect(24.5, 24.5, 1151, 581);
  context.fillStyle = ink;
  fittedText(context, data.title, 60, 99, 900, 43, 500);
  fittedText(context, data.community, 62, 143, 900, 19);
  if (brand.officialLogoPath) {
    // A missing logo must not break a locally generated card: keep the plain-text title.
    try {
      const logo = await localLogo(brand.officialLogoPath);
      const size = fitImage(logo.naturalWidth, logo.naturalHeight, 142, 60);
      context.drawImage(logo, 1136 - size.width, 73, size.width, size.height);
    } catch {
      /* The official asset is optional, never replaced with an invented logo. */
    }
  }
  context.fillStyle = ink;
  context.fillRect(60, 178, 1080, 254);
  context.fillStyle = paper;
  fittedText(context, "LEARNING SCORE", 88, 220, 380, 16, 400, "Geist Mono");
  fittedText(context, String(data.score), 84, 336, 260, 112, 500);
  fittedText(
    context,
    `/ ${data.maxScore}`,
    262,
    335,
    140,
    34,
    400,
    "Geist Mono",
  );
  fittedText(
    context,
    data.name || "A curious mind. One complete block.",
    89,
    395,
    405,
    21,
    400,
  );
  for (const [index, mission] of data.missions.entries()) {
    const x = 540 + index * 194;
    context.globalAlpha = 0.45;
    context.strokeStyle = paper;
    context.strokeRect(x, 215, 168, 132);
    context.globalAlpha = 1;
    fittedText(context, mission.id, x + 18, 246, 132, 17, 400, "Geist Mono");
    fittedText(
      context,
      `${mission.score}/${mission.max}`,
      x + 17,
      317,
      136,
      39,
      400,
      "Geist Mono",
    );
  }
  fittedText(
    context,
    `SCENARIO ${data.version} / SEED ${data.seed}`,
    540,
    395,
    562,
    15,
    400,
    "Geist Mono",
  );
  context.fillStyle = ink;
  fittedText(context, data.challenge, 60, 482, 1080, 31, 500);
  fittedText(
    context,
    "Try nine rounds. Compare only the same scenario and seed.",
    62,
    518,
    1080,
    18,
  );
  fittedText(
    context,
    data.appUrl ||
      "Illustrative ticks and credits. No live performance claims.",
    62,
    552,
    1080,
    16,
  );
  fittedText(context, data.disclaimer, 62, 588, 1080, 14);
  return canvas;
}
export function canvasPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(
              new Error("PNG export was unavailable. Try another browser."),
            ),
      "image/png",
    ),
  );
}
export async function downloadShareCard(
  canvas: HTMLCanvasElement,
): Promise<void> {
  const blob = await canvasPng(canvas);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "raiku-inside-the-block.png";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
