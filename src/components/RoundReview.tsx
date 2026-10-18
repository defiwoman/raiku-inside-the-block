import { useState, type ReactNode } from "react";
import type { RoundResult } from "../lib/simulation";
import { credits, signedCredits, statusLabel } from "../lib/presentation";

export function RoundReview({
  round,
  children,
}: {
  round: RoundResult;
  children?: ReactNode;
}) {
  const [eventIndex, setEventIndex] = useState(0);
  const event = round.events[eventIndex];
  const pathId = round.action.kind === "act" ? round.action.pathId : null;
  const selectedPath = round.decision.paths.find((path) => path.id === pathId);
  return (
    <div className="round-review">
      <div className="round-outcome">
        <div>
          <p className="eyebrow">ROUND {round.roundIndex + 1} / OUTCOME</p>
          <h2>{statusLabel(round)}</h2>
          <p>{round.explanation}</p>
        </div>
        <div className="outcome-net">
          <span>SIMULATED NET</span>
          <strong>{signedCredits(round.ledger.netResult)}</strong>
          <small>Learning score is separate.</small>
        </div>
      </div>
      {children}
      <div className="round-ledgers">
        <section aria-label="Estimate and realised ledger">
          <h3>Estimate vs realised outcome</h3>
          <p className="ledger-estimate">
            At observation: {credits(round.decision.estimatedGross)} gross
            {selectedPath
              ? `; ${credits(selectedPath.estimatedNet)} estimated net via the selected path.`
              : ". You chose Pass, so no costs were charged."}
          </p>
          <dl className="financial-ledger">
            <div>
              <dt>Realised gross benefit</dt>
              <dd>{credits(round.ledger.grossBenefit)}</dd>
            </div>
            <div>
              <dt>Network execution fee</dt>
              <dd>−{credits(round.ledger.executionFee)}</dd>
            </div>
            <div>
              <dt>Trading cost (only on success)</dt>
              <dd>−{credits(round.ledger.tradingCost)}</dd>
            </div>
            <div className="ledger-subtotal">
              <dt>Trade P&amp;L</dt>
              <dd>{signedCredits(round.ledger.tradePnL)}</dd>
            </div>
            <div>
              <dt>Operating cost (separate)</dt>
              <dd>−{credits(round.ledger.operatingCost)}</dd>
            </div>
            <div className="ledger-total">
              <dt>Net result</dt>
              <dd>{signedCredits(round.ledger.netResult)}</dd>
            </div>
          </dl>
          <p className="ledger-note">
            {round.status === "failed"
              ? "The included attempt incurs the disclosed 6-credit simulated fee, even though execution fails. No trading cost applies."
              : round.status === "dropped"
                ? "Never included: no network execution fee. The operating cost covers the submitted attempt."
                : round.status === "passed"
                  ? `Possible forgone net: ${credits(round.ledger.forgoneOpportunity)}. This is an authored counterfactual, not an actual cost or score deduction.`
                  : "Gross execution conditions can succeed even when net after costs is zero or negative."}
          </p>
        </section>
        <section
          className="round-score"
          aria-label="Exact learning score contribution"
        >
          <div className="score-heading">
            <h3>Decision score</h3>
            <strong>
              +{round.score.total} / {round.score.max}
            </strong>
          </div>
          <p>
            Only information available when you chose. No outcome bonus or
            hindsight penalty.
          </p>
          <ol>
            {round.score.contributions.map((item) => (
              <li key={item.label}>
                <div>
                  <strong>{item.label}</strong>
                  <span>
                    +{item.points} / {item.max}
                  </span>
                </div>
                <p>{item.reason}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <details className="event-replay" aria-label="Engine event replay">
        <summary>Replay recorded events</summary>
        <div className="section-heading">
          <h3>Replay the engine events.</h3>
          <span className="mono">
            ILLUSTRATIVE TICKS · {eventIndex + 1} / {round.events.length}
          </span>
        </div>
        <div className="event-markers" aria-label="Replay event selection">
          {round.events.map((item, index) => (
            <button
              type="button"
              key={`${item.kind}-${index}`}
              aria-label={`Event ${index + 1}: ${item.title}`}
              aria-current={index === eventIndex ? "step" : undefined}
              onClick={() => setEventIndex(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="replay-event-card" key={eventIndex}>
          <span className="eyebrow">
            TICK {event.tick} / {event.kind}
          </span>
          <h4>{event.title}</h4>
          <p>{event.detail}</p>
        </div>
        <div className="replay-controls">
          <button
            type="button"
            className="button secondary"
            disabled={eventIndex === 0}
            onClick={() => setEventIndex(eventIndex - 1)}
          >
            Previous event
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={eventIndex === round.events.length - 1}
            onClick={() => setEventIndex(eventIndex + 1)}
          >
            Next event
          </button>
        </div>
      </details>
    </div>
  );
}
