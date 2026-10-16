import { Arrow } from "../components/Arrow";
import { useState } from "react";
import { Link } from "react-router-dom";
import { clearProgress } from "../lib/progress";

export function About() {
  const [message, setMessage] = useState("");
  return (
    <section className="page-width inner-page about-page">
      <div className="page-heading">
        <p className="eyebrow">CONTEXT BEFORE CONVICTION</p>
        <h1>A window into the block.</h1>
        <p>
          A community-built game for people who ask, “How does that actually
          work?”
        </p>
      </div>
      <div className="about-layout">
        <div className="about-intro">
          <span className="small-cross">+</span>
          <h2>
            Learn the mechanics.
            <br />
            Keep the curiosity.
          </h2>
          <p>
            Raiku: Inside the Block makes the journey from information to
            inclusion a little more tangible. It is for crypto community
            members, curious traders, and complete beginners.
          </p>
          <Link className="text-link" to="/tutorial">
            Take the walkthrough <Arrow />
          </Link>
        </div>
        <div className="about-sections">
          <section>
            <h2>A teaching model, not a benchmark.</h2>
            <p>
              Every time value, market event, rule, and score here is invented.
              The game is not a live Raiku integration, a performance benchmark,
              financial advice, or a prediction of trading results. No wallet,
              real trades, tokens, payments, rewards, or backend are involved.
            </p>
          </section>
          <section>
            <h2>What the words mean.</h2>
            <dl>
              <dt>Observation</dt>
              <dd>
                Learning about an already-executed transaction. Blackline reacts
                to executed transactions, not pending ones. Nothing here depicts
                front-running.
              </dd>
              <dt>Inclusion</dt>
              <dd>
                An order being included in a block. Raiku’s relevant inclusion
                claims concern eligible orders in Raiku-produced blocks.
              </dd>
              <dt>Execution</dt>
              <dd>
                An included order successfully satisfying its execution
                conditions. Inclusion alone does not establish that success.
              </dd>
              <dt>Finality & profit</dt>
              <dd>
                Network finality concerns confirmation of network state. Profit
                concerns economic outcomes, including costs and risk. Neither is
                guaranteed by inclusion or execution, and neither is modeled
                here.
              </dd>
            </dl>
          </section>
          <section>
            <h2>Your progress stays with you.</h2>
            <p>
              Only your personal progress—your optional display name, tutorial
              choice and replay position, run count, best learning score, and
              last run—is saved in this browser’s localStorage. No account or
              server receives it. The share card is generated and downloaded on
              your device.
            </p>
            <p>
              Clearing progress also removes your optional name and tutorial
              progress.
            </p>
            <button
              className="text-link"
              onClick={() =>
                setMessage(
                  clearProgress()
                    ? "Personal progress cleared from this browser."
                    : "Your browser blocked access to local storage.",
                )
              }
            >
              Clear my local progress <Arrow />
            </button>
            <p role="status">{message}</p>
          </section>
          <section>
            <h2>Go to the source.</h2>
            <p>
              Read the official materials for product context. This community
              project claims no partnership or endorsement.
            </p>
            <ul className="reference-links">
              <li>
                <a href="https://raiku.com/" target="_blank" rel="noreferrer">
                  Raiku website <Arrow />
                </a>
              </li>
              <li>
                <a
                  href="https://raiku.com/brand-assets"
                  target="_blank"
                  rel="noreferrer"
                >
                  Official brand assets <Arrow />
                </a>
              </li>
              <li>
                <a
                  href="https://raiku.com/news/what-is-co-location-on-solana"
                  target="_blank"
                  rel="noreferrer"
                >
                  What is co-location on Solana? <Arrow />
                </a>
              </li>
            </ul>
            <p className="asset-note">
              Official SVG downloads were unavailable during development. The
              title is plain text; no substitute logo is used.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
