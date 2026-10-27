import type { MDXComponents } from "mdx/types";
import { Screen, Strip } from "@/components/case/screen";
import { Decision } from "@/components/case/decision";
import { Prompt } from "@/components/case/prompt";

/**
 * Global MDX components. Case studies are written in markdown and drop
 * these in by name; the mapping lives here so prose never imports.
 */
const components: MDXComponents = {
  Screen,
  Strip,
  Decision,
  Prompt,
  h2: (props) => <h2 className="mt-8 text-title font-medium text-ink" {...props} />,
  h3: (props) => <h3 className="mt-4 text-body font-medium text-ink" {...props} />,
  p: (props) => <p className="text-body text-ink-2" {...props} />,
  ul: (props) => <ul className="flex list-disc flex-col gap-1 pl-5 text-body text-ink-2" {...props} />,
  ol: (props) => <ol className="flex list-decimal flex-col gap-1 pl-5 text-body text-ink-2" {...props} />,
  table: (props) => <table className="w-full border-collapse text-meta" {...props} />,
  th: (props) => <th className="border-b border-line py-2 text-left font-medium text-ink" {...props} />,
  td: (props) => <td className="border-b border-line py-2 align-top text-ink-2" {...props} />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
