"use client";

import { useEffect, useRef, useState } from "react";
import localFont from "next/font/local";
import { motion, useReducedMotion } from "motion/react";

/**
 * Easy Care's side navigation, assembling itself as you reach it: the product
 * name and clinic stay put while each section drops in, bounces and settles.
 * Scroll on past and the sections fall away; come back and they drop in
 * again. Same on-page container as the sign dialog (white, hairline border,
 * no shadow); fixed size, so the page never shifts.
 */
const ecSans = localFont({
  src: "../../../app/fonts/instrument-sans-latin-wght-normal.woff2",
  weight: "400 700",
  display: "swap",
});

const C = {
  ink: "#16131F",
  muted: "#85809C",
  border: "#E4E4E7",
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

const DROP = { type: "spring", stiffness: 430, damping: 17, mass: 0.9 } as const;
const FALL = [0.55, 0, 0.9, 0.4] as const; // gravity: slow start, fast finish
const SOFT = [0.16, 1, 0.3, 1] as const;

export function Nav() {
  const reduce = useReducedMotion();
  /** waiting: above, before the first drop. in: dropped and settled. out: fallen. */
  const [state, setState] = useState<"waiting" | "in" | "out">("waiting");
  const [cycle, setCycle] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    // Track where the nav's middle sits on screen. It drops in once it reaches
    // the middle band, and falls while still in sight as you scroll past (or
    // back above) it. The gap between the two bands keeps it from flickering.
    let raf = 0;
    const check = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const mid = (r.top + r.height / 2) / vh;
      if (mid > 0.38 && mid < 0.8) {
        setState((s) => {
          if (s !== "in") setCycle((c) => c + 1); // remount so items start above again
          return "in";
        });
      } else if (mid < 0.3 || mid > 0.95) {
        setState((s) => (s === "in" ? "out" : s));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const shown = reduce ? "in" : state;
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/work/easy-care/easy-care-logo.png" alt="Easy Care" width={290} height={50} className="block h-[22px] w-auto" />
            <p className="mt-2 text-[12.5px] leading-4" style={{ color: C.muted }}>
              K9 Resort Clinic Spa
            </p>
          </div>

          <div className="relative">
            <ul key={cycle} className="relative">
              {ITEMS.map((label, i) => (
                <motion.li
                  key={label}
                  className="flex items-center px-3 text-[14.5px]"
                  style={{ height: ROW, color: C.muted, transformOrigin: "50% 0%" }}
                  initial={reduce ? false : { y: -34, opacity: 0, filter: "blur(6px)" }}
                  animate={
                    shown === "waiting"
                      ? { y: -34, opacity: 0, filter: "blur(6px)", transition: { duration: 0 } }
                      : shown === "out"
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
