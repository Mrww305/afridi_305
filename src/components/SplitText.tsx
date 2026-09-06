import { createElement, useMemo, type ElementType } from "react";
import { useReveal } from "./hooks";

/**
 * SplitText — crawlable string-splitter utility.
 * Wraps every character in a <span class="st-char"> so CSS can stagger
 * scale / opacity / a 12px -> 0px Gaussian blur sweep with an elastic ease.
 * The original string stays in the DOM order (screen-reader friendly via
 * aria-label on the container).
 */
interface SplitTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  /** ms delay before the stagger starts */
  delay?: number;
  /** ms added per character */
  stagger?: number;
}

export function SplitText({
  text,
  as = "span",
  className = "",
  delay = 0,
  stagger = 26,
}: SplitTextProps) {
  const ref = useReveal<HTMLElement>(0.2);

  const words = useMemo(() => text.split(" "), [text]);

  let charIndex = 0;
  const content = words.map((word, wi) => (
    <span
      key={wi}
      className="inline-block whitespace-nowrap"
      aria-hidden="true"
    >
      {Array.from(word).map((ch, ci) => {
        const d = delay + charIndex++ * stagger;
        return (
          <span
            key={ci}
            className="st-char"
            style={{ ["--d" as string]: `${d}ms` }}
          >
            {ch}
          </span>
        );
      })}
      {wi < words.length - 1 ? "\u00A0" : ""}
    </span>
  ));

  return createElement(
    as,
    { ref, className, "aria-label": text, role: "text" as string },
    content
  );
}
