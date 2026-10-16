import { Arrow } from "../components/Arrow";
import { Link, useSearchParams } from "react-router-dom";
import { BlockScene } from "../components/BlockScene";
import { missions } from "../lib/simulation";

const lessons = [
  {
    title: "First, see what happened.",
    body: "A swap has already executed in our invented market. You choose how soon you observe that same event. Earlier information leaves more room to decide, but does not guarantee a good decision.",
    note: "Blackline reacts to already-executed transactions. This game never shows pending transactions or front-running.",
  },
  {
    title: "Then, make a decision.",
    body: "Choose whether to check the simulated price and execution limit or act immediately. Speed alone is not enough: an order can arrive quickly and still fail its execution conditions.",
    note: "All choices, timing values, and market conditions are invented teaching examples. There is no live market data.",
  },
  {
    title: "Finally, find your place.",
    body: "Choose a submission path and see whether your order is included within the scenario’s time window. Raiku’s relevant inclusion claims concern eligible orders in Raiku-produced blocks; they are not a universal guarantee.",
    note: "Inclusion, successful execution, network finality, and profit are different concepts. This prototype models the first two only.",
  },
];

export function Tutorial() {
  const [params, setParams] = useSearchParams();
  const value = Number(params.get("step") || 0);
  const step = Number.isInteger(value) && value >= 0 && value <= 2 ? value : 0;
  return (
    <section className="page-width inner-page tutorial-page">
      <div className="page-heading">
        <p className="eyebrow">A QUICK WALKTHROUGH</p>
        <h1>Get to know the block.</h1>
        <p>Three choices. One journey. Here’s how it works.</p>
      </div>
      <div className="tutorial-layout">
        <div className="lesson-content">
          <div className="step-tabs" aria-label="Tutorial steps">
            {missions.map((mission, index) => (
              <button
                key={mission.id}
                onClick={() => setParams({ step: String(index) })}
                aria-current={step === index ? "step" : undefined}
              >
                <span>0{index + 1}</span> {mission.id}
              </button>
            ))}
          </div>
          <div className="lesson" key={step}>
            <span className="eyebrow">
              MISSION 0{step + 1} / {missions[step].id}
            </span>
            <h2>{lessons[step].title}</h2>
            <p>{lessons[step].body}</p>
            <aside className="content-note">
              <span aria-hidden="true">↳</span>
              <p>{lessons[step].note}</p>
            </aside>
          </div>
          <div className="lesson-actions">
            {step > 0 && (
              <button
                className="button secondary"
                onClick={() => setParams({ step: String(step - 1) })}
              >
                ← Back
              </button>
            )}
            {step < 2 ? (
              <button
                className="button primary"
                onClick={() => setParams({ step: String(step + 1) })}
              >
                Next: {missions[step + 1].id} <span>→</span>
              </button>
            ) : (
              <Link className="button primary" to="/game">
                Enter the simulation{" "}
                <span>
                  <Arrow />
                </span>
              </Link>
            )}
          </div>
        </div>
        <BlockScene phase={step} />
      </div>
      <p className="development-label">
        DEVELOPMENT PROTOTYPE · Simplified rules for learning. No real trading
        or live Raiku integration.
      </p>
    </section>
  );
}
