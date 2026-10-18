import { useEffect, useRef, useState } from "react";
import type { RunResult } from "../lib/simulation";
import { readOnboarding } from "../lib/onboarding";
import { downloadShareCard, renderShareCard } from "../lib/share";
import {
  productionAppUrl,
  resultText,
  xComposerUrl,
  xResultText,
} from "../lib/share-data";
import { Arrow } from "./Arrow";
import { brand } from "../lib/brand";

export function SharePanel({ run }: { run: RunResult }) {
  const [name] = useState(() => readOnboarding().displayName);
  const [includeName, setIncludeName] = useState(true);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [cardError, setCardError] = useState("");
  const [manualCopy, setManualCopy] = useState(false);
  const preview = useRef<HTMLCanvasElement>(null);
  const prepared = useRef<HTMLCanvasElement | null>(null);
  const copyField = useRef<HTMLTextAreaElement>(null);
  const appUrl = productionAppUrl(import.meta.env.VITE_PUBLIC_APP_URL);
  const displayName = includeName ? name : "";
  const text = resultText(run, { displayName, appUrl });
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setCardError("");
    prepared.current = null;
    renderShareCard(run, { displayName, appUrl })
      .then((canvas) => {
        if (cancelled) return;
        const context = preview.current?.getContext("2d");
        if (!context)
          throw new Error("Canvas preview is unavailable in this browser.");
        context.clearRect(0, 0, 1200, 630);
        context.drawImage(canvas, 0, 0);
        prepared.current = canvas;
        setReady(true);
      })
      .catch((error) => {
        if (!cancelled)
          setCardError(
            error instanceof Error
              ? error.message
              : "The card could not be prepared.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [run, displayName, appUrl]);
  useEffect(() => {
    if (manualCopy) {
      copyField.current?.focus();
      copyField.current?.select();
    }
  }, [manualCopy]);
  async function download() {
    if (!prepared.current || busy) return;
    setBusy(true);
    setStatus("");
    try {
      await downloadShareCard(prepared.current);
      setStatus("PNG card downloaded. Attach it manually when sharing.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Download failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setManualCopy(false);
      setStatus("Result text copied.");
    } catch {
      setManualCopy(true);
      setStatus(
        "Clipboard access is unavailable. Select and copy the text below manually.",
      );
    }
  }
  return (
    <section className="share-panel" aria-labelledby="share-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">A BLOCK WORTH TALKING ABOUT</p>
          <h2 id="share-heading">Share your curiosity.</h2>
        </div>
        <span className="mono">OPTIONAL · CREATED ON YOUR DEVICE</span>
      </div>
      <p className="share-intro">
        Learning points describe choices in an invented scenario. They are not a
        measure of real trading skill, certified expertise, or investment
        performance.
      </p>
      {name && (
        <label className="share-name-option">
          <input
            type="checkbox"
            checked={includeName}
            onChange={(event) => {
              setIncludeName(event.target.checked);
              setStatus("");
            }}
          />
          <span>Include my display name on the card and result text</span>
        </label>
      )}
      <canvas
        ref={preview}
        width={1200}
        height={630}
        className="share-card-preview"
        role="img"
        aria-label={`Share card preview: Raiku: Inside the Block, learning score ${run.score} of ${run.maxScore}, scenario ${run.config.version}, seed ${run.config.seed}${displayName ? `, ${displayName}` : ""}.`}
        data-ready={ready}
      >
        Share card preview. Your score, mission breakdown, version, and seed are
        also available as result text below.
      </canvas>
      {!ready && !cardError && (
        <p className="share-preparing" role="status">
          Preparing your share card…
        </p>
      )}
      {cardError && (
        <p className="share-error" role="status">
          {cardError} You can still copy or share the result text.
        </p>
      )}
      {!brand.officialLogoPath && (
        <p className="share-asset-note">
          The official logo download is unavailable. This card uses a plain-text
          title; no replacement logo is used.
        </p>
      )}
      <div className="share-actions">
        <button
          className="button primary"
          type="button"
          disabled={!ready || busy}
          onClick={download}
        >
          {busy ? "Preparing download…" : "Download card"}
        </button>
        <button className="button secondary" type="button" onClick={copy}>
          Copy result text
        </button>
        <a
          className="button secondary"
          href={xComposerUrl(xResultText(run, { displayName, appUrl }))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            setStatus(
              "X opens an editable composer. Your downloaded image is not uploaded by this link.",
            )
          }
        >
          Share on X <Arrow />
        </a>
      </div>
      <p className="sharing-explanation">
        Sharing is optional and nothing is posted automatically. The X link
        opens an editable composer with text only. Attach your downloaded PNG
        manually; the composer link does not upload it.
      </p>
      <p className="sharing-url-note">
        {appUrl
          ? "Your configured production app URL is included in the card and result text."
          : "No valid production app URL is configured, so no app URL is included."}
      </p>
      <p className="share-status" role="status">
        {status}
      </p>
      <details className="result-text-preview">
        <summary>View result text</summary>
        <pre>{text}</pre>
      </details>
      {manualCopy && (
        <label className="manual-copy">
          Copy this result text
          <textarea ref={copyField} readOnly value={text} rows={8} />
        </label>
      )}
    </section>
  );
}
