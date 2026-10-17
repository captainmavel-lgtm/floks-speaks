"use client";

/**
 * AudioPlayer
 *
 * Sticky bottom-bar persistent player. Renders inside #site-player (the slot
 * already in the layout) by using a React Portal, so it lives in the DOM in
 * the right place without changing the layout tree.
 *
 * Visible only when a track has been loaded (status !== 'idle').
 *
 * Design tokens used:
 *   --color-midnight, --color-charcoal, --color-amber, --color-ivory,
 *   --color-hairline, --font-display, --font-ui
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useAudioPlayer } from "@/context/audio-player";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Icons (inline SVG to avoid an icon library dep) ───────────────────────────

function PlayIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}

function PauseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function LoadingIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

function SkipBack15({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
      <text x="8" y="15" fontSize="5.5" fontWeight="700" fontFamily="sans-serif" fill="currentColor">15</text>
    </svg>
  );
}

function SkipForward15({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2z" />
      <text x="8" y="15" fontSize="5.5" fontWeight="700" fontFamily="sans-serif" fill="currentColor">15</text>
    </svg>
  );
}

function VolumeIcon({ muted, size = 18 }: { muted: boolean; size?: number }) {
  return muted ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18l1.46 1.47L20.46 18l-14.19-14.2L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

// ── Scrubber ──────────────────────────────────────────────────────────────────

function Scrubber({
  current,
  duration,
  onSeek,
}: {
  current: number;
  duration: number;
  onSeek: (s: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragPct, setDragPct] = useState(0);

  const pct = duration > 0 ? (dragging ? dragPct : current / duration) * 100 : 0;

  const getPos = useCallback((e: React.PointerEvent | PointerEvent) => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setDragPct(getPos(e));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragPct(getPos(e));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    onSeek(getPos(e) * duration);
  };

  return (
    <div className="w-full flex items-center gap-2" style={{ fontFamily: "var(--font-ui)" }}>
      <span className="text-xs tabular-nums" style={{ color: "rgba(242,237,229,0.5)", minWidth: "2.8rem", textAlign: "right" }}>
        {formatTime(current)}
      </span>

      {/* Track */}
      <div
        ref={barRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(current)}
        tabIndex={0}
        className="relative flex-1 h-1 rounded-full cursor-pointer group"
        style={{ background: "rgba(242,237,229,0.15)" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") onSeek(Math.max(0, current - 5));
          if (e.key === "ArrowRight") onSeek(Math.min(duration, current + 5));
        }}
      >
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
          style={{ width: `${pct}%`, background: "var(--color-amber)" }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${pct}%`, background: "var(--color-amber)" }}
        />
      </div>

      <span className="text-xs tabular-nums" style={{ color: "rgba(242,237,229,0.5)", minWidth: "2.8rem" }}>
        {formatTime(duration)}
      </span>
    </div>
  );
}

// ── Main Player ───────────────────────────────────────────────────────────────

function PlayerBar() {
  const { track, status, currentTime, duration, volume, muted, play, pause, resume, seek, setVolume, toggleMute, skip } =
    useAudioPlayer();

  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed when a new track loads
  useEffect(() => {
    if (track) setDismissed(false);
  }, [track?.id]);

  const isVisible = !!track && status !== "idle" && !dismissed;
  const isPlaying = status === "playing";
  const isLoading = status === "loading";

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Now playing"
      className="w-full"
      style={{
        background: "linear-gradient(to top, var(--color-midnight) 0%, rgba(17,17,22,0.97) 100%)",
        borderTop: "1px solid var(--color-hairline)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Scrubber — full width, sits above the main bar */}
      <div className="px-4 pt-2">
        <Scrubber current={currentTime} duration={duration} onSeek={seek} />
      </div>

      {/* Main bar */}
      <div className="flex items-center gap-3 px-4 py-2">
        {/* Cover art */}
        {track?.coverUrl && (
          <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden" style={{ background: "var(--color-charcoal)" }}>
            <Image
              src={track.coverUrl}
              alt={track.title}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate leading-tight"
            style={{ color: "var(--color-ivory)", fontFamily: "var(--font-display)" }}
          >
            {track?.title}
          </p>
          {track?.subtitle && (
            <p
              className="text-xs truncate leading-tight mt-0.5"
              style={{ color: "rgba(242,237,229,0.5)", fontFamily: "var(--font-ui)" }}
            >
              {track.subtitle}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Skip back 15s */}
          <button
            onClick={() => skip(-15)}
            aria-label="Skip back 15 seconds"
            className="p-2 rounded-full transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2"
            style={{ color: "rgba(242,237,229,0.7)", "--tw-ring-color": "var(--color-amber)" } as React.CSSProperties}
          >
            <SkipBack15 />
          </button>

          {/* Play / Pause */}
          <button
            onClick={isPlaying ? pause : resume}
            disabled={isLoading}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50"
            style={{
              background: "var(--color-amber)",
              color: "var(--color-midnight)",
              "--tw-ring-color": "var(--color-amber)",
            } as React.CSSProperties}
          >
            {isLoading ? <LoadingIcon size={20} /> : isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
          </button>

          {/* Skip forward 15s */}
          <button
            onClick={() => skip(15)}
            aria-label="Skip forward 15 seconds"
            className="p-2 rounded-full transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2"
            style={{ color: "rgba(242,237,229,0.7)", "--tw-ring-color": "var(--color-amber)" } as React.CSSProperties}
          >
            <SkipForward15 />
          </button>

          {/* Volume — hidden on small screens */}
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="hidden sm:flex p-2 rounded-full transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2"
            style={{ color: "rgba(242,237,229,0.7)", "--tw-ring-color": "var(--color-amber)" } as React.CSSProperties}
          >
            <VolumeIcon muted={muted} />
          </button>

          {/* Volume slider — hidden on small screens */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Volume"
            className="hidden md:block w-20 h-1 cursor-pointer accent-amber-400"
            style={{ accentColor: "var(--color-amber)" }}
          />

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Close player"
            className="p-2 rounded-full transition-colors hover:bg-white/10 ml-1 focus-visible:outline-none focus-visible:ring-2"
            style={{ color: "rgba(242,237,229,0.4)", "--tw-ring-color": "var(--color-amber)" } as React.CSSProperties}
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Portal wrapper ────────────────────────────────────────────────────────────
// Renders into #site-player so the player sits in the correct DOM position
// without changing the component hierarchy.

export default function AudioPlayer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const slot = document.getElementById("site-player");
  if (!slot) return null;

  // Reveal the slot (it starts hidden in player-slot.tsx)
  slot.removeAttribute("hidden");

  return createPortal(<PlayerBar />, slot);
}
