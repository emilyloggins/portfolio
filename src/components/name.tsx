/**
 * The name, plain: warm ink, regular weight, not a link. The orb in the
 * corner is the page's one blue thing (see `Orb`).
 */
export function Name({ as = "h1" }: { as?: "h1" | "p" }) {
  const Tag = as;
  return <Tag className="text-body text-ink">Emily Loggins</Tag>;
}
