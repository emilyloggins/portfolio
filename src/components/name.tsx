import Link from "next/link";

/**
 * The name, plain: warm ink, regular weight. On the home page it is the
 * heading. On an inner page it is the way home: the same text, in the same
 * place it sits on the home page, as a link that lightens on hover. No
 * back button, no breadcrumb; the name is the breadcrumb.
 */
export function Name({ as = "h1", href }: { as?: "h1" | "p"; href?: string }) {
  const Tag = as;
  if (href) {
    return (
      <Tag className="text-body text-ink">
        <Link
          href={href}
          className="press inline-block no-underline transition-colors duration-(--duration-fast) hover:text-ink-3"
        >
          Emily Loggins
        </Link>
      </Tag>
    );
  }
  return <Tag className="text-body text-ink">Emily Loggins</Tag>;
}
