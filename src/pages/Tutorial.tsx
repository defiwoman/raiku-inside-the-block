import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Arrow } from "../components/Arrow";
import { Glossary } from "../components/Glossary";
import {
  readOnboarding,
  saveOnboarding,
  emptyOnboarding,
  normalizeDisplayName,
} from "../lib/onboarding";
import type { OnboardingProgress } from "../lib/onboarding";
import { clearProgress } from "../lib/progress";
import { simulateTutorial, tutorialScenario } from "../lib/simulation";
import type { TutorialChoice } from "../lib/simulation";

export function Tutorial() {
  const [progress, setProgress] = useState(readOnboarding);
  const [name, setName] = useState(progress.displayName);
  const [message, setMessage] = useState("");
  const [storageBlocked, setStorageBlocked] = useState(false);
  const replayHeading = useRef<HTMLHeadingElement>(null);
  const choiceHeading = useRef<HTMLHeadingElement>(null);
  const shouldFocus = useRef(false);
  const replay = progress.choice ? simulateTutorial(progress.choice) : null;

  useEffect(() => {
    if (shouldFocus.current) {
      (replay ? replayHeading : choiceHeading).current?.focus();
      shouldFocus.current = false;
    }
  }, [progress.choice, progress.replayStep, replay]);

  function persist(next: OnboardingProgress) {
    setProgress(next);
    const persisted = saveOnboarding(next);
    setStorageBlocked(!persisted);
    return persisted;
  }
  function choose(choice: TutorialChoice) {
    shouldFocus.current = true;
    persist({ ...progress, choice, replayStep: 0 });
  }
  function goToStep(step: number) {
    shouldFocus.current = true;
    persist({ ...progress, replayStep: step });
  }
  function reset() {
    const cleared = clearProgress();
    setProgress(emptyOnboarding());
    setName("");
    setStorageBlocked(!cleared);
    setMessage(
      cleared
        ? "Name, tutorial, and game progress reset on this device."
        : "This visit’s tutorial has been reset. Your browser blocked changes to saved progress.",
    );
  }

  return (
    <section className="page-width inner-page beginner-page">
      <div className="beginner-topline">
        <Link to="/" className="text-link">
          ← Overview
        </Link>
        <span className="prototype-badge">NO ACCOUNT REQUIRED</span>
      </div>
      <div className="page-heading">
        <p className="eyebrow">BEFORE YOUR FIRST BLOCK</p>
        <h1>
          A small example.
          <br />A clearer picture.
        </h1>
        <p>
          Watch what happens between an event and your response. Go at your own
          pace—there’s no countdown.
        </p>
      </div>
      <section
        id="your-progress"
        className="guest-panel"
        aria-labelledby="guest-heading"
      >
        <div>
          <p className="eyebrow">YOUR DEVICE. YOUR JOURNEY.</p>
          <h2 id="guest-heading">
            {progress.displayName
              ? `Welcome, ${progress.displayName}.`
              : "You’re welcome as a guest."}
          </h2>
          <p>
            No registration, wallet, email, or X account. Your optional name and
            progress stay in this browser.
          </p>
        </div>
        <form
          className="guest-form"
          onSubmit={(event) => {
            event.preventDefault();
            const displayName = normalizeDisplayName(name);
            setName(displayName);
            const persisted = persist({ ...progress, displayName });
            setMessage(
              displayName
                ? persisted
                  ? `Display name saved: ${displayName}.`
                  : `Display name set for this visit: ${displayName}.`
                : "Playing as a guest. No display name saved.",
            );
          }}
        >
          <label htmlFor="display-name">
            Display name <span>(optional)</span>
          </label>
          <div className="guest-input-row">
            <input
              id="display-name"
              name="displayName"
              type="text"
              maxLength={24}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="off"
              aria-describedby="name-help"
              placeholder="Guest"
            />
            <button type="submit" className="button secondary">
              Save name
            </button>
          </div>
          <p id="name-help">
            Up to 24 characters. Leave it blank to stay a guest.
          </p>
        </form>
        <div className="guest-panel-bottom">
          <Link className="text-link" to="/game">
            {progress.displayName
              ? "Skip to the three missions"
              : "Play as guest"}
            <Arrow />
          </Link>
          <button type="button" className="text-link" onClick={reset}>
            Reset this device’s progress
          </button>
        </div>
      </section>
      <p className="onboarding-message" role="status">
        {message}
        {storageBlocked && (
          <span>
            {" "}
            Browser storage is unavailable. You can keep playing, but these
            changes will not survive a reload.
          </span>
        )}
      </p>
      <section className="tutorial-example" aria-labelledby="example-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TRY IT / ONE EVENT, ONE DECISION</p>
            <h2 id="example-heading">
              The market moved. Your signal followed.
            </h2>
          </div>
          <span className="mono">SELF-PACED EXAMPLE</span>
        </div>
        <div className="example-layout">
          <div className="example-market">
            <div className="example-market-header">
              <span>
                <i className="status-dot" /> INVENTED SCENARIO
              </span>
              <span>NOT A LIVE FEED</span>
            </div>
            <div className="example-event">
              <span className="example-tile">07</span>
              <div>
                <span className="eyebrow">
                  TICK {tutorialScenario.executedAt} / EXECUTED EVENT
                </span>
                <h3>A transaction changes the market.</h3>
                <p>
                  The opportunity fits your price rule. The event has happened;
                  you haven’t seen it yet.
                </p>
              </div>
            </div>
            <div className="observation-journey">
              <span className="journey-line" aria-hidden="true" />
              <span>120 illustrative ticks later</span>
              <span className="observation-target" aria-hidden="true" />
            </div>
            <div className="example-observation">
              <span className="eyebrow">
                TICK {tutorialScenario.observedAt} / YOUR OBSERVATION
              </span>
              <h3>You learn what happened.</h3>
              <p>
                Your signal is 120 ticks old. The price rule stops being met at
                tick {tutorialScenario.priceWindowClosesAt}.
              </p>
            </div>
            <div className="example-rule">
              <span>CHECK + SUBMISSION PATH</span>
              <strong>40 + 80 ticks</strong>
            </div>
            <p className="example-market-note">
              All ticks, market rules, and outcomes are invented. Blackline
              reacts to already-executed transactions; no pending transactions
              are shown.
            </p>
          </div>
          <div className="example-decision">
            {!replay ? (
              <>
                <p className="eyebrow">YOUR CALL / ACT OR PASS</p>
                <h3 ref={choiceHeading} tabIndex={-1}>
                  Is this opportunity still worth taking?
                </h3>
                <p>
                  If you act, a check takes 40 ticks and the path to a block
                  takes 80 more. You can also pass and wait for fresh
                  information.
                </p>
                <div className="tutorial-choices">
                  <button
                    className="tutorial-choice"
                    type="button"
                    onClick={() => choose("act")}
                  >
                    <span className="choice-letter">A</span>
                    <span>
                      <strong>Act</strong>
                      <small>Check and submit a transaction.</small>
                    </span>
                    <Arrow />
                  </button>
                  <button
                    className="tutorial-choice"
                    type="button"
                    onClick={() => choose("pass")}
                  >
                    <span className="choice-letter">P</span>
                    <span>
                      <strong>Pass</strong>
                      <small>Don’t submit. Wait for a fresh signal.</small>
                    </span>
                    <Arrow />
                  </button>
                </div>
                <p className="example-hint">
                  Try either choice. The replay explains it—there’s no score in
                  this example.
                </p>
              </>
            ) : (
              <>
                <p className="eyebrow">
                  YOUR REPLAY / YOU CHOSE {progress.choice?.toUpperCase()}
                </p>
                <div className="replay-tabs" aria-label="Replay moments">
                  {replay.steps.map((step, index) => (
                    <button
                      type="button"
                      key={step.label}
                      onClick={() => goToStep(index)}
                      aria-current={
                        progress.replayStep === index ? "step" : undefined
                      }
                      aria-label={`Replay moment ${index + 1}: ${step.label}`}
                    >
                      0{index + 1}
                    </button>
                  ))}
                </div>
                <div className="replay-content">
                  <span className="replay-tick mono">
                    TICK {replay.steps[progress.replayStep].tick} /{" "}
                    {replay.steps[progress.replayStep].label}
                  </span>
                  <h3 ref={replayHeading} tabIndex={-1}>
                    {replay.steps[progress.replayStep].title}
                  </h3>
                  <p>{replay.steps[progress.replayStep].description}</p>
                </div>
                <div className="replay-controls">
                  <button
                    className="button secondary"
                    type="button"
                    disabled={progress.replayStep === 0}
                    onClick={() => goToStep(progress.replayStep - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className="button primary"
                    type="button"
                    disabled={progress.replayStep === 3}
                    onClick={() => goToStep(progress.replayStep + 1)}
                  >
                    Next moment <span aria-hidden="true">→</span>
                  </button>
                </div>
                <button
                  className="text-link try-other"
                  type="button"
                  onClick={() => {
                    shouldFocus.current = true;
                    persist({ ...progress, choice: null, replayStep: 0 });
                  }}
                >
                  Try another choice <span aria-hidden="true">↻</span>
                </button>
              </>
            )}
          </div>
        </div>
        <aside className="tutorial-takeaway">
          <span className="small-cross" aria-hidden="true">
            +
          </span>
          <p>
            <strong>A place in a block is only one part of the story.</strong>{" "}
            Inclusion, successful execution, network finality, and profit are
            different things. Raiku’s relevant inclusion claims concern eligible
            orders in Raiku-produced blocks. This example is not a live
            integration.
          </p>
        </aside>
      </section>
      <Glossary />
      <section className="bottom-callout beginner-next">
        <div>
          <p className="eyebrow">NEXT / SEE → ACT → LAND</p>
          <h2>Ready to connect the pieces?</h2>
          <p>
            Explore three missions. Change your choices and replay as often as
            you like.
          </p>
        </div>
        <Link className="button primary" to="/game">
          Start the three missions <Arrow />
        </Link>
      </section>
    </section>
  );
}
