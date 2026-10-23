import Link from "next/link";
import type { ReactNode } from "react";

/**
 * One entry in a list: a title and a one-line description, the whole row
 * a link. The hover tint is painted by the parent `List`, which slides a
 * single pill between rows; the row itself only reports its bounds via
 * `data-row`. Press feedback (`.press`) is global: see globals.css.
 */
export const rowClass =
  "press -mx-3 flex flex-col rounded-sm px-3 py-2.5 no-underline focus-visible:outline-none";

export function Row({
  href,
  title,
  children,
  external = false,
}: {
  href: string;
  title: string;
  children?: ReactNode;
  external?: boolean;
}) {
  const body = (
    <>
      <span className="text-body text-ink">{title}</span>
      {children ? <span className="text-body text-ink-2">{children}</span> : null}
    </>
  );
  return external ? (
    <a href={href} data-row className={rowClass} target="_blank" rel="noreferrer">
      {body}
    </a>
  ) : (
    <Link href={href} data-row className={rowClass}>
      {body}
    </Link>
  );
}

/** A labelled section: heading (or any node), then rows or prose. */
export function Section({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="mb-2 text-body font-medium text-ink">{title}</h2>
      {children}
    </section>
  );
}

/** Copy Emily has not written yet. Visible on purpose; never shipped. */
export function Todo({ children }: { children: ReactNode }) {
  return <span className="text-ink-3">[{children}]</span>;
}
