"use client";

import { useEffect, useRef, useState } from "react";
import localFont from "next/font/local";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * The sign dialog, playing itself: the doctor's name is typed into the
 * signature line, Sign NexGard becomes available, is pressed, processes and
 * confirms. After a beat the name erases and it runs again, for as long as
 * it is on screen. Styled in the Easy Care direction (Instrument Sans,
 * two-tone title, light grey surfaces, pill buttons) to match the tablet
 * hero. Nothing in the dialog changes size, so the page never shifts.
 */
const ecSans = localFont({
  src: "../../../app/fonts/instrument-sans-latin-wght-normal.woff2",
  weight: "400 700",
  display: "swap",
});

const C = {
  ink: "#16131F",
  muted: "#85809C",
  accent: "#9387D0",
  primary: "#211359",
  edge: "#EEEEF0",
  mid: "#F3F3F5",
  border: "#E4E4E7",
  line: "#D9D9DE",
  disabledBg: "#E6E6EA",
  disabledInk: "#A1A1AA",
};

const NAME = "Maron Williams";
/** Letters typed before Sign becomes available. */
const MIN_CHARS = 3;
const EASE = [0.16, 1, 0.3, 1] as const;
const SOFT = { type: "spring", stiffness: 170, damping: 26 } as const;

type Phase = "idle" | "typing" | "ready" | "processing" | "signed" | "erasing";

/** A human cadence: a little uneven, slower after the space. */
const keyDelay = (i: number) => (NAME[i - 1] === " " ? 160 : 62 + ((i * 37) % 5) * 11);

export function Sign() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduce ? "signed" : "idle");
  const [n, setN] = useState(reduce ? NAME.length : 0);
  const stageRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const running = !reduce && inView && tabVisible;
  useEffect(() => {
    if (!running) return;
    let wait = 0;
    let next: () => void = () => {};
    if (phase === "idle") {
      wait = 1100;
      next = () => setPhase("typing");
    } else if (phase === "typing") {
      if (n < NAME.length) {
        wait = keyDelay(n + 1);
        next = () => setN(n + 1);
      } else {
        wait = 250;
        next = () => setPhase("ready");
      }
    } else if (phase === "ready") {
      wait = 900;
      next = () => setPhase("processing");
    } else if (phase === "processing") {
      wait = 1100;
      next = () => setPhase("signed");
    } else if (phase === "signed") {
      wait = 2800;
      next = () => setPhase("erasing");
    } else if (phase === "erasing") {
      if (n > 0) {
        wait = 26;
        next = () => setN(n - 1);
      } else {
        wait = 200;
        next = () => setPhase("idle");
      }
    }
    const t = window.setTimeout(next, wait);
    return () => window.clearTimeout(t);
  }, [phase, n, running]);

  // The button becomes available as soon as a few letters are in, like the product.
  const enabled = phase === "processing" || phase === "signed" || n >= MIN_CHARS;
  const processing = phase === "processing";
  const signed = phase === "signed";
  const caret = phase === "idle" || phase === "typing" || phase === "ready" || phase === "erasing";

  return (
    <figure className="my-2">
      <div
        ref={stageRef}
        className={`${ecSans.className} mx-auto w-full max-w-[30rem] py-4`}
        style={{ color: C.ink }}
        aria-hidden="true"
      >
        {/* Same on-page container as the enrollment cart: soft grey, hairline border, no shadow. */}
        <div
          className="w-full rounded-[24px] px-7 pt-8 pb-7"
          style={{
            background: `linear-gradient(180deg, ${C.edge} 0%, ${C.mid} 40%, ${C.mid} 85%, ${C.edge} 100%)`,
            boxShadow: `inset 0 0 0 1px ${C.border}`,
          }}
        >
          {/* Title */}
          <div className="flex items-center gap-3.5">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-full"
              style={{ background: "#FFFFFF", boxShadow: `inset 0 0 0 1px ${C.border}` }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 20h9" stroke={C.primary} strokeWidth="1.75" strokeLinecap="round" />
                <path
                  d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"
                  stroke={C.primary}
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="text-[28px] leading-[34px] tracking-[-0.015em]">
              Sign <span style={{ color: C.accent }}>NexGard</span>
            </p>
          </div>

          {/* Prescription */}
          <dl
            className="mt-6 grid grid-cols-[6rem_1fr] gap-x-4 gap-y-3 rounded-[18px] px-5 py-4 text-[14px] leading-5"
            style={{ background: "#FFFFFF", boxShadow: `inset 0 0 0 1px ${C.border}` }}
          >
            {[
              ["Drug", "NexGard (afoxolaner) soft chewable"],
              ["Strength", "28.3 mg, for dogs 10.1 to 24.0 lbs"],
              ["Route", "Oral"],
              ["Quantity", "12 chewables"],
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt style={{ color: C.muted }}>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          {/* Signature */}
          <p className="mt-6 text-[14px] leading-5">Type your full name to sign</p>
          <div className="relative mt-2 flex h-12 items-end pb-2">
            <span className="text-[24px] leading-8 tracking-[-0.01em]">{NAME.slice(0, n)}</span>
            {caret ? (
              <motion.span
                className="ml-[2px] mb-1 inline-block h-6 w-[1.5px] rounded-full"
                style={{ background: C.primary }}
                animate={{ opacity: phase === "typing" || phase === "erasing" ? 1 : [1, 1, 0, 0] }}
                transition={
                  phase === "typing" || phase === "erasing"
                    ? { duration: 0 }
                    : { duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }
                }
              />
            ) : null}
            <span className="absolute inset-x-0 bottom-0 h-px" style={{ background: C.line }} />
            <motion.span
              className="absolute inset-x-0 bottom-0 h-[1.5px] origin-left"
              style={{ background: C.accent }}
              initial={false}
              animate={{ scaleX: signed ? 1 : 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            />
          </div>
          <p className="mt-2.5 text-[12.5px] leading-[18px] text-balance" style={{ color: C.muted }}>
            Typing your name is your legal signature on this prescription. It will be sent to MWI.
          </p>

          {/* Actions */}
          <div className="mt-7 flex items-center justify-end gap-2">
            <span className="px-5 text-[15px] leading-5">Cancel</span>
            <motion.div
              className="flex h-12 w-[11.5rem] items-center justify-center rounded-full text-[15px] font-medium"
              initial={false}
              animate={{
                backgroundColor: signed ? C.accent : enabled ? C.primary : C.disabledBg,
                color: enabled ? "#ffffff" : C.disabledInk,
                scale: processing ? [1, 0.96, 1] : 1,
                boxShadow: signed
                  ? [`0 0 0 0px ${C.accent}66`, `0 0 0 10px ${C.accent}00`]
                  : `0 0 0 0px ${C.accent}00`,
              }}
              transition={{
                backgroundColor: { duration: 0.45, ease: EASE },
                color: { duration: 0.45, ease: EASE },
                scale: { duration: 0.3, ease: EASE },
                boxShadow: { duration: 0.9, ease: "easeOut" },
              }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={signed ? "signed" : processing ? "processing" : "sign"}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
                  transition={{ ...SOFT, opacity: { duration: 0.3 }, filter: { duration: 0.3 } }}
                >
                  {signed ? (
                    <>
                      <DrawnCheck /> Signed
                    </>
                  ) : processing ? (
                    <Spinner />
                  ) : (
                    "Sign NexGard"
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
      <p className="sr-only">
        A doctor types Maron Williams into the signature line of the NexGard prescription, presses Sign NexGard,
        and the prescription is signed.
      </p>
    </figure>
  );
}

function DrawnCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <motion.path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.42, ease: EASE, delay: 0.08 }}
      />
    </svg>
  );
}

function Spinner() {
  return (
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Signing"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </motion.svg>
  );
}
