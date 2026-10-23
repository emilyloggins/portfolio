import Link from "next/link";

/**
 * The name is the mark. Two weights stacked; hovering or focusing
 * crossfades from the regular to the heavier one in 120ms and back.
 * Same component on home (not a link) and on inner pages (links home).
 */
export function Name({ link = true }: { link?: boolean }) {
  const inner = (
    <span className="name relative inline-block">
      <span className="name-a">Emily Loggins</span>
      <span className="name-b absolute inset-0" aria-hidden>
        Emily Loggins
      </span>
    </span>
  );
  return link ? (
    <Link href="/" className="press inline-block text-body text-ink no-underline">
      {inner}
    </Link>
  ) : (
    <h1 className="text-body text-ink">{inner}</h1>
  );
}
