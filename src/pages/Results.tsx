import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { RoundReview } from "../components/RoundReview";
import { bestFor, readProgress } from "../lib/progress";
import { missions, readRun } from "../lib/simulation";
import { signedCredits, credits } from "../lib/presentation";
import { downloadShareCard } from "../lib/share";

export function Results() {
  const location = useLocation();
  const progress = readProgress();
  const run = readRun(location.state?.run) ?? progress.lastRun;
  const [roundIndex, setRoundIndex] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  if (!run)
    return (
      <section className="page-width inner-page empty-state">
        <p className="eyebrow">THE STORY IS YOURS TO START</p>
        <h1>A block of possibilities.</h1>
        <p>
          Complete all nine rounds across SEE, ACT, and LAND to view your
          decision scores, simulated ledger, event replays, and share card.
        </p>
        {progress.legacyAvailable && (
          <p>
            Your earlier prototype record is retained on this device. Its score
            is not comparable with the new nine-round scenario.
          </p>
        )}
        <Link className="button primary" to="/game">
          Start the nine rounds ↗
        </Link>
      </section>
    );
  const best = bestFor(run.config);
  return (
    <section className="page-width inner-page results-page nine-results">
      <div className="page-heading">
        <p className="eyebrow">SEE → ACT → LAND / NINE ROUNDS COMPLETE</p>
        <h1>Your decisions, unpacked.</h1>
        <p>
          A learning score for the decisions you could make—not a reward for a
          lucky outcome. Financial results below are simulated credits, not real
          trading performance.
        </p>
      </div>
      <div className="run-meta">
        <span className="mono">
          SCENARIO {run.config.version} · SEED {run.config.seed}
        </span>
        <span className="mono">{progress.completedRuns} SAVED RUNS</span>
      </div>
      <div className="run-summary">
        <section className="result-card">
          <span className="eyebrow">DECISION QUALITY</span>
          <div className="result-score">
            {run.score}
            <span>/ {run.maxScore}</span>
          </div>
          <p>LEARNING POINTS · SEPARATE FROM NET P&amp;L</p>
          <div className="result-status">
            <span>
              Included
              <strong>
                {run.rounds.filter((round) => round.included).length} / 9
              </strong>
            </span>
            <span>
              Executed successfully
              <strong>
                {run.rounds.filter((round) => round.executed).length} / 9
              </strong>
            </span>
          </div>
          <small>
            {best !== null
              ? `Best for this exact version and seed: ${best} / 90.`
              : "No saved comparison for this exact version and seed."}{" "}
            No comparisons with other seeds or versions.
          </small>
        </section>
        <section className="run-ledger">
          <h2>Simulated run ledger</h2>
          <dl className="financial-ledger">
            <div>
              <dt>Realised gross benefit</dt>
              <dd>{credits(run.ledger.grossBenefit)}</dd>
            </div>
            <div>
              <dt>Network execution fees</dt>
              <dd>−{credits(run.ledger.executionFee)}</dd>
            </div>
            <div>
              <dt>Trading costs</dt>
              <dd>−{credits(run.ledger.tradingCost)}</dd>
            </div>
            <div className="ledger-subtotal">
              <dt>Trade P&amp;L</dt>
              <dd>{signedCredits(run.ledger.tradePnL)}</dd>
            </div>
            <div>
              <dt>Operating costs (separate)</dt>
              <dd>−{credits(run.ledger.operatingCost)}</dd>
            </div>
            <div className="ledger-total">
              <dt>Simulated net result</dt>
              <dd>{signedCredits(run.ledger.netResult)}</dd>
            </div>
          </dl>
          <p>
            Possible forgone net from passes:{" "}
            {credits(run.ledger.forgoneOpportunity)}. Authored counterfactual
            only; never deducted from your result or score. Network finality is
            not modeled.
          </p>
        </section>
      </div>
      <div className="mission-totals">
        {missions.map((mission) => {
          const rounds = run.rounds.filter(
            (round) => round.mission === mission.id,
          );
          return (
            <section key={mission.id}>
              <span className="eyebrow">{mission.id} / THREE ROUNDS</span>
              <h2>
                {rounds.reduce((sum, round) => sum + round.score.total, 0)}{" "}
                <small>/ 30 points</small>
              </h2>
              <p>
                {signedCredits(
                  rounds.reduce(
                    (sum, round) => sum + round.ledger.netResult,
                    0,
                  ),
                )}{" "}
                simulated net
              </p>
            </section>
          );
        })}
      </div>
      <section className="full-run-replay" aria-label="Completed round replays">
        <div className="section-heading">
          <h2>Replay any completed round.</h2>
          <span className="mono">ALL EVENTS NOW REVEALED</span>
        </div>
        <div className="round-selector">
          {run.rounds.map((round, index) => (
            <button
              type="button"
              key={round.roundId}
              onClick={() => setRoundIndex(index)}
              aria-current={roundIndex === index ? "step" : undefined}
            >
              {round.mission} {(index % 3) + 1}
              <span>
                {round.score.total}/10 · {signedCredits(round.ledger.netResult)}
              </span>
            </button>
          ))}
        </div>
        <RoundReview
          key={run.rounds[roundIndex].roundId}
          round={run.rounds[roundIndex]}
        />
      </section>
      <div className="results-actions">
        <Link className="button primary" to={`/game?seed=${run.config.seed}`}>
          Replay this seed ↻
        </Link>
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            downloadShareCard(run);
            setDownloaded(true);
          }}
        >
          Download share card ↓
        </button>
        <span className="mono" role="status">
          {downloaded
            ? "SVG CARD DOWNLOADED"
            : `VERSION ${run.config.version} · SEED ${run.config.seed}`}
        </span>
      </div>
      {location.state?.persisted === false && (
        <p className="content-note" role="status">
          Your browser blocked local storage. These results are available in
          this tab, but are not saved for reload.
        </p>
      )}
      <p className="development-label">
        Authored teaching scenarios. All ticks and credits are illustrative.
        Inclusion, successful execution, finality, and profit are different
        concepts. No live integration, real trades, or performance benchmark.
      </p>
    </section>
  );
}
