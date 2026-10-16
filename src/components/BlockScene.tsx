export function BlockScene({
  compact = false,
  phase = 0,
}: {
  compact?: boolean;
  phase?: number;
}) {
  return (
    <div className={`block-scene ${compact ? "compact" : ""}`}>
      <div className="scene-header">
        <span>
          <i className="status-dot" /> SIMULATION ENVIRONMENT
        </span>
        <span>VOL. 001</span>
      </div>
      <svg
        className="block-art"
        viewBox="0 0 600 410"
        role="img"
        aria-label="An illustrative block receiving signals through a connected network"
      >
        <defs>
          <pattern
            id="grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.8" fill="#7f9468" opacity=".35" />
          </pattern>
          <pattern
            id="hatch"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 8L8 0"
              stroke="#b7ce8f"
              strokeWidth=".65"
              opacity=".25"
            />
          </pattern>
          <linearGradient id="blockFill" x2="0" y2="1">
            <stop stopColor="#385126" />
            <stop offset="1" stopColor="#14260b" />
          </linearGradient>
        </defs>
        <rect width="600" height="410" fill="url(#grid)" />
        <g
          className="network-lines"
          fill="none"
          stroke="#758c5d"
          strokeWidth="1"
        >
          <path d="M0 90h112l73 71h84 M0 310h105l75-62h70 M600 90H490l-74 71h-85 M600 310H495l-75-62h-80" />
          <path
            d="M300 0v70 M300 330v80 M40 200h130 M430 200h130"
            strokeDasharray="3 6"
          />
          <path d="M50 45h100M450 365h100" />
        </g>
        <g fill="#c3da9a">
          <circle className="signal signal-a" cx="112" cy="90" r="4" />
          <circle className="signal signal-b" cx="490" cy="90" r="4" />
          <circle className="signal signal-c" cx="105" cy="310" r="4" />
        </g>
        <g className="cube">
          <path
            d="M300 83l128 74v148l-128 74-128-74V157z"
            fill="url(#blockFill)"
            stroke="#b8d28e"
            strokeWidth="1.5"
          />
          <path
            d="M300 83l128 74-128 74-128-74z"
            fill="url(#hatch)"
            stroke="#b8d28e"
          />
          <path
            d="M172 157l128 74 128-74 M300 231v148"
            fill="none"
            stroke="#b8d28e"
          />
          <path
            d="M204 139l128 74v147 M236 120l128 74v147 M268 102l128 74v147 M204 175v148 M236 194v148 M268 212v148"
            fill="none"
            stroke="#91ad6e"
            opacity=".3"
          />
          <path
            d="M172 194l128 74 128-74 M172 231l128 74 128-74 M172 268l128 74 128-74"
            fill="none"
            stroke="#91ad6e"
            opacity=".3"
          />
          <path
            className="block-highlight"
            d="M300 231l32-18v37l-32 18z"
            fill="#c1e58f"
            opacity=".9"
          />
        </g>
        <g
          fill="#c6d2b7"
          fontFamily="monospace"
          fontSize="10"
          letterSpacing="1.5"
        >
          <text x="47" y="75">
            EXECUTED TX
          </text>
          <text x="450" y="342">
            NEXT BLOCK
          </text>
          <text x="285" y="52">
            01
          </text>
        </g>
        <g stroke="#a7c17f" fill="#17290c">
          <rect x="35" y="190" width="20" height="20" />
          <rect x="545" y="190" width="20" height="20" />
          <path d="M42 200h6m-3-3v6 M552 200h6m-3-3v6" />
        </g>
      </svg>
      <div className="scene-bottom">
        <span>OBSERVE. DECIDE. ARRIVE.</span>
        <span className="scene-coordinate">
          {["01 / SEE", "02 / ACT", "03 / LAND"][phase]}
        </span>
      </div>
      {!compact && (
        <div className="scene-stages">
          {["SEE", "ACT", "LAND"].map((label, index) => (
            <span key={label}>
              <i className={index === phase ? "active" : ""} />
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
