import type { RunResult } from "./simulation";

export function downloadShareCard(run: RunResult) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#EFEEE9"/>
    <rect x="30" y="30" width="1140" height="570" rx="2" fill="none" stroke="#223D0E"/>
    <g fill="#223D0E" font-family="Arial, sans-serif">
      <text x="75" y="100" font-size="25" font-weight="bold">RAIKU: INSIDE THE BLOCK</text>
      <text x="75" y="220" font-size="67">A little timing.</text><text x="75" y="295" font-size="67">A new perspective.</text>
      <text x="75" y="380" font-size="24">SEE → ACT → LAND · Learning score ${run.score}/100</text>
      <text x="75" y="430" font-size="24">Simulated inclusion: ${run.included ? "yes" : "no"} · Execution: ${run.executed ? "yes" : "no"}</text>
      <text x="75" y="508" font-size="18">Illustrative community simulation. No live performance or profit claims.</text>
      <text x="75" y="550" font-size="16">Community-built educational simulation. Not affiliated with or endorsed by Raiku.</text>
    </g>
    <g fill="none" stroke="#223D0E" stroke-width="2"><path d="M950 140l100 58v116l-100 58-100-58V198z M850 198l100 58 100-58 M950 256v116"/></g>
  </svg>`;
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "raiku-inside-the-block.svg";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
