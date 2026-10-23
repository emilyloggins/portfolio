import Link from "next/link";
import type { ReactNode } from "react";

/**
 * One entry in a list: a title and a one-line description, the whole row
 * a link. On hover the row tints and nothing else happens; the padding
 * is pulled out past the column edge so the tint reads as a highlight
 * on the list, not a box around the text.
 */
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
  const className =
    "-mx-3 flex flex-col rounded-sm px-3 py-2.5 no-underline transition-colors duration-(--duration-fast) ease-(--ease-out) hover:bg-ground-2 focus-visible:bg-ground-2 focus-visible:outline-none";
  const body = (
    <>
      <span className="text-body text-ink">{title}</span>
      {children ? <span className="text-body text-ink-2">{children}</span> : null}
    </>
  );
  return external ? (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {body}
    </a>
  ) : (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}

/** A labelled section: small heading, then rows or prose. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
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
