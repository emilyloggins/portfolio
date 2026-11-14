"use client";

import { useEffect, useRef, useState } from "react";
import localFont from "next/font/local";
import { motion, useReducedMotion } from "motion/react";

/**
 * Easy Care's side navigation, assembling itself: the product name and clinic
 * stay put while each section drops in, bounces and settles. It holds for a
 * couple of beats, then everything falls away and it starts again. Same
 * on-page container as the sign dialog (white, hairline border, no shadow);
 * fixed size, so the page never shifts.
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
  border: "#E4E4E7",
  tint: "#F4F2FB",
};

const ITEMS = [
  "Enroll a pet",
  "Plan activity",
  "Service history",
  "Prescriptions",
  "Commissions",
  "Orders",
  "Plan settings",
  "Reports",
  "Doctors",
];
const ROW = 36; // px per nav row

type Phase = "in" | "hold" | "out" | "gap";
/** How long each phase lasts before the next begins. */
const PHASE_MS: Record<Phase, number> = { in: 1400, hold: 2200, out: 950, gap: 350 };
const NEXT: Record<Phase, Phase> = { in: "hold", hold: "out", out: "gap", gap: "in" };

const DROP = { type: "spring", stiffness: 430, damping: 17, mass: 0.9 } as const;
const FALL = [0.55, 0, 0.9, 0.4] as const; // gravity: slow start, fast finish
const SOFT = [0.16, 1, 0.3, 1] as const;

export function Nav() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("in");
  const [cycle, setCycle] = useState(0);
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
    const t = window.setTimeout(() => {
      const next = NEXT[phase];
      if (next === "in") setCycle((c) => c + 1); // remount so items start above again
      setPhase(next);
    }, PHASE_MS[phase]);
    return () => window.clearTimeout(t);
  }, [phase, running]);

  const shown = reduce ? "hold" : phase;
  const last = ITEMS.length - 1;

  return (
    <figure className="my-2">
      <div
        ref={stageRef}
        className={`${ecSans.className} mx-auto flex h-[27rem] w-full max-w-[30rem] justify-center overflow-hidden rounded-[24px] bg-white`}
        style={{ color: C.ink, boxShadow: `inset 0 0 0 1px ${C.border}` }}
        aria-hidden="true"
      >
        <div className="w-[13rem] pt-9">
          <div className="px-3 pb-5">
            <p className="text-[17px] leading-5 font-medium tracking-[-0.01em]">Easy Care</p>
            <p className="mt-1 text-[12.5px] leading-4" style={{ color: C.muted }}>
              K9 Resort Clinic Spa
            </p>
          </div>

          <div className="relative">
            {/* Selected state lands once the list has settled */}
            <motion.span
              className="absolute inset-x-0 top-0 rounded-full"
              style={{ height: ROW, background: C.tint, boxShadow: `inset 0 0 0 1px ${C.accent}55` }}
              initial={false}
              animate={
                shown === "hold"
                  ? { opacity: 1, scale: 1, transition: { duration: 0.5, ease: SOFT, delay: reduce ? 0 : 0.15 } }
                  : { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }
              }
            />
            <ul key={cycle} className="relative">
              {ITEMS.map((label, i) => (
                <motion.li
                  key={label}
                  className="flex items-center px-3 text-[14.5px]"
                  style={{ height: ROW, color: i === 0 ? C.ink : C.muted, transformOrigin: "50% 0%" }}
                  initial={reduce ? false : { y: -34, opacity: 0, filter: "blur(6px)" }}
                  animate={
                    shown === "out" || shown === "gap"
                      ? {
                          y: 140 + (last - i) * 6,
                          opacity: 0,
                          rotate: i % 2 ? 2.5 : -2,
                          filter: "blur(3px)",
                          transition: {
                            duration: 0.6,
                            ease: FALL,
                            delay: (last - i) * 0.035, // bottom lets go first
                            opacity: { duration: 0.35, ease: "easeIn", delay: (last - i) * 0.035 + 0.25 },
                          },
                        }
                      : {
                          y: 0,
                          opacity: 1,
                          rotate: 0,
                          filter: "blur(0px)",
                          transition: {
                            y: { ...DROP, delay: i * 0.055 },
                            opacity: { duration: 0.25, ease: "easeOut", delay: i * 0.055 },
                            filter: { duration: 0.35, ease: SOFT, delay: i * 0.055 },
                          },
                        }
                  }
                >
                  {label}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <p className="sr-only">
        Easy Care&rsquo;s side navigation: Enroll a pet, Plan activity, Service history, Prescriptions, Commissions,
        Orders, Plan settings, Reports and Doctors.
      </p>
    </figure>
  );
}
