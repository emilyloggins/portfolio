import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/**
 * Decisions are the site's primary data. One markdown file per decision in
 * content/decisions/, read at build time and validated here, so a bad
 * entry fails the build instead of rendering wrong. The case study pages
 * and /decisions both read from this one source.
 */
export const DecisionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  project: z.enum(["basin", "easy-care", "site"]),
  // YAML parses an unquoted 2026-10-19 as a Date; accept either form and
  // normalise to the plain string.
  date: z.preprocess(
    (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ),
  question: z.string().min(1),
  considered: z.array(z.string().min(1)).min(1),
  decided: z.string().min(1),
  /** True when Emily made the call against an option the model favoured. */
  mine: z.boolean().default(false),
  /** Id of the later decision that reversed this one, if any. */
  reversedBy: z.string().optional(),
  /** Commit hashes or screen names this changed. */
  evidence: z.array(z.string()).default([]),
});

export type Decision = z.infer<typeof DecisionSchema> & { why: string };

const DIR = path.join(process.cwd(), "content", "decisions");

export function readDecisions(): Decision[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(DIR, file), "utf8");
      const { data, content } = matter(raw);
      const parsed = DecisionSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(`content/decisions/${file}: ${parsed.error.message}`);
      }
      return { ...parsed.data, why: content.trim() };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
