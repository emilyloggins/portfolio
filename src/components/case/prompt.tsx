import type { ReactNode } from "react";

/**
 * A block-level prompt for prose Emily has not written yet. Visible on
 * purpose, never shipped. The text inside is the brief, not the copy.
 */
export function Prompt({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-sm border border-dashed border-line px-3 py-2 text-body text-ink-3">
      TODO(emily): {children}
    </p>
  );
}
