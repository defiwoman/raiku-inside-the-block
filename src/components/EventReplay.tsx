import { useEffect, useState } from "react";
import type { RoundResult } from "../lib/simulation";
import { replayStages } from "../lib/results";

export function EventReplay({ round }: { round: RoundResult }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [textOpen, setTextOpen] = useState(reducedMotion);
  const event = round.events[index];
  const stages = replayStages(round);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(media.matches);
      setTextOpen(media.matches);
      setPlaying(false);
    };
    media.addEventListener("change", update);
    const pauseIfHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pauseIfHidden);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", pauseIfHidden);
    };
  }, []);
  useEffect(() => {
    if (!playing || !open) return;
    if (index === round.events.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(
      () => setIndex((current) => current + 1),
      1600,
    );
    return () => window.clearTimeout(timer);
  }, [playing, open, index, round.events.length]);
  function step(next: number) {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(round.events.length - 1, next)));
  }
  function playPause() {
    if (playing) setPlaying(false);
    else {
      if (index === round.events.length - 1) setIndex(0);
      setPlaying(true);
    }
  }
  return (
    <details
      className={`event-replay playable-replay ${reducedMotion ? "text-motion-mode" : ""}`}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        setOpen(next);
        if (!next) setPlaying(false);
      }}
    >
      <summary>Replay recorded events</summary>
      <div className="section-heading">
        <h3>Follow what actually happened.</h3>
        <span className="mono">
          EVENT {index + 1} / {round.events.length} · ILLUSTRATIVE TICKS
        </span>
      </div>
      <ol className="replay-stages" aria-label="Round replay stages">
        {stages.map((stage) => (
          <li
            key={stage.label}
            className={
              stage.eventIndex === null
                ? "stage-not-applicable"
                : stage.eventIndex <= index
                  ? "stage-reached"
                  : ""
            }
          >
            <strong>{stage.label}</strong>
            <span>
              {stage.tick === null ? "Not applicable" : `Tick ${stage.tick}`}
            </span>
            <small>{stage.detail}</small>
          </li>
        ))}
      </ol>
      <div className="playback-controls" aria-label="Replay controls">
        <button
          type="button"
          className="button primary"
          onClick={playPause}
          aria-pressed={playing}
        >
          {playing ? "Pause replay" : "Play replay"}
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() => step(index - 1)}
          disabled={index === 0}
        >
          Step backward
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() => step(index + 1)}
          disabled={index === round.events.length - 1}
        >
          Step forward
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() => step(0)}
        >
          Replay from beginning
        </button>
      </div>
      <p className="replay-reading-note">
        {reducedMotion
          ? "Reduced motion is on. The full text timeline is available below; playback only changes the selected event."
          : "Playback displays recorded events every 1.6 seconds. Pause or step to read at your own pace."}{" "}
        Controls never change the engine result.
      </p>
      <div className="event-markers" aria-label="Replay event selection">
        {round.events.map((item, eventIndex) => (
          <button
            type="button"
            key={`${item.kind}-${eventIndex}`}
            aria-label={`Event ${eventIndex + 1}: ${item.title}`}
            aria-current={index === eventIndex ? "step" : undefined}
            onClick={() => step(eventIndex)}
          >
            {eventIndex + 1}
          </button>
        ))}
      </div>
      <div
        className="replay-event-card"
        key={index}
        data-event-kind={event.kind}
        data-event-tick={event.tick}
        aria-live={playing ? "off" : "polite"}
      >
        <span className="eyebrow">
          TICK {event.tick} / {event.kind}
        </span>
        <h4>{event.title}</h4>
        <p>{event.detail}</p>
      </div>
      <details
        className="text-timeline"
        open={textOpen}
        onToggle={(event) => setTextOpen(event.currentTarget.open)}
      >
        <summary>Text timeline · all recorded events</summary>
        <ol>
          {round.events.map((item, eventIndex) => (
            <li
              key={eventIndex}
              aria-current={eventIndex === index ? "step" : undefined}
              data-event-kind={item.kind}
              data-event-tick={item.tick}
            >
              <span className="mono">
                TICK {item.tick} / {item.kind}
              </span>
              <h4>{item.title}</h4>
              <p>{item.detail}</p>
            </li>
          ))}
        </ol>
      </details>
    </details>
  );
}
