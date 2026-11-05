import Link from "next/link";
import type { ReactNode } from "react";

/**
 * One entry in a list: a title and a one-line description, the whole row
 * a link. The hover tint is painted by the parent `List`, which slides a
 * single pill between rows; the row itself only reports its bounds via
 * `data-row`. Press feedback (`.press`) is global: see globals.css.
 */
/** Every row is the same height, with or without a description, so a
 *  list reads as a grid and the sliding highlight never changes size. */
export const rowClass =
  "press -mx-3 flex min-h-[4.25rem] flex-col justify-center rounded-sm px-3 no-underline focus-visible:outline-none";

export function Row({
  href,
  title,
  children,
  tags,
  external = false,
}: {
  href: string;
  title: string;
  children?: ReactNode;
  /** The breadth of the thing, as quiet tags under the line: "Consumer wellness", "iOS app". */
  tags?: string[];
  external?: boolean;
}) {
  const body = (
    <>
      <span className="text-body text-ink">{title}</span>
      {children ? <span className="text-body text-ink-2">{children}</span> : null}
      {tags?.length ? <Tags items={tags} /> : null}
    </>
  );
  // Rows with tags are one line taller; every row in that list shares it.
  const cls = tags?.length ? rowClass.replace("min-h-[4.25rem]", "min-h-[6.25rem] gap-1 py-3") : rowClass;
  return external ? (
    <a href={href} data-row className={cls} target="_blank" rel="noreferrer">
      {body}
    </a>
  ) : (
    <Link href={href} data-row className={cls}>
      {body}
    </Link>
  );
}

/** The breadth, as a quiet third line: meta type, grey, no chips. */
export function Tags({ items }: { items: string[] }) {
  return <span className="mt-1 text-meta text-ink-3">{items.join(", ")}</span>;
}

/**
 * One line of history: where, what in plain words, and the industry as a
 * tag. Not a link; nothing to open. Same height as a work row.
 */
export function HistoryRow({
  place,
  children,
  tags,
}: {
  place: string;
  children: ReactNode;
  tags?: string[];
}) {
  return (
    <div className="-mx-3 flex min-h-[6.25rem] flex-col justify-center gap-1 px-3 py-3">
      <span className="text-body text-ink">{place}</span>
      <span className="text-body text-ink-2">{children}</span>
      {tags?.length ? <Tags items={tags} /> : null}
    </div>
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
