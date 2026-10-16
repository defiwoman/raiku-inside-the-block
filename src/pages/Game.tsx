import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BlockScene } from "../components/BlockScene";
import { missions, simulate } from "../lib/simulation";
import type { Choices, MissionIndex } from "../lib/simulation";
import { saveRun } from "../lib/progress";

export function Game() {
  const [step, setStep] = useState<MissionIndex>(0);
  const [choices, setChoices] = useState<Choices>(["", "", ""]);
  const navigate = useNavigate();
  const mission = missions[step];
  const selected = choices[step];
  function next() {
    if (!selected) return;
    if (step < 2) {
      setStep((step + 1) as MissionIndex);
      return;
    }
    const run = simulate(choices);
    const { persisted } = saveRun(run);
    navigate("/results", { state: { run, persisted } });
  }
  return (
    <section className="page-width inner-page game-page">
      <div className="game-topline">
        <Link className="text-link" to="/tutorial">
          ← How to play
        </Link>
        <span className="prototype-badge">ILLUSTRATIVE PROTOTYPE</span>
      </div>
      <div className="game-heading">
        <div>
          <p className="eyebrow">YOUR OPPORTUNITY STARTS HERE</p>
          <h1>Inside the block.</h1>
        </div>
        <button
          className="text-link"
          onClick={() => {
            setChoices(["", "", ""]);
            setStep(0);
          }}
        >
          Restart ↻
        </button>
      </div>
      <ol className="mission-progress" aria-label="Mission progress">
        {missions.map((item, index) => (
          <li
            key={item.id}
            className={step === index ? "current" : step > index ? "done" : ""}
            aria-current={step === index ? "step" : undefined}
          >
            <span>{step > index ? "✓" : `0${index + 1}`}</span>
            {item.id}
            <small>{item.title}</small>
          </li>
        ))}
      </ol>
      <div className="game-layout">
        <div className="game-scene">
          <BlockScene compact phase={step} />
          <div className="simulation-facts">
            <span>
              <i className="status-dot" /> INVENTED MARKET
            </span>
            <span>WINDOW: 400 TICKS</span>
          </div>
          <p className="scene-explainer">
            The market event has already executed. Your observation and response
            happen afterward. Ticks are arbitrary teaching units.
          </p>
        </div>
        <div className="decision-panel">
          <p className="eyebrow">
            MISSION 0{step + 1} / {mission.id}
          </p>
          <h2>{mission.question}</h2>
          <fieldset>
            <legend className="sr-only">
              Choose your {mission.id} strategy
            </legend>
            {mission.options.map((option) => (
              <label
                className={`choice ${selected === option.value ? "selected" : ""}`}
                key={option.value}
              >
                <input
                  type="radio"
                  name={`mission-${step}`}
                  value={option.value}
                  checked={selected === option.value}
                  onChange={() =>
                    setChoices(
                      (previous) =>
                        previous.map((value, index) =>
                          index === step ? option.value : value,
                        ) as Choices,
                    )
                  }
                />
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.detail}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="decision-actions">
            {step > 0 && (
              <button
                className="button secondary"
                onClick={() => setStep((step - 1) as MissionIndex)}
              >
                Back
              </button>
            )}
            <button
              className="button primary"
              disabled={!selected}
              onClick={next}
            >
              {step === 2
                ? "Reveal my result"
                : `Continue to ${missions[step + 1].id}`}{" "}
              <span>→</span>
            </button>
          </div>
          <p className="decision-hint">
            {selected
              ? "Choice locked in? Continue when you’re ready."
              : "Choose a path to continue. There’s something to learn from each."}
          </p>
        </div>
      </div>
      <p className="development-label">
        DEVELOPMENT PLACEHOLDER · Market replay, variable block schedules, and
        network finality are not modeled in this first prototype.
      </p>
    </section>
  );
}
