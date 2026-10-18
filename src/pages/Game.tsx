import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { RoundReview } from "../components/RoundReview";
import {
  DEFAULT_CONFIG,
  getDecisionView,
  isRunConfig,
  missions,
  resolveRound,
  simulateRun,
} from "../lib/simulation";
import type { PlayerAction } from "../lib/simulation";
import { readDraft, saveDraft, saveRun } from "../lib/progress";
import type { GameDraft } from "../lib/progress";
import { readOnboarding } from "../lib/onboarding";
import { credits } from "../lib/presentation";

export function Game() {
  const [params] = useSearchParams();
  const [draft, setDraft] = useState<GameDraft>(() => {
    const seed = params.has("seed")
      ? Number(params.get("seed"))
      : DEFAULT_CONFIG.seed;
    const config = { ...DEFAULT_CONFIG, seed };
    return params.has("seed") && isRunConfig(config)
      ? { config, actions: [], reviewing: false }
      : (readDraft() ?? {
          config: DEFAULT_CONFIG,
          actions: [],
          reviewing: false,
        });
  });
  const [pathId, setPathId] = useState("public");
  const [seedInput, setSeedInput] = useState(String(draft.config.seed));
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const shouldFocus = useRef(false);
  const finished = useRef(false);
  const navigate = useNavigate();
  const enteringReplayLink = useRef(params.has("seed"));
  useEffect(() => {
    // A replay link starts fresh once. Reloads then resume the saved decision/review.
    if (enteringReplayLink.current) {
      enteringReplayLink.current = false;
      if (!saveDraft(draft))
        setMessage(
          "Browser storage is unavailable. Keep this tab open to retain this run.",
        );
      navigate("/game", { replace: true });
    }
  }, [draft, navigate]);
  const index = draft.reviewing
    ? draft.actions.length - 1
    : draft.actions.length;
  const view = getDecisionView(draft.config, index);
  const outcome = draft.reviewing
    ? resolveRound(draft.config, index, draft.actions[index])
    : null;
  const selectedPath =
    view.paths.find((path) => path.id === pathId && path.enabled) ??
    view.paths[0];
  const displayName = readOnboarding().displayName;
  const score = draft.actions.reduce(
    (sum, action, round) =>
      sum + resolveRound(draft.config, round, action).score.total,
    0,
  );
  useEffect(() => {
    if (shouldFocus.current) {
      heading.current?.focus();
      shouldFocus.current = false;
    }
  }, [index, draft.reviewing]);
  function update(next: GameDraft) {
    shouldFocus.current = true;
    setDraft(next);
    if (!saveDraft(next))
      setMessage(
        "Browser storage is unavailable. Keep this tab open to retain this run.",
      );
  }
  function commit(action: PlayerAction) {
    if (draft.reviewing) return;
    resolveRound(draft.config, index, action);
    update({ ...draft, actions: [...draft.actions, action], reviewing: true });
  }
  function continueRun() {
    if (draft.actions.length === 9) {
      if (finished.current) return;
      finished.current = true;
      const run = simulateRun(draft.config, draft.actions);
      const { persisted } = saveRun(run);
      navigate("/results", {
        state: { run: { config: run.config, actions: run.actions }, persisted },
      });
    } else {
      setPathId("public");
      update({ ...draft, reviewing: false });
    }
  }
  function restart(seed = draft.config.seed) {
    finished.current = false;
    setPathId("public");
    update({
      config: { ...DEFAULT_CONFIG, seed },
      actions: [],
      reviewing: false,
    });
  }
  return (
    <section className="page-width inner-page simulation-page">
      <div className="game-topline">
        <Link className="text-link" to="/tutorial">
          ← Tutorial
        </Link>
        <span className="prototype-badge">AUTHORED EDUCATIONAL SIMULATION</span>
      </div>
      <div className="game-heading">
        <div>
          <p className="eyebrow">
            {displayName
              ? `YOUR MOVE, ${displayName}`
              : "NINE ROUNDS · ABOUT 3–5 MINUTES"}
          </p>
          <h1>Inside the block.</h1>
        </div>
        <button type="button" className="text-link" onClick={() => restart()}>
          Restart this seed ↻
        </button>
      </div>
      <div className="run-meta">
        <span className="mono">
          SCENARIO {draft.config.version} · SEED {draft.config.seed}
        </span>
        <span className="mono">LEARNING {score} / 90</span>
        <span className="clock-paused">
          {outcome
            ? "REPLAY · SELF-PACED"
            : `DECISION PAUSED AT TICK ${view.observationTick}`}
        </span>
      </div>
      <ol className="mission-progress" aria-label="Mission progress">
        {missions.map((mission, i) => (
          <li
            key={mission.id}
            className={
              Math.floor(index / 3) === i
                ? "current"
                : Math.floor(index / 3) > i
                  ? "done"
                  : ""
            }
            aria-current={Math.floor(index / 3) === i ? "step" : undefined}
          >
            <span>0{i + 1}</span>
            {mission.id}
            <small>3 rounds</small>
          </li>
        ))}
      </ol>
      <div className="round-heading">
        <div>
          <p className="eyebrow">
            {view.mission} / ROUND {(index % 3) + 1} OF 3 · RUN {index + 1} OF 9
          </p>
          <h2 ref={heading} tabIndex={-1}>
            {view.title}
          </h2>
          <p>{view.lesson}</p>
        </div>
        <div className="round-dots" aria-label={`${index + 1} of 9 rounds`}>
          {Array.from({ length: 9 }, (_, i) => (
            <i key={i} className={i <= index ? "filled" : ""} />
          ))}
        </div>
      </div>
      <p className="simulation-unit-note">
        Ticks are illustrative simulation units, not real Solana milliseconds.
        Credits are invented integer units, not money. Reading and choosing
        consume zero ticks.
      </p>
      {outcome ? (
        <>
          <RoundReview key={outcome.roundId} round={outcome}>
            <div className="round-continue">
              <div>
                <span className="mono">
                  ROUND CONTRIBUTION: +{outcome.score.total} / 10
                </span>
                <p className="quick-score">
                  Information +{outcome.score.contributions[0].points}/3 · Net
                  costs +{outcome.score.contributions[1].points}/4 · Context +
                  {outcome.score.contributions[2].points}/3
                </p>
              </div>
              <button
                className="button primary"
                type="button"
                onClick={continueRun}
              >
                {draft.actions.length === 9
                  ? "See full run results"
                  : (index + 1) % 3 === 0
                    ? `Continue to ${missions[Math.floor((index + 1) / 3)].id}`
                    : "Next round"}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </RoundReview>
        </>
      ) : (
        <>
          <div className="decision-grid">
            <section
              className="observation-panel"
              aria-label="Information available at observation"
            >
              <p className="eyebrow">WHAT YOUR STRATEGY KNOWS NOW</p>
              <div className="executed-snapshot">
                <span className="snapshot-tile">0{index + 1}</span>
                <div>
                  <strong>
                    Executed market event · tick {view.executedEvent.tick}
                  </strong>
                  <p>{view.executedEvent.description}</p>
                </div>
              </div>
              <dl className="observation-data">
                <div>
                  <dt>Observation arrives</dt>
                  <dd>Tick {view.observationTick}</dd>
                </div>
                <div>
                  <dt>Signal age</dt>
                  <dd>{view.signalAge} ticks</dd>
                </div>
                <div>
                  <dt>Freshness limit</dt>
                  <dd>{view.maxSignalAge} ticks</dd>
                </div>
                <div>
                  <dt>Observed gross estimate</dt>
                  <dd>{credits(view.estimatedGross)}</dd>
                </div>
                <div>
                  <dt>Minimum acceptable net</dt>
                  <dd>{credits(view.minNet)}</dd>
                </div>
                <div>
                  <dt>Gross execution guard</dt>
                  <dd>≥ {credits(view.executionFloor)}</dd>
                </div>
                <div>
                  <dt>Transaction expires</dt>
                  <dd>Tick {view.expiresAt}</dd>
                </div>
              </dl>
              <p className="market-risk">
                {view.uncertain
                  ? "Disclosed uncertainty: market conditions may change after this observation. A considered Act or cautious Pass can both earn full credit if the visible estimate supports them."
                  : "This round provides no additional uncertainty warning. Judge the disclosed age, costs, and coverage; estimates remain illustrative."}
              </p>
              <p className="snapshot-note">
                This is a snapshot of an already-executed event, not current or
                pending market flow. Later executed events are withheld until
                you commit.
              </p>
            </section>
            <section className="action-panel" aria-label="Act or pass decision">
              <p className="eyebrow">CHECK THE ESTIMATE. THEN CHOOSE.</p>
              <h3>Is this opportunity worth acting on?</h3>
              {view.mission === "LAND" && (
                <div className="leader-schedule">
                  <h4>Published synthetic leader schedule</h4>
                  <ol>
                    {view.schedule.map((slot) => (
                      <li
                        key={slot.id}
                        className={
                          slot.producer === "Raiku" ? "raiku-slot" : ""
                        }
                      >
                        <span>
                          {slot.id} · tick {slot.tick}
                        </span>
                        <strong>{slot.producer}</strong>
                      </li>
                    ))}
                  </ol>
                  <p>
                    This schedule is known in advance. It reveals no future
                    market events or outcomes.
                  </p>
                </div>
              )}
              <fieldset className="execution-paths">
                <legend>Illustrative execution path</legend>
                {view.paths.map((path) => (
                  <label
                    key={path.id}
                    className={`choice ${path.id === selectedPath.id ? "selected" : ""} ${!path.enabled ? "unavailable-path" : ""}`}
                  >
                    <input
                      type="radio"
                      name="execution-path"
                      value={path.id}
                      checked={path.id === selectedPath.id}
                      disabled={!path.enabled}
                      onChange={() => setPathId(path.id)}
                    />
                    <span>
                      <strong>{path.label}</strong>
                      <small>
                        {path.unavailableReason ??
                          `Arrival tick ${path.arrivalTick}; ${path.expectedBlockTick === null ? "no block before expiry" : `first eligible block tick ${path.expectedBlockTick}`}.`}
                      </small>
                    </span>
                  </label>
                ))}
              </fieldset>
              {view.mission === "LAND" && (
                <p className="coverage-note">
                  Opportunity eligibility:{" "}
                  {view.eligible
                    ? "eligible in this authored example"
                    : "not eligible"}
                  . The Raiku co-location example only applies to eligible
                  orders in its Raiku-produced target block. No live coverage or
                  performance claim.
                </p>
              )}
              <dl className="cost-preview">
                <div>
                  <dt>Estimated gross</dt>
                  <dd>{credits(view.estimatedGross)}</dd>
                </div>
                <div>
                  <dt>Execution fee · only if included</dt>
                  <dd>{credits(selectedPath.executionFee)}</dd>
                </div>
                <div>
                  <dt>Trading cost · only if successful</dt>
                  <dd>{credits(selectedPath.tradingCost)}</dd>
                </div>
                <div>
                  <dt>Operating cost · if Act</dt>
                  <dd>{credits(selectedPath.operatingCost)}</dd>
                </div>
                <div className="estimated-net">
                  <dt>Estimated net · selected path</dt>
                  <dd>{credits(selectedPath.estimatedNet)}</dd>
                </div>
              </dl>
              <p className="estimate-warning">
                {selectedPath.expectedBlockTick === null
                  ? "The published schedule offers no inclusion before expiry on this path. The net estimate is therefore just the operating loss."
                  : "The net estimate assumes successful execution at the observed gross. Actual market conditions and costs determine the realised result."}{" "}
                The {credits(view.minNet)} net minimum is your decision policy,
                not an enforced order guard.
              </p>
              <div className="act-pass-controls">
                <button
                  type="button"
                  className="button primary"
                  onClick={() =>
                    commit({ kind: "act", pathId: selectedPath.id })
                  }
                >
                  Act · submit
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => commit({ kind: "pass" })}
                >
                  Pass · no trade
                </button>
              </div>
              <p className="pass-note">
                Pass costs nothing and yields zero trade P&amp;L. It may forgo
                an opportunity.
              </p>
            </section>
          </div>
          <aside className="rubric-preview">
            <strong>Know the rubric before you choose.</strong>
            <p>
              3 points for information discipline + 4 for net-cost discipline +
              3 for context and coverage. Prefer fresh, viable estimates; pass
              on stale or below-minimum opportunities. Disclosed uncertainty
              supports either a viable Act or cautious Pass. A later surprise
              never changes your score.
            </p>
            <Link to="/about#simulation-rules" className="text-link">
              Read the scoring rules
            </Link>
          </aside>
          {draft.actions.length === 0 && (
            <form
              className="seed-form"
              onSubmit={(event) => {
                event.preventDefault();
                const seed = Number(seedInput);
                if (!isRunConfig({ ...DEFAULT_CONFIG, seed })) {
                  setMessage("Use an integer seed from 0 to 4294967295.");
                  return;
                }
                restart(seed);
                setMessage(`Scenario seed set to ${seed}.`);
              }}
            >
              <label htmlFor="scenario-seed">Replayable seed</label>
              <input
                id="scenario-seed"
                type="number"
                min="0"
                max="4294967295"
                step="1"
                required
                value={seedInput}
                onChange={(event) => setSeedInput(event.target.value)}
              />
              <button type="submit" className="button secondary">
                Use seed
              </button>
              <p>
                Only compare scores with this same scenario version and seed.
              </p>
            </form>
          )}
        </>
      )}
      <p role="status" className="storage-message">
        {message}
      </p>
      <p className="development-label">
        Authored educational scenarios, not measured live outcomes. No named
        competing providers or pending-flow access. Inclusion and execution do
        not imply network finality. No real trades occur.
      </p>
    </section>
  );
}
