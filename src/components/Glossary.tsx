import { useId, useState } from "react";

const definitions = [
  {
    term: "Block",
    definition: "A group of transactions recorded together on a blockchain.",
  },
  {
    term: "Validator",
    definition:
      "A network participant that checks transactions and helps produce and confirm blocks.",
  },
  {
    term: "Signal age",
    definition:
      "How long ago the event you observed happened. An older signal may describe a market that has already changed.",
  },
  {
    term: "Inclusion",
    definition:
      "A transaction being placed in a block. Inclusion alone does not guarantee successful execution, finality, or profit.",
  },
  {
    term: "Net result",
    definition:
      "What remains after gains, losses, and costs. The missions model it in invented integer credits. It is separate from your learning score and is not real trading profit.",
  },
];

function Term({ term, definition }: { term: string; definition: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={`glossary-term ${open ? "is-open" : ""}`}>
      <button
        type="button"
        aria-label={`Explain ${term.toLowerCase()}`}
        aria-expanded={open}
        aria-controls={id}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            event.stopPropagation();
          }
        }}
      >
        {term}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <p id={id} role="tooltip" hidden={!open}>
        {definition}
      </p>
    </div>
  );
}
export function Glossary() {
  return (
    <section className="glossary" aria-label="Quick definitions">
      <div className="glossary-heading">
        <h2>A few words, unpacked.</h2>
        <p>
          Select a term for a short explanation. No crypto vocabulary required.
        </p>
      </div>
      <div className="glossary-terms">
        {definitions.map((definition) => (
          <Term key={definition.term} {...definition} />
        ))}
      </div>
    </section>
  );
}
