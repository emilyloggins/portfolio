import type { MDXComponents } from "mdx/types";

/**
 * Global MDX components. Case studies are written in markdown and drop
 * these in by name; the mapping lives here so prose never imports.
 * Filled in as the component set is built (Decision, Compare, Phone, Timeline).
 */
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
