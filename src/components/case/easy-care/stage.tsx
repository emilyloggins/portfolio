import type { ReactNode } from "react";

/**
 * A stage for a piece of Easy Care rebuilt live. The product's own tokens,
 * scoped: HeroUI's defaults with the primary ramp repointed to MWI purple,
 * exactly as the shipped theme does it. Inter, 4px units, radius 8 on
 * controls and 12 on cards, 1px borders, 44px targets. Nothing invented.
 */

/** The product's tokens, scoped. Shared by every Easy Care demo. */
export const EC_VARS = {
  "--ec-primary": "#211359",
  "--ec-primary-50": "#eeebf7",
  "--ec-primary-100": "#d9d2ec",
  "--ec-primary-200": "#b4a7d8",
  "--ec-bg": "#f4f4f5",
  "--ec-card": "#ffffff",
  "--ec-fg": "#11181c",
  "--ec-600": "#52525b",
  "--ec-500": "#71717a",
  "--ec-200": "#e4e4e7",
  "--ec-100": "#f4f4f5",
  "--ec-danger": "#f31260",
  "--ec-danger-600": "#c20e4d",
  "--ec-success-600": "#12a150",
  "--ec-warning-600": "#c4841d",
  fontFeatureSettings: '"tnum"',
} as React.CSSProperties;

export function Stage({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="flex flex-col gap-2">
      <div
        className="ec w-full overflow-hidden rounded-md border border-line bg-[var(--ec-bg)] p-4 text-[var(--ec-fg)] sm:p-6"
        style={
          {
            "--ec-primary": "#211359",
            "--ec-primary-50": "#eeebf7",
            "--ec-primary-100": "#d9d2ec",
            "--ec-primary-200": "#b4a7d8",
            "--ec-bg": "#f4f4f5",
            "--ec-card": "#ffffff",
            "--ec-fg": "#11181c",
            "--ec-600": "#52525b",
            "--ec-500": "#71717a",
            "--ec-200": "#e4e4e7",
            "--ec-100": "#f4f4f5",
            "--ec-danger": "#f31260",
            "--ec-danger-600": "#c20e4d",
            "--ec-success-600": "#12a150",
            "--ec-warning-600": "#c4841d",
            fontFeatureSettings: '"tnum"',
          } as React.CSSProperties
        }
      >
        {children}
      </div>
      {caption ? <figcaption className="text-meta text-ink-2">{caption}</figcaption> : null}
    </figure>
  );
}
