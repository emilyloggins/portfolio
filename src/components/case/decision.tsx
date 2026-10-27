import { readDecisions } from "@/lib/decisions";

/**
 * One decision, inline in a case study, read from content/decisions/.
 * Question, what was considered, what was decided, and the why in Emily's
 * words. A missing id fails the build, which is the point.
 */
export function Decision({ id }: { id: string }) {
  const d = readDecisions().find((x) => x.id === id);
  if (!d) throw new Error(`Decision "${id}" not found in content/decisions/`);
  return (
    <aside className="flex flex-col gap-3 rounded-md border border-line p-4">
      <p className="text-meta text-ink-3">
        Decision {d.mine ? "· my call" : ""} · {d.date}
      </p>
      <p className="text-body font-medium text-ink">{d.question}</p>
      <ul className="flex flex-col gap-1 text-meta text-ink-2">
        {d.considered.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <p className="text-body text-ink">{d.decided}</p>
      <p className="text-body text-ink-2">{d.why}</p>
    </aside>
  );
}
