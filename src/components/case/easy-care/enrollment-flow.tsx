"use client";

import { useEffect, useRef, useState } from "react";
import { Stage } from "./stage";

/**
 * The whole enrollment in one card: the five-step tracker from the shipped
 * product, playing itself. Each step shows the two or three facts the
 * clinic user settles there, in the product's own words. It advances on
 * its own; hovering holds it, a tap on a step jumps to it.
 */
const STEPS = [
  {
    id: "who",
    label: "Client and pet",
    title: "Who",
    rows: [
      ["Client", "Dillon Johnson"],
      ["Pet", "Cricket, Canine, Shih Tzu"],
      ["Weight", "12.3 lb, recorded today"],
    ],
    note: "Weight first. It decides which products come next.",
  },
  {
    id: "what",
    label: "Plan",
    title: "What",
    rows: [
      ["Plan", "Small Dog Plan v1, $58.00 per month"],
      ["Products", "Heartgard Plus, NexGard"],
      ["Add-on", "Nail trims, $6.00 per month"],
    ],
    note: "Nine services included. Products sized for 12.3 lb only.",
  },
  {
    id: "doctor",
    label: "Doctor",
    title: "Doctor",
    rows: [
      ["Signs for Cricket", "Dr. Maron Williams"],
      ["Note to doctor", "Puppy, reassess weight monthly"],
    ],
    note: "The clinic user sets it up. Only the doctor makes it real.",
  },
  {
    id: "pay",
    label: "Checkout",
    title: "Sign-off",
    rows: [
      ["Card", "Visa ending 4242, saved for the plan"],
      ["Consent", "$64.00 on the 4th of each month"],
    ],
    note: "The button names only the amount: Pay $64.00.",
  },
  {
    id: "done",
    label: "Success",
    title: "Paid, not done",
    rows: [
      ["Next", "Dr. Williams signs the prescriptions"],
      ["Then", "First doses ship to Cricket's home"],
    ],
    note: "Print the summary and hand it across the counter.",
  },
];

const HOLD_MS = 2600;

export function EnrollmentFlow() {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (held) return;
    timer.current = window.setTimeout(() => setI((n) => (n + 1) % STEPS.length), HOLD_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [i, held]);

  const step = STEPS[i];

  return (
    <Stage caption="The five steps, as the tracker shows them. It plays itself; hover to hold, tap a step to jump.">
      <div
        className="flex flex-col gap-4"
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
      >
        {/* Tracker */}
        <ol className="grid grid-cols-5 gap-2" aria-label="Enrollment steps">
          {STEPS.map((s, n) => {
            const state = n < i ? "done" : n === i ? "active" : "todo";
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setI(n)}
                  aria-current={state === "active" ? "step" : undefined}
                  className="press flex w-full flex-col gap-2 rounded-lg py-1 text-left"
                >
                  <span className="relative block h-1 w-full overflow-hidden rounded-full bg-[var(--ec-200)]">
                    <span
                      className="ec-bar absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: "var(--ec-primary)",
                        width: state === "done" ? "100%" : state === "active" ? "100%" : "0%",
                        transformOrigin: "left",
                        transform: state === "active" ? undefined : undefined,
                        animation:
                          state === "active" && !held ? `ec-fill ${HOLD_MS}ms linear forwards` : undefined,
                        opacity: state === "todo" ? 0 : 1,
                        transition: "opacity var(--duration-fast) var(--ease-out)",
                      }}
                    />
                  </span>
                  <span
                    className="truncate text-[12px] leading-4"
                    style={{
                      color: state === "todo" ? "var(--ec-500)" : "var(--ec-fg)",
                      fontWeight: state === "active" ? 600 : 400,
                    }}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Content card, keyed so it re-enters */}
        <div className="relative min-h-[11.5rem] rounded-xl bg-[var(--ec-card)] p-5 shadow-[0_0_0_1px_var(--ec-200)]">
          <div key={step.id} className="ec-enter flex flex-col gap-3">
            <h3 className="text-[16px] leading-6 font-semibold">{step.title}</h3>
            <dl className="flex flex-col">
              {step.rows.map(([k, v]) => (
                <div key={k} className="flex min-h-11 items-center justify-between gap-4 border-t border-[var(--ec-200)] text-[14px] leading-5 first:border-t-0">
                  <dt className="text-[var(--ec-600)]">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-[12px] leading-4 text-[var(--ec-500)]">{step.note}</p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ec-fill { from { width: 0% } to { width: 100% } }
        @keyframes ec-enter { from { opacity: 0; transform: translateY(6px) } }
        .ec-enter { animation: ec-enter var(--duration-base) var(--ease-out) both }
        @media (prefers-reduced-motion: reduce) { .ec-enter, .ec-bar { animation: none !important } }
      `}</style>
    </Stage>
  );
}
