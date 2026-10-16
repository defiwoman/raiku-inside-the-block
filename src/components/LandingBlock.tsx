import { useId, useState } from "react";

/** An invented executed-event illustration, never a live or pending feed. */
export function LandingBlock() {
  const id = useId().replaceAll(":", "");
  const [paused, setPaused] = useState(false);
  return (
    <figure className={`landing-block ${paused ? "is-paused" : ""}`}>
      <div className="landing-block-header">
        <span>
          <i className="status-dot" /> ILLUSTRATION · NOT A LIVE FEED
        </span>
        <span>FIG. 01</span>
      </div>
      <svg
        className="landing-block-art"
        viewBox="0 0 600 440"
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
      >
        <title id={`${id}-title`}>
          An executed event, then your observation
        </title>
        <desc id={`${id}-description`}>
          A block contains nine numbered transaction tiles. Transaction 07 is
          marked as executed at tick 0. Its observation reaches you 120
          illustrative ticks later. No pending transactions are shown.
        </desc>
        <defs>
          <pattern
            id={`${id}-dots`}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r=".7" fill="currentColor" opacity=".24" />
          </pattern>
          <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#314921" />
            <stop offset="1" stopColor="#17290d" />
          </linearGradient>
        </defs>
        <rect width="600" height="440" fill={`url(#${id}-dots)`} />
        <g fill="none" stroke="currentColor" opacity=".2">
          <path d="M30 130h100m-50-50v100 M470 320h100m-50-50v100" />
          <ellipse cx="300" cy="292" rx="230" ry="95" strokeDasharray="2 7" />
        </g>
        <path
          d="M300 96L484 202v88L300 396 116 290v-88z"
          fill={`url(#${id}-side)`}
          stroke="#a7c17f"
        />
        <path
          d="M116 202l184 106 184-106 M300 308v88 M116 230l184 106 184-106 M116 260l184 106 184-106"
          fill="none"
          stroke="#a7c17f"
          opacity=".5"
        />
        <g transform="matrix(.866 .5 -.866 .5 300 96)" stroke="#a7c17f">
          <rect width="212" height="212" fill="#1d3311" />
          {Array.from({ length: 9 }, (_, index) => {
            const x = (index % 3) * 66 + 9;
            const y = Math.floor(index / 3) * 66 + 9;
            return (
              <g
                key={index}
                className={index === 6 ? "executed-tile" : undefined}
              >
                <rect
                  x={x}
                  y={y}
                  width="62"
                  height="62"
                  fill={index === 6 ? "#c5e69c" : "#2c451c"}
                />
                <text
                  x={x + 31}
                  y={y + 38}
                  textAnchor="middle"
                  fill={index === 6 ? "#0f1d06" : "#d8e7c1"}
                  stroke="none"
                  fontFamily="monospace"
                  fontSize="20"
                >
                  0{index + 1}
                </text>
              </g>
            );
          })}
        </g>
        <path
          d="M134 202H65v-45 M302 329v79h174"
          fill="none"
          stroke="#c5e69c"
          strokeWidth="1.5"
          strokeDasharray="3 5"
        />
        <circle
          className="illustration-pulse"
          cx="134"
          cy="202"
          r="5"
          fill="#c5e69c"
        />
        <g transform="translate(490 408)" fill="none" stroke="#c5e69c">
          <circle r="15" />
          <circle className="illustration-pulse" r="7" />
          <path d="M-21 0h8m26 0h8M0-21v8m0 26v8" />
        </g>
        <g
          fill="#d8e7c1"
          fontFamily="monospace"
          fontSize="11"
          letterSpacing="1"
        >
          <text x="35" y="112">
            TX #07 / EXECUTED
          </text>
          <text x="35" y="133" opacity=".7">
            EVENT AT TICK 0
          </text>
          <text x="363" y="350">
            YOUR OBSERVATION
          </text>
          <text x="363" y="371" opacity=".7">
            ARRIVES +120 TICKS
          </text>
        </g>
      </svg>
      <figcaption className="landing-block-caption">
        <span>
          <b>01 / EXECUTED EVENT</b>
          <strong>TX #07 · tick 0</strong>
        </span>
        <span aria-hidden="true">→</span>
        <span>
          <b>02 / YOUR OBSERVATION</b>
          <strong>Arrives +120 ticks</strong>
        </span>
      </figcaption>
      <div className="landing-block-footer">
        <span>INVENTED TIMING. REAL CURIOSITY.</span>
        <button
          className="motion-control"
          type="button"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
        >
          {paused ? "Resume illustration" : "Pause illustration"}
          <span
            className={`playback-icon ${paused ? "play" : "pause"}`}
            aria-hidden="true"
          />
        </button>
        <span className="motion-status">Reduced motion is on</span>
      </div>
    </figure>
  );
}
