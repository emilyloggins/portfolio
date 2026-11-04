"use client";

import { useState } from "react";
import { Stage } from "./stage";

/**
 * The doctor's product card, live, in its three states: unsigned, signed,
 * removed. Signing means typing a name; the prescription is restated above
 * the field. Status is a word plus a colour, never a colour alone. Remove
 * is red, and it asks.
 */
type State = "unsigned" | "signed" | "removed";

export function SignCard() {
  const [state, setState] = useState<State>("unsigned");
  const [signing, setSigning] = useState(false);
  const [name, setName] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  const status =
    state === "signed"
      ? { word: "Signed", color: "var(--ec-success-600)" }
      : state === "removed"
        ? { word: "Removed", color: "var(--ec-danger-600)" }
        : { word: "Waiting for signature", color: "var(--ec-warning-600)" };

  return (
    <Stage caption="The product card on the doctor's page. Type a name to sign; Remove asks first. Every state says its word.">
      <div
        className="rounded-xl bg-[var(--ec-card)] p-5 shadow-[0_0_0_1px_var(--ec-200)] transition-opacity duration-(--duration-base)"
        style={{ opacity: state === "removed" ? 0.6 : 1 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[16px] leading-6 font-semibold" style={{ textDecoration: state === "removed" ? "line-through" : undefined }}>
              Heartgard Plus
            </h3>
            <p className="text-[12px] leading-4 text-[var(--ec-500)]">Heartworm, 0 to 25 lb. Cricket is 12.3 lb.</p>
          </div>
          <span className="flex items-center gap-1.5 text-[12px] leading-4 font-medium" style={{ color: status.color }}>
            <span aria-hidden className="size-1.5 rounded-full" style={{ background: status.color }} />
            {status.word}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 text-[14px] leading-5 sm:grid-cols-4">
          {[
            ["Quantity", "12 chews"],
            ["Refills", "0"],
            ["Route", "Oral, monthly"],
            ["Effective", "11/04/2026 to 11/04/2027"],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col border-t border-[var(--ec-200)] py-2">
              <dt className="text-[12px] leading-4 text-[var(--ec-600)]">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        {state === "unsigned" ? (
          <div className="mt-4 flex flex-col gap-3">
            {signing ? (
              <div className="ec-enter flex flex-col gap-2 rounded-lg bg-[var(--ec-100)] p-3">
                <p className="text-[12px] leading-4 text-[var(--ec-600)]">
                  Heartgard Plus, 12 chews, one by mouth monthly, for Cricket. Signing sends this to the pharmacy.
                </p>
                <label className="flex flex-col gap-1 text-[12px] leading-4 text-[var(--ec-600)]">
                  Your full name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Maron Williams"
                    className="min-h-11 rounded-lg border border-[var(--ec-200)] bg-[var(--ec-card)] px-3 text-[14px] text-[var(--ec-fg)] outline-none focus:border-[var(--ec-primary)] focus:ring-2 focus:ring-[var(--ec-primary-200)]"
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setSigning(false)} className="press min-h-11 rounded-lg px-4 text-[14px] font-medium text-[var(--ec-600)]">
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={name.trim().length < 3}
                    onClick={() => setState("signed")}
                    className="press min-h-11 rounded-lg px-5 text-[14px] font-medium text-white disabled:opacity-50"
                    style={{ background: "var(--ec-primary)" }}
                  >
                    Sign
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                {confirmRemove ? (
                  <div className="ec-enter flex items-center gap-2 text-[14px]">
                    <span className="text-[var(--ec-600)]">Remove Heartgard Plus from this enrollment?</span>
                    <button type="button" onClick={() => setConfirmRemove(false)} className="press min-h-11 rounded-lg px-3 font-medium text-[var(--ec-600)]">
                      Keep
                    </button>
                    <button type="button" onClick={() => { setState("removed"); setConfirmRemove(false); }} className="press min-h-11 rounded-lg px-3 font-medium" style={{ color: "var(--ec-danger-600)" }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmRemove(true)} className="press min-h-11 rounded-lg px-3 text-[14px] font-medium" style={{ color: "var(--ec-danger-600)" }}>
                    Remove
                  </button>
                )}
                {!confirmRemove ? (
                  <button
                    type="button"
                    onClick={() => setSigning(true)}
                    className="press min-h-11 rounded-lg px-5 text-[14px] font-medium text-white"
                    style={{ background: "var(--ec-primary)" }}
                  >
                    Sign
                  </button>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between text-[12px] leading-4 text-[var(--ec-500)]">
            <span>
              {state === "signed" ? `Signed by ${name.trim() || "Maron Williams"}, today.` : "Removed from this enrollment. The plan price is unchanged."}
            </span>
            <button
              type="button"
              onClick={() => { setState("unsigned"); setSigning(false); setName(""); }}
              className="press min-h-11 rounded-lg px-3 text-[14px] font-medium text-[var(--ec-600)]"
            >
              {state === "signed" ? "Unsign" : "Undo"}
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes ec-enter { from { opacity: 0; transform: translateY(6px) } }
        .ec-enter { animation: ec-enter var(--duration-base) var(--ease-out) both }
        @media (prefers-reduced-motion: reduce) { .ec-enter { animation: none } }
      `}</style>
    </Stage>
  );
}
