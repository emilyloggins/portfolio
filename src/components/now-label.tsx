"use client";

import { useEffect, useState } from "react";

/**
 * The "Now" label knows what time it is where Emily is. Rendered after
 * mount (the server can't know the minute), updated on the minute.
 */
export function NowLabel() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
    });
    const tick = () => setTime(fmt.format(new Date()).toLowerCase());
    tick();
    const toNextMinute = 60_000 - (Date.now() % 60_000);
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      tick();
      interval = window.setInterval(tick, 60_000);
    }, toNextMinute);
    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  return (
    <>
      Now
      {time ? (
        <span className="font-normal text-ink-3">, {time} in Brooklyn</span>
      ) : null}
    </>
  );
}
