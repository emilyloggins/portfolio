"use client";

import { useEffect, useRef, useState } from "react";
import localFont from "next/font/local";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Enrollment, playing itself. A Plan / Products / Add-ons / Pay stepper
 * narrates a cart: each step lights up, its section appears with a
 * placeholder row as if the system is looking it up, then the real item
 * lands and the total rolls to its new value like an odometer. Pay presses,
 * processes, and succeeds; the cart fades and the loop starts over.
 *
 * Styled in the Nov 11 Easy Care direction (Hers-inspired): Instrument Sans,
 * two-tone title, a light grey surface with a hairline border, no dividers,
 * a pill for the money action. Motion is springs for anything that moves,
 * tweens only for colour and opacity. The stage is a fixed height so the
 * page never shifts; the card grows inside it on a spring.
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
  track: "#E7E7EA",
  skeleton: "#E6E6EA",
};

type Kind = "plan" | "product" | "addon";
type Item = { id: string; kind: Kind; name: string; sub?: string; price?: number };

const ITEMS: Item[] = [
  { id: "plan", kind: "plan", name: "Small Dog Plan v1", sub: "9 services, billed monthly", price: 54 },
  { id: "heartgard", kind: "product", name: "Heartgard Plus", sub: "Heartworm, 6 to 25 lbs" },
  { id: "nexgard", kind: "product", name: "NexGard", sub: "28.3 mg, 10.1 to 24.0 lbs" },
  { id: "nails", kind: "addon", name: "Nail trim, 3", price: 12 },
];
const KINDS: Kind[] = ["plan", "product", "addon"];
const LABEL: Record<Kind, string> = { plan: "Plan", product: "Products", addon: "Add-ons" };

/**
 * Phases: 0 idle, 1 Plan active, 2 plan lands, 3 Products active,
 * 4 Heartgard, 5 NexGard, 6 Add-ons active, 7 nail trim, 8 Pay active with
 * the pay pill, 9 pressed and processing, 10 paid, 11 the cart fades out.
 */
const PHASE_MS = [900, 900, 1300, 800, 1000, 1300, 800, 1300, 1300, 1500, 3600, 600];
const ITEM_AT = [2, 4, 5, 7]; // phase at which each item in ITEMS lands
const STEP_ON = { plan: 1, product: 3, addon: 6, pay: 8 } as const;
const PROCESSING = 9;
const PAID = 10;
const CLEAR = 11;
const LAST = PHASE_MS.length - 1;

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } as const;
const SOFT = { type: "spring", stiffness: 170, damping: 26 } as const;
const span = (from: number, to: number) => PHASE_MS.slice(from, to).reduce((a, b) => a + b, 0);

type StepState = "upcoming" | "active" | "done";

export function Cart() {
  const reduce = useReducedMotion();
  const [p, setP] = useState(reduce ? PAID : 0);
  const [loop, setLoop] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  // Runs whenever it is on screen and the tab is visible.
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
      if (p >= LAST) setLoop((l) => l + 1);
      setP((v) => (v >= LAST ? 0 : v + 1));
    }, PHASE_MS[p]);
    return () => window.clearTimeout(t);
  }, [p, running]);

  const stateOf = (on: number, next: number): StepState => (p < on ? "upcoming" : p < next ? "active" : "done");
  const steps = [
    { label: "Plan", state: stateOf(STEP_ON.plan, STEP_ON.product), ms: span(STEP_ON.plan, STEP_ON.product) },
    { label: "Products", state: stateOf(STEP_ON.product, STEP_ON.addon), ms: span(STEP_ON.product, STEP_ON.addon) },
    { label: "Add-ons", state: stateOf(STEP_ON.addon, STEP_ON.pay), ms: span(STEP_ON.addon, STEP_ON.pay) },
    { label: "Pay", state: stateOf(STEP_ON.pay, PAID), ms: span(STEP_ON.pay, PAID) },
  ];
  const kindState: Record<Kind, StepState> = { plan: steps[0].state, product: steps[1].state, addon: steps[2].state };

  const shown = ITEMS.filter((_, i) => p >= ITEM_AT[i]);
  const total = shown.reduce((s, it) => s + (it.price ?? 0), 0);
  const payVisible = p >= STEP_ON.pay;
  const processing = p === PROCESSING;
  const paid = p >= PAID;
  const clearing = p === CLEAR;

  // Each section appears when its step starts, with a placeholder row until
  // its first item lands.
  const rows: Array<{ key: string; type: "label" | "item" | "skeleton"; text?: string; item?: Item }> = [];
  for (const k of KINDS) {
    if (kindState[k] === "upcoming") continue;
    rows.push({ key: `${k}-label`, type: "label", text: LABEL[k] });
    const items = shown.filter((it) => it.kind === k);
    items.forEach((it) => rows.push({ key: it.id, type: "item", item: it }));
    if (kindState[k] === "active" && items.length === 0) rows.push({ key: `${k}-skeleton`, type: "skeleton" });
  }

  return (
    <figure className="my-2">
      <div
        ref={stageRef}
        className={`${ecSans.className} flex h-[42rem] flex-col items-center pt-2`}
        style={{ color: C.ink, fontFeatureSettings: '"tnum"' }}
        aria-hidden="true"
      >
        {/* Stepper */}
        <ol className="flex w-full max-w-[30rem] items-center">
          {steps.flatMap((s, i) => {
            const step = (
              <li key={s.label} className="flex shrink-0 items-center">
                <Step index={i + 1} label={s.label} state={s.state} ms={s.ms} runKey={`${loop}`} />
              </li>
            );
            if (i === steps.length - 1) return [step];
            const line = (
              <li
                key={`${s.label}-line`}
                className="relative mx-2.5 h-[2px] min-w-6 flex-1 overflow-hidden rounded-full"
                style={{ background: C.track }}
              >
                <motion.span
                  className="absolute inset-y-0 left-0 w-full origin-left rounded-full"
                  style={{ background: C.accent }}
                  initial={false}
                  animate={{ scaleX: s.state === "done" ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: s.state === "done" ? 0.15 : 0 }}
                />
              </li>
            );
            return [step, line];
          })}
        </ol>

        {/* Cart: grows on a spring inside the fixed stage */}
        <motion.div
          layout
          transition={{ layout: SPRING }}
          className="mt-9 w-full max-w-[30rem] overflow-hidden rounded-[24px]"
          style={{
            background: `linear-gradient(180deg, ${C.edge} 0%, ${C.mid} 40%, ${C.mid} 85%, ${C.edge} 100%)`,
            boxShadow: `inset 0 0 0 1px ${C.border}`,
          }}
        >
          <motion.div
            key={loop}
            layout="position"
            className="px-7 pt-7 pb-6"
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: clearing ? 0 : 1, filter: clearing ? "blur(6px)" : "blur(0px)" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="text-[24px] leading-[30px] tracking-[-0.01em]">
              <span style={{ color: C.accent }}>Cricket&rsquo;s</span> enrollment
            </p>
            <p className="mt-1 text-[13px] leading-[18px]" style={{ color: C.muted }}>
              Shih tzu, 12.3 lbs, for Dillon Johnson
            </p>

            <ul className="mt-4 flex flex-col">
              <AnimatePresence initial={false} mode="popLayout">
                {p === 0 ? (
                  <motion.li
                    key="empty"
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className="pt-4 text-[13px] leading-[18px]"
                    style={{ color: C.muted }}
                  >
                    Pick a plan to start.
                  </motion.li>
                ) : null}
                {rows.map((r) =>
                  r.type === "label" ? (
                    <motion.li
                      key={r.key}
                      layout="position"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={SOFT}
                      className="pt-4 pb-1 text-[13px] leading-[18px]"
                      style={{ color: C.muted }}
                    >
                      {r.text}
                    </motion.li>
                  ) : r.type === "skeleton" ? (
                    <motion.li
                      key={r.key}
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.18 } }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between gap-4 py-2"
                    >
                      <span className="flex flex-col gap-1.5">
                        <Shimmer w={132} h={12} />
                        <Shimmer w={92} h={10} />
                      </span>
                      <Shimmer w={52} h={12} />
                    </motion.li>
                  ) : r.item ? (
                    <ItemRow key={r.key} item={r.item} />
                  ) : null,
                )}
              </AnimatePresence>
            </ul>

            <motion.div layout="position" transition={{ layout: SPRING }} className="mt-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[14px] leading-5" style={{ color: C.muted }}>
                  Monthly total
                </span>
                <Money value={total} />
              </div>

              <AnimatePresence initial={false}>
                {payVisible ? (
                  <motion.div
                    key="pay"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ height: SPRING, opacity: { duration: 0.35, delay: 0.08 } }}
                  >
                    <div className="pt-5">
                      <motion.div
                        className="relative flex h-12 items-center justify-center rounded-full text-[15px] font-medium text-white"
                        initial={false}
                        animate={{
                          backgroundColor: paid ? C.accent : C.primary,
                          scale: processing ? [1, 0.97, 1] : 1,
                          boxShadow: paid
                            ? [`0 0 0 0px ${C.accent}66`, `0 0 0 10px ${C.accent}00`]
                            : `0 0 0 0px ${C.accent}00`,
                        }}
                        transition={{
                          backgroundColor: { duration: 0.5, ease: EASE },
                          scale: { duration: 0.32, ease: EASE },
                          boxShadow: { duration: 0.9, ease: "easeOut" },
                        }}
                      >
                        <AnimatePresence initial={false} mode="popLayout">
                          <motion.span
                            key={paid ? "paid" : processing ? "processing" : "pay"}
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
                            transition={{ duration: 0.35, ease: EASE }}
                          >
                            {paid ? (
                              <>
                                <DrawnCheck size={16} /> Payment successful
                              </>
                            ) : processing ? (
                              <Spinner />
                            ) : (
                              `Pay $${total.toFixed(2)}`
                            )}
                          </motion.span>
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <p className="sr-only">
        An enrollment for Cricket playing out: the Plan, Products, Add-ons and Pay steps fill in one by one while
        the cart adds a Small Dog Plan at $54.00 a month, two included products, and a nail trim add-on at $12.00,
        for a monthly total of $66.00, then the payment goes through.
      </p>
    </figure>
  );
}

/** A cart row: the name settles first, the price follows a beat later. */
function ItemRow({ item }: { item: Item }) {
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ ...SPRING, opacity: { duration: 0.45, ease: EASE }, filter: { duration: 0.45, ease: EASE } }}
      className="flex items-baseline justify-between gap-4 py-2"
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[15px] leading-5">{item.name}</span>
        {item.sub ? (
          <span className="truncate text-[13px] leading-[18px]" style={{ color: C.muted }}>
            {item.sub}
          </span>
        ) : null}
      </span>
      <motion.span
        className="shrink-0 text-[15px] leading-5"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...SOFT, delay: 0.14 }}
      >
        {item.price != null ? `$${item.price.toFixed(2)}` : <span style={{ color: C.muted }}>Included</span>}
      </motion.span>
    </motion.li>
  );
}

/** A soft placeholder bar with a light sweep across it. */
function Shimmer({ w, h }: { w: number; h: number }) {
  return (
    <span className="relative block overflow-hidden rounded-full" style={{ width: w, height: h, background: C.skeleton }}>
      <motion.span
        className="absolute inset-y-0 w-1/2"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)" }}
        initial={{ x: "-100%" }}
        animate={{ x: "220%" }}
        transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
      />
    </span>
  );
}

/** The monthly total as an odometer: each digit rolls to its value on a spring. */
function Money({ value }: { value: number }) {
  const cents = Math.round(value * 100);
  const whole = Math.floor(cents / 100);
  const tens = Math.floor(whole / 10) % 10;
  const ones = whole % 10;
  const c1 = Math.floor((cents % 100) / 10);
  const c2 = cents % 10;
  return (
    // Every character is a 36px-tall block on one row, so the rolling digits
    // and the static "$" and "." share a line (inline-block columns with
    // overflow hidden would otherwise sit on their bottom edge, not the baseline).
    <span className="flex h-9 items-start text-[30px] leading-9 tracking-[-0.01em]">
      <span className="block h-9 leading-9">$</span>
      <motion.span
        className="flex h-9 overflow-hidden"
        initial={false}
        animate={{ width: whole >= 10 ? "1ch" : "0ch", opacity: whole >= 10 ? 1 : 0 }}
        transition={SOFT}
      >
        <Digit d={tens} />
      </motion.span>
      <Digit d={ones} />
      <span className="block h-9 leading-9">.</span>
      <Digit d={c1} />
      <Digit d={c2} />
    </span>
  );
}

function Digit({ d }: { d: number }) {
  return (
    <span className="relative block h-9 w-[1ch] shrink-0 overflow-hidden">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: -d * 36 }}
        transition={{ type: "spring", stiffness: 110, damping: 17, mass: 0.9 }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="block h-9 text-center leading-9">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Step({
  index,
  label,
  state,
  ms,
  runKey,
}: {
  index: number;
  label: string;
  state: StepState;
  ms: number;
  runKey: string;
}) {
  const bg = state === "upcoming" ? C.edge : state === "active" ? C.primary : C.accent;
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative flex size-7 items-center justify-center">
        {/* Progress ring: draws around the active step for as long as it runs */}
        <svg className="pointer-events-none absolute -inset-[5px] -rotate-90" viewBox="0 0 38 38" aria-hidden>
          <AnimatePresence>
            {state === "active" ? (
              <motion.circle
                key={`${runKey}-${label}`}
                cx="19"
                cy="19"
                r="17"
                fill="none"
                stroke={C.accent}
                strokeWidth="1.75"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 1 }}
                animate={{ pathLength: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: ms / 1000, ease: "linear" }}
              />
            ) : null}
          </AnimatePresence>
        </svg>
        <motion.span
          className="flex size-7 items-center justify-center rounded-full text-[13px]"
          initial={false}
          animate={{
            backgroundColor: bg,
            color: state === "upcoming" ? C.muted : "#ffffff",
            scale: state === "active" ? 1.06 : 1,
          }}
          transition={{ backgroundColor: { duration: 0.45, ease: EASE }, color: { duration: 0.45 }, scale: SOFT }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {state === "done" ? (
              <motion.span key="check" className="flex" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DrawnCheck size={13} />
              </motion.span>
            ) : (
              <motion.span
                key="num"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                {index}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
      </span>
      <motion.span
        className="whitespace-nowrap text-[14px] leading-5"
        initial={false}
        animate={{ color: state === "upcoming" ? C.muted : C.ink }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        {label}
      </motion.span>
    </span>
  );
}

/** A check that draws itself on. */
function DrawnCheck({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
      aria-label="Processing payment"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </motion.svg>
  );
}
