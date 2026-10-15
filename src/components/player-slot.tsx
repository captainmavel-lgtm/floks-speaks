"use client";

import { useEffect, useRef } from "react";

/* ============================================================================
   PLAYER SLOT

   The persistent player lives at the layout level so playback survives
   navigation. In the prototype that needed sessionStorage; in the App Router
   the layout does not remount between routes, so the audio element simply
   keeps playing and the storage workaround can be dropped.

   This is the slot and the clearance mechanism only. The player UI arrives
   with the audio pipeline in Phase 4.

   CLEARANCE IS MEASURED, NEVER ASSUMED. The old build reserved a fixed 88px at
   the bottom of the body, which was wrong at every width: the bar is 65px on
   phones, 69px on desktop, and changes again with the reader's text size. A
   ResizeObserver writes the real height to --player-h, and the footer and
   scroll padding read it. The 0px default matters: before the player appears
   there is nothing to clear, and a hardcoded reserve leaves a gap on every page.
   ========================================================================= */

export default function PlayerSlot() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const write = () => {
      const h = el.offsetParent === null ? 0 : el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--player-h", `${Math.round(h)}px`);
    };

    write();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(write);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.setProperty("--player-h", "0px");
    };
  }, []);

  return (
    <div
      ref={ref}
      id="site-player"
      role="region"
      aria-label="Audio player"
      hidden
      className="fixed inset-x-0 bottom-0 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    />
  );
}
