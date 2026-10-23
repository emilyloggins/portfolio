import Link from "next/link";

/**
 * The name is the mark: "★ Emily Loggins", all in cobalt, the one blue
 * thing on the page. Hovering or focusing crossfades to the heavier
 * cut in 120ms and back. Same on home (not a link) and on inner pages
 * (links home).
 */
export function Name({ link = true }: { link?: boolean }) {
  const inner = (
    <span className="name relative inline-block text-accent">
      <span className="name-a">
        <span className="mr-2" aria-hidden>★</span>Emily Loggins
      </span>
      <span className="name-b absolute inset-0" aria-hidden>
        <span className="mr-2">★</span>Emily Loggins
      </span>
    </span>
  );
  return link ? (
    <Link href="/" className="press inline-block text-body no-underline">
      {inner}
    </Link>
  ) : (
    <h1 className="text-body">{inner}</h1>
  );
}
