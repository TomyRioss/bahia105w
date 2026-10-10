"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const INTRO_SEEN_KEY = "bahia-105w-intro-seen";

export function IntroOverlay() {
  const [visible, setVisible] = useState(true);
  const [started, setStarted] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    let seen = false;

    try {
      seen = Boolean(window.localStorage.getItem(INTRO_SEEN_KEY));

      if (seen && !initialized.current) {
        const timeout = window.setTimeout(() => setVisible(false), 0);
        return () => window.clearTimeout(timeout);
      }

      initialized.current = true;
      if (!seen) {
        window.localStorage.setItem(INTRO_SEEN_KEY, "true");
      }
    } catch {
      // Continue without persistence if browser storage is unavailable.
      initialized.current = true;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startTimeout = window.setTimeout(() => setStarted(true), 0);
    const timeout = window.setTimeout(() => setVisible(false), reducedMotion ? 80 : 3200);

    return () => {
      window.clearTimeout(startTimeout);
      window.clearTimeout(timeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`site-intro${started ? " site-intro--active" : ""}`} aria-hidden="true">
      <Image
        src="/logo.png"
        alt=""
        width={640}
        height={640}
        priority
        className="site-intro__logo"
      />
    </div>
  );
}
