import { useEffect, useState } from "react";
import { Chevron } from "./Icons";

/** A longer paragraph behind a small toggle, so the page stays skimmable. */
export function ReadMore({ text, label = "Read more", resetKey }: { text: string; label?: string; resetKey?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [resetKey]);
  return (
    <div className={`read-more ${open ? "is-open" : ""}`}>
      {open ? <p className="read-more-text">{text}</p> : null}
      <button type="button" className="read-more-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "Show less" : label}
        <Chevron dir="down" size={14} />
      </button>
    </div>
  );
}
