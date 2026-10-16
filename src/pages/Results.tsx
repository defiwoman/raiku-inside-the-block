import { Arrow } from "../components/Arrow";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { readProgress } from "../lib/progress";
import { missions, isChoices, simulate } from "../lib/simulation";
import { downloadShareCard } from "../lib/share";

export function Results() {
  const location = useLocation();
  const progress = readProgress();
  const state = location.state;
  const run = isChoices(state?.run?.choices)
    ? simulate(state.run.choices)
    : progress.lastRun;
  const [downloaded, setDownloaded] = useState(false);
  if (!run)
    return (
      <section className="page-width inner-page empty-state">
        <p className="eyebrow">THE STORY IS YOURS TO START</p>
        <h1>A block of possibilities.</h1>
        <p>
          Complete the three missions to see your choices, learning score, and
          downloadable share card here.
        </p>
        <Link className="button primary" to="/tutorial">
          Start the journey <Arrow />
        </Link>
      </section>
    );
  return (
    <section className="page-width inner-page results-page">
      <div className="page-heading">
        <p className="eyebrow">YOUR BLOCK, UNPACKED</p>
        <h1>
          {run.executed
            ? "The pieces came together."
            : "Every choice tells a story."}
        </h1>
        <p>
          {run.executed
            ? "Your order was included and executed in this invented scenario."
            : run.included
              ? "Your order was included, but its execution limit was not met."
              : "Your order missed this scenario’s inclusion window."}{" "}
          This is a learning result, not a trading outcome.
        </p>
      </div>
      <div className="results-layout">
        <div className="result-card">
          <span className="eyebrow">RAIKU: INSIDE THE BLOCK</span>
          <div className="result-score">
            {run.score}
            <span>/ 100</span>
          </div>
          <p>LEARNING SCORE</p>
          <div className="result-status">
            <span>
              Included<strong>{run.included ? "Yes" : "No"}</strong>
            </span>
            <span>
              Executed<strong>{run.executed ? "Yes" : "No"}</strong>
            </span>
          </div>
          <span className="mono">SEE → ACT → LAND</span>
          <small>
            Illustrative community simulation.
            <br />
            No live performance or profit claims.
          </small>
        </div>
        <div className="result-details">
          <h2>Your journey through the block.</h2>
          <div className="timeline">
            {missions.map((mission, index) => (
              <div className="timeline-item" key={mission.id}>
                <span className="timeline-num">0{index + 1}</span>
                <div>
                  <span className="eyebrow">{mission.id}</span>
                  <h3>
                    {
                      mission.options.find(
                        (option) => option.value === run.choices[index],
                      )?.title
                    }
                  </h3>
                  <p>
                    {[run.observation, run.decision, run.inclusion][index]}{" "}
                    illustrative ticks
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="total-time">
            <span>Total journey</span>
            <strong>
              {run.total} <small>ticks / 400-tick window</small>
            </strong>
          </div>
          <p className="result-lesson">
            {!run.included
              ? "Time spent observing, deciding, and waiting adds up. Replay and try a different combination."
              : !run.executed
                ? "Inclusion puts an order in a block. Successful execution also depends on the order’s conditions. Faster is not always better."
                : "Earlier observation, a considered decision, and an eligible inclusion path worked together here. This does not guarantee finality or profit."}
          </p>
        </div>
      </div>
      <div className="results-actions">
        <Link className="button primary" to="/game">
          Play another block <span>↻</span>
        </Link>
        <button
          className="button secondary"
          onClick={() => {
            downloadShareCard(run);
            setDownloaded(true);
          }}
        >
          Download share card <span>↓</span>
        </button>
        <span className="mono" role="status">
          {downloaded
            ? "SVG CARD DOWNLOADED"
            : `${progress.completedRuns} LOCAL RUN${progress.completedRuns === 1 ? "" : "S"} · BEST ${progress.bestScore}/100`}
        </span>
      </div>
      {state?.persisted === false && (
        <p role="status" className="content-note">
          Your browser blocked local storage. This result is available now, but
          will not survive a reload.
        </p>
      )}
      <p className="development-label">
        DEVELOPMENT PLACEHOLDER · The timeline above replays your choices.
        Animated event-by-event replay is planned. Finality and profit are not
        simulated.
      </p>
    </section>
  );
}
