import { Arrow } from "../components/Arrow";
import { Link } from "react-router-dom";
import { BlockScene } from "../components/BlockScene";
import { missions } from "../lib/simulation";
import { readProgress } from "../lib/progress";

export function Home() {
  const progress = readProgress();
  return (
    <>
      <section className="home-hero page-width">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-cross">+</span> A GAME OF TIMING &
            POSSIBILITY
          </p>
          <h1>
            Same market.
            <br />
            Different
            <br />
            <span className="serif-accent">moment.</span>
          </h1>
          <p className="hero-description">
            A signal. A decision. A place in the block.
            <br className="desktop-break" /> Step inside and discover how the
            pieces connect.
          </p>
          <div className="hero-actions">
            <Link to="/tutorial" className="button primary">
              Let’s play{" "}
              <span aria-hidden="true">
                <Arrow />
              </span>
            </Link>
            <span className="time-note">
              <span aria-hidden="true">◷</span> 3 MISSIONS · ~3 MINUTES
            </span>
          </div>
          <p className="hero-small">
            No wallet. No real trades. Just a new perspective.
          </p>
        </div>
        <div className="hero-visual">
          <BlockScene />
          <div className="visual-caption">
            <span>AN OPPORTUNITY IS ONLY THE BEGINNING.</span>
            <span>
              FIG. 01 <Arrow />
            </span>
          </div>
        </div>
      </section>
      <section className="intro-strip page-width">
        <div>
          <span className="small-cross">+</span>
          <span>UNDER THE SURFACE</span>
        </div>
        <p>
          Markets move fast.
          <br />
          <strong>Understanding them starts here.</strong>
        </p>
        <p>
          Follow one simulated opportunity from the first observation to the
          next block. Your choices shape the journey.
        </p>
      </section>
      <section
        className="missions-section page-width"
        aria-labelledby="missions-title"
      >
        <div className="section-heading">
          <h2 id="missions-title">Three moments that matter.</h2>
          <span className="eyebrow">ONE BLOCK. YOUR CALL.</span>
        </div>
        <div className="mission-cards">
          {missions.map((mission, index) => (
            <Link
              to={`/tutorial?step=${index}`}
              className="mission-card"
              key={mission.id}
            >
              <div className="card-top">
                <span className="mono">MISSION 0{index + 1}</span>
                <span className="card-arrow" aria-hidden="true">
                  <Arrow />
                </span>
              </div>
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
              <h3>
                {mission.id}
                <span>{mission.title}</span>
              </h3>
              <p>{mission.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="bottom-callout page-width">
        <div>
          <span className="eyebrow">A SMALL SIMULATION. A BIGGER PICTURE.</span>
          <h2>Curiosity is your edge.</h2>
        </div>
        <Link
          to={progress.lastRun ? "/results" : "/about"}
          className="text-link"
        >
          {progress.lastRun
            ? "Revisit your last run"
            : "What’s behind the game"}{" "}
          <span aria-hidden="true">
            <Arrow />
          </span>
        </Link>
      </section>
    </>
  );
}
