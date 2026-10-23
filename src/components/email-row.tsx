"use client";

import { useEffect, useRef, useState } from "react";
import { rowClass } from "@/components/row";

/**
 * The Email row copies the address instead of opening a mail client.
 * The description swaps to "Copied" for 1.2s with a 4px vertical slide,
 * then back. Falls through to mailto: where the clipboard is unavailable.
 */
export function EmailRow({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  return (
    <a
      href={`mailto:${address}`}
      data-row
      className={rowClass}
      onClick={async (e) => {
        if (!navigator.clipboard) return;
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(address);
        } catch {
          window.location.href = `mailto:${address}`;
          return;
        }
        setCopied(true);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1200);
      }}
    >
      <span className="text-body text-ink">Email</span>
      <span className="relative block h-[1.55em] overflow-hidden text-body text-ink-2">
        <span className="swap" data-on={copied ? "" : undefined}>
          <span>{address}</span>
          <span aria-live="polite">Copied</span>
        </span>
      </span>
    </a>
  );
}
