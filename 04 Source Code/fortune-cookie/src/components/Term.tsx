import { useId, useRef, type ReactNode } from "react";

/**
 * A word with a short definition that pops up on hover, focus, or tap.
 * CSS does the showing, so it works the same with a mouse, a keyboard, or a finger.
 * Before it shows, the pop-up is nudged sideways so it stays on screen.
 */
export function Term({ tip, children, wide }: { tip: string; children: ReactNode; wide?: boolean }) {
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  if (!tip) return <>{children}</>;

  const fit = () => {
    const el = ref.current;
    if (!el) return;
    el.style.marginLeft = "0px";
    const r = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const nudge = r.left < 8 ? 8 - r.left : r.right > vw - 8 ? vw - 8 - r.right : 0;
    el.style.marginLeft = `${nudge}px`;
  };

  return (
    <span className="term" onPointerEnter={fit} onFocus={fit}>
      <button type="button" className="term-word" aria-describedby={id}>
        {children}
      </button>
      <span ref={ref} role="tooltip" id={id} className={`term-tip ${wide ? "is-wide" : ""}`}>
        {tip}
      </span>
    </span>
  );
}
