/**
 * A display-size line that frames what comes after it. Emily's words; the
 * page uses it once, above the hero.
 */
export function Lede({ children }: { children: React.ReactNode }) {
  return <p className="text-display font-medium text-ink">{children}</p>;
}
