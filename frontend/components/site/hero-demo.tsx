"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type FormEvent, type ReactNode } from "react";
import s from "./hero.module.css";

/** Demo pacing in ms. One scene ≈ 9.5s: erase → type → research → deal → hold. */
const PACE = { firstHold: 5200, hold: 4800, out: 380, erase: 11, beforeType: 280, type: 30, jitter: 36, beforeResearch: 420, research: 1150 };

type Phase = "typing" | "researching" | "dealt" | "out";

/**
 * The hero's brief bar plus the scene controller. The bar is a real GET form
 * to /app (works without JS). With JS, an example brief types itself, the
 * matching lead cards (server-rendered `children`) deal in, and Enter on an
 * empty bar runs the example on screen. The loop pauses off-screen, in
 * background tabs and while the visitor is typing, and never runs under
 * reduced motion. It only writes data attributes; CSS does all the animation.
 */
export function HeroDemo({ briefs, children }: { briefs: string[]; children: ReactNode }) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sceneRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    const typed = typedRef.current;
    const input = inputRef.current;
    if (!root || !typed || !input || briefs.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scenes = root.querySelectorAll<HTMLElement>("[data-scene-id]");
    let pending: () => void = leave;
    let timer: number | undefined;
    let visible = true;
    let first = true;

    const setPhase = (phase: Phase) => {
      root.dataset.phase = phase;
    };
    const engaged = () => document.activeElement === input || input.value.length > 0;
    const canRun = () => visible && !document.hidden && !engaged();
    const fire = () => {
      timer = undefined;
      pending();
    };
    const schedule = (ms: number, next: () => void) => {
      pending = next;
      if (canRun()) timer = window.setTimeout(fire, ms);
    };
    const pause = () => {
      window.clearTimeout(timer);
      timer = undefined;
    };
    const resume = () => {
      if (timer === undefined && canRun()) timer = window.setTimeout(fire, 700);
    };

    function leave() {
      if (first) {
        first = false;
        delete root!.dataset.intro;
      }
      setPhase("out");
      schedule(PACE.out, erase);
    }
    function erase() {
      const text = typed!.textContent ?? "";
      if (text.length) {
        typed!.textContent = text.slice(0, -1);
        return schedule(PACE.erase, erase);
      }
      sceneRef.current = (sceneRef.current + 1) % briefs.length;
      scenes.forEach((el, i) => el.toggleAttribute("data-active", i === sceneRef.current));
      setPhase("typing");
      schedule(PACE.beforeType, type);
    }
    function type() {
      const brief = briefs[sceneRef.current];
      const length = typed!.textContent?.length ?? 0;
      if (length < brief.length) {
        typed!.textContent = brief.slice(0, length + 1);
        return schedule(PACE.type + Math.random() * PACE.jitter, type);
      }
      schedule(PACE.beforeResearch, research);
    }
    function research() {
      setPhase("researching");
      schedule(PACE.research, deal);
    }
    function deal() {
      setPhase("dealt");
      schedule(PACE.hold, leave);
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) resume();
      else pause();
    });
    io.observe(root);
    const onVisibility = () => (document.hidden ? pause() : resume());
    const onBlur = () => resume();
    document.addEventListener("visibilitychange", onVisibility);
    input.addEventListener("focus", pause);
    input.addEventListener("blur", onBlur);
    schedule(PACE.firstHold, leave);

    return () => {
      pause();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      input.removeEventListener("focus", pause);
      input.removeEventListener("blur", onBlur);
    };
  }, [briefs]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const brief = inputRef.current?.value.trim() || briefs[sceneRef.current];
    router.push(`/app?brief=${encodeURIComponent(brief)}`);
  };

  return (
    <div ref={rootRef} className={s.demo} data-phase="dealt" data-intro="">
      <form action="/app" method="get" role="search" aria-label="Start a search" onSubmit={onSubmit} className={s.bar} data-loop>
        <div className={s.barInner}>
          <svg aria-hidden viewBox="0 0 24 24" className={s.spark}>
            <path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5Z" />
            <path d="M19 15.5c.25 1.9 1.1 2.75 3 3-1.9.25-2.75 1.1-3 3-.25-1.9-1.1-2.75-3-3 1.9-.25 2.75-1.1 3-3Z" />
          </svg>
          <div className={s.field}>
            <label htmlFor="hero-brief" className="sr-only">
              Describe who you want to find
            </label>
            <input
              ref={inputRef}
              id="hero-brief"
              name="brief"
              type="text"
              placeholder=" "
              autoComplete="off"
              enterKeyHint="go"
              maxLength={300}
              className={s.input}
            />
            <span aria-hidden className={s.ghost}>
              <span ref={typedRef}>{briefs[0]}</span>
              <span className={s.caret} />
            </span>
          </div>
          <button type="submit" className={s.go}>
            Find leads
            <span aria-hidden className={s.kbd}>
              <svg viewBox="0 0 16 16">
                <path d="M12.5 3.5V8a2 2 0 0 1-2 2H3.5M6.5 7 3.5 10l3 3" />
              </svg>
            </span>
          </button>
        </div>
      </form>

      <p aria-hidden className={s.status}>
        <span className={s.sTyping}>
          Type your own, or press <kbd className={s.kbdInline}>↵</kbd> to run it
        </span>
        <span className={s.sResearch}>
          <span className="live-dot" />6 agents are reading the open web…
        </span>
        <span className={s.sDone}>
          <svg viewBox="0 0 16 16" className={s.tick}>
            <path d="m3.5 8.5 3 3 6-7" />
          </svg>
          3 qualified · a quote behind every score
        </span>
      </p>

      <div aria-hidden className={s.results}>
        {children}
      </div>
      <p className="sr-only">
        Example results: each company gets a fit score out of 100, the quote from its own website that supports it, and
        a contact with an honest email label.
      </p>
    </div>
  );
}
