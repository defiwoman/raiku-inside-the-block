import { Link } from "react-router-dom";
import { Arrow } from "../components/Arrow";
import { LandingBlock } from "../components/LandingBlock";
import { Glossary } from "../components/Glossary";
import { readProgress } from "../lib/progress";
import { readOnboarding } from "../lib/onboarding";

const introduction = [
  {
    name: "SEE",
    question: "When does your strategy learn what happened?",
    detail:
      "Start with an event that has already executed. Then follow the information to you.",
  },
  {
    name: "ACT",
    question: "Is the opportunity still worth taking?",
    detail:
      "Take a breath, check what has changed, and choose whether to act or pass.",
  },
  {
    name: "LAND",
    question: "What happens when your transaction reaches execution?",
    detail:
      "See why being included in a block and executing successfully are different things.",
  },
];

export function Home() {
  const progress = readProgress();
  const onboarding = readOnboarding();
  return (
    <>
      <section className="home-hero landing-hero page-width">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-cross" aria-hidden="true">
              +
            </span>{" "}
            A community experience exploring Raiku
          </p>
          <h1>
            Inside
            <br />
            the Block
          </h1>
          <h2 className="hero-headline">
            You spotted the opportunity. Can your strategy act in time?
          </h2>
          <p className="hero-description">
            Explore how information, decisions, and execution shape a trade—in a
            short interactive simulation.
          </p>
          <div className="hero-actions">
            <Link to="/tutorial" className="button primary">
              Enter the Block <Arrow />
            </Link>
            <a href="#how-it-works" className="button secondary">
              How it works <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="hero-small">
            <span className="small-cross" aria-hidden="true">
              +
            </span>{" "}
            Play as a guest · No wallet · About 3 minutes
          </p>
        </div>
        <div className="hero-visual">
          <LandingBlock />
          <p className="landing-illustration-note">
            An illustration of an already-executed event. Not a live feed or a
            performance benchmark.
          </p>
        </div>
      </section>
      <section
        id="how-it-works"
        className="page-width landing-introduction"
        aria-labelledby="intro-title"
        tabIndex={-1}
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE JOURNEY, IN THREE PARTS</p>
            <h2 id="intro-title">An opportunity is only the beginning.</h2>
          </div>
          <span className="mono">01 — 02 — 03</span>
        </div>
        <div className="intro-cards">
          {introduction.map((item, index) => (
            <article className="intro-card" key={item.name}>
              <div className="intro-card-top">
                <span className="mono">0{index + 1}</span>
                <div
                  className={`mission-symbol symbol-${index}`}
                  aria-hidden="true"
                >
                  {index === 0 ? (
                    <>
                      <i />
                      <i />
                      <i />
                      <b />
                    </>
                  ) : index === 1 ? (
                    <>
                      <i />
                      <i />
                      <i />
                    </>
                  ) : (
                    <>
                      <i />
                      <i />
                      <i />
                      <i />
                    </>
                  )}
                </div>
              </div>
              <h3>{item.name}</h3>
              <h4>{item.question}</h4>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
        <p className="intro-boundary">
          Inclusion, execution, network finality, and profit are different
          concepts. This invented simulation explores the first two; it does not
          predict trading results.
        </p>
      </section>
      <div className="page-width">
        <Glossary />
      </div>
      <section className="bottom-callout page-width landing-callout">
        <div>
          <p className="eyebrow">
            {onboarding.choice || progress.lastRun
              ? "YOUR JOURNEY CONTINUES"
              : "NO ACCOUNT. NO PRESSURE."}
          </p>
          <h2>
            {onboarding.displayName
              ? `Your next block, ${onboarding.displayName}.`
              : "A little curiosity goes a long way."}
          </h2>
          <p>
            Your progress stays on this device. Start fresh any time in the
            tutorial.
          </p>
        </div>
        <Link
          to={progress.lastRun ? "/results" : "/tutorial"}
          className="button primary"
        >
          {progress.lastRun
            ? "View my last run"
            : onboarding.choice
              ? "Continue learning"
              : "Try the first example"}
          <Arrow />
        </Link>
      </section>
    </>
  );
}
