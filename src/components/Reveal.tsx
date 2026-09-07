import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Tag = "div" | "section" | "header";

interface RevealProps {
  as?: Tag;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Stagger the entrance so a row of cards doesn't all pop at once. */
  delayMs?: number;
}

/**
 * Fades and lifts its content in the first time it scrolls into view. Falls
 * back to always-visible when IntersectionObserver isn't available (older
 * browsers, and jsdom in tests) — content is never hidden from anyone who
 * can't run the animation, and `prefers-reduced-motion` (index.css) skips
 * the transition entirely.
 */
export function Reveal({ as = "div", children, delayMs = 0, className = "", style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Element = as;
  return (
    <Element
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delayMs}ms`, ...style }}
    >
      {children}
    </Element>
  );
}
