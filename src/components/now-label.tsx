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
    // Background tabs get their timers throttled, so the minute can arrive
    // late; re-read the clock the moment the tab is looked at again.
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  return (
    <>
      Now
      {time ? (
        <span className="font-normal text-ink-3">
          ,{" "}
          {/* Keyed by the minute: a new element each tick, so the new time
              settles in on the `tick` animation instead of snapping. */}
          <span key={time} className="tick inline-block">
            {time}
          </span>{" "}
          in Brooklyn
        </span>
      ) : null}
    </>
  );
}
