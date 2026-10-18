import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RoundReview } from "../components/RoundReview";
import {
  bestFor,
  bestHistoryFor,
  clearProgress,
  readProgress,
} from "../lib/progress";
import { SharePanel } from "../components/SharePanel";
import { missionBreakdown, runLesson } from "../lib/results";
import { readRun } from "../lib/simulation";
import { signedCredits, credits } from "../lib/presentation";

export function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const progress = useMemo(readProgress, [location.key]);
  const run = useMemo(
    // Saved records are authoritative; stale history cannot restore cleared progress.
    // Route state is used only when browser storage was unavailable during play.
    () =>
      (location.state?.persisted === false
        ? readRun(location.state?.run)
        : null) ?? progress.lastRun,
    [location.state, progress.lastRun],
  );
  const [roundIndex, setRoundIndex] = useState(0);
  const [resetMessage, setResetMessage] = useState("");
  if (!run)
    return (
      <section className="page-width inner-page empty-state">
        <p className="eyebrow">THE STORY IS YOURS TO START</p>
        <h1>A block of possibilities.</h1>
        {location.state?.reset && (
          <p role="status">
            Local progress reset. Your name, tutorial, runs, and local best
            history have been cleared from this device.
          </p>
        )}
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
  const history = bestHistoryFor(run.config);
  const breakdown = missionBreakdown(run);
  const lesson = runLesson(run);
  function reset() {
    if (!clearProgress()) {
      setResetMessage(
        "Your browser blocked access to saved progress. It could not be reset.",
      );
      return;
    }
    navigate("/results", { replace: true, state: { reset: true } });
  }
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
              ? `Your local best: ${best} / ${run.maxScore} for this exact version and seed.`
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
        {breakdown.map((mission) => (
          <section key={mission.id}>
            <span className="eyebrow">{mission.id} / THREE ROUNDS</span>
            <h2>
              {mission.score} <small>/ {mission.max} points</small>
            </h2>
            <p>{signedCredits(mission.net)} simulated net</p>
          </section>
        ))}
      </div>
      <section className="result-lesson-panel" aria-label="One useful lesson">
        <span className="eyebrow">ONE USEFUL LESSON FROM YOUR DECISIONS</span>
        <h2>{lesson.title}</h2>
        <p>{lesson.body}</p>
        <button
          type="button"
          className="text-link"
          onClick={() => {
            setRoundIndex(lesson.roundIndex);
            document
              .getElementById("completed-replays")
              ?.scrollIntoView({ behavior: "instant", block: "start" });
          }}
        >
          Review {lesson.mission} round {(lesson.roundIndex % 3) + 1}
        </button>
      </section>
      <section
        className="local-best-panel"
        aria-labelledby="local-best-heading"
      >
        <div>
          <p className="eyebrow">ON THIS DEVICE ONLY</p>
          <h2 id="local-best-heading">Your local best</h2>
          <p>
            {best === null
              ? "This run was not saved, so no local best is available."
              : `${best}/${run.maxScore} learning points for scenario ${run.config.version}, seed ${run.config.seed}.`}{" "}
            This is your personal history, not a global leaderboard. Compare
            only the same version and seed.
          </p>
        </div>
        {history.length > 0 && (
          <ol aria-label="Personal best history">
            {history.map((entry, index) => (
              <li key={index}>
                <span>
                  {entry.runNumber === null
                    ? "Saved best"
                    : `Saved run ${entry.runNumber}`}
                </span>
                <strong>
                  {entry.score}/{entry.maxScore}
                </strong>
              </li>
            ))}
          </ol>
        )}
      </section>
      <div className="results-actions">
        <Link
          className="button primary"
          to={`/game?seed=${run.config.seed}`}
          aria-label="Try again with this seed"
        >
          Try again · same seed <span aria-hidden="true">↻</span>
        </Link>
        <button type="button" className="button secondary" onClick={reset}>
          Reset local progress
        </button>
      </div>
      <p className="reset-explanation">
        Reset removes your name, tutorial, saved runs, and local best history on
        this device.
      </p>
      <p className="share-status" role="status">
        {resetMessage}
      </p>
      {location.state?.persisted === false && (
        <p className="content-note" role="status">
          Your browser blocked local storage. These results are available in
          this tab, but are not saved for reload.
        </p>
      )}
      <SharePanel run={run} />
      <section
        id="completed-replays"
        className="full-run-replay"
        aria-label="Completed round replays"
      >
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
      <p className="development-label">
        Authored teaching scenarios. All ticks and credits are illustrative.
        Inclusion, successful execution, finality, and profit are different
        concepts. No live integration, real trades, or performance benchmark.
      </p>
    </section>
  );
}
