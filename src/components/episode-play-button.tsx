"use client";

/**
 * EpisodePlayButton
 *
 * The single play/pause control used by episode cards, the featured card,
 * and the hero. Takes a Recording and calls into the AudioPlayer context.
 *
 * Variants:
 *   icon  — small round outlined button (card grids)
 *   pill  — large amber pill with label (featured / hero)
 *
 * A recording with no audioUrl shows a disabled button rather than vanishing,
 * so the layout is stable while episodes are still being uploaded.
 */

import type { Recording } from "@/lib/content";
import { usePlayTrack } from "@/hooks/use-play-track";
import { PlayIcon } from "@/components/icons";

type Variant = "icon" | "pill";

export default function EpisodePlayButton({
  recording,
  variant = "icon",
  label = "Play",
  queue,
}: {
  recording: Recording;
  variant?: Variant;
  label?: string;
  /**
   * The list this recording is being played from, in the order shown on
   * screen — the album's running order, or the library as currently
   * filtered. Playback advances through it. Omit for a one-off play (the
   * featured track, say), and the piece plays alone and stops.
   */
  queue?: Recording[];
}) {
  const { playTrack, isThisPlaying, isThisLoading, isThisPaused } =
    usePlayTrack(recording._id);

  const disabled = !recording.audioUrl;

  const onClick = () => {
    if (!recording.audioUrl) return;
    /* Recordings without audio are dropped from the queue rather than left in
       to fail — a silent stall mid-album is worse than a shorter list. */
    const asTrack = (r: Recording) => ({
      id: r._id,
      title: r.title,
      subtitle: r.theme,
      audioUrl: r.audioUrl as string,
      coverUrl: r.coverImageUrl ?? "",
      durationSeconds: r.durationSec,
    });
    playTrack(
      asTrack(recording),
      queue?.filter((r) => r.audioUrl).map(asTrack),
    );
  };

  const stateLabel = isThisLoading
    ? "Loading"
    : isThisPlaying
    ? "Pause"
    : isThisPaused
    ? "Resume"
    : label;

  const ariaLabel = disabled
    ? `${recording.title} — audio not yet available`
    : `${stateLabel} ${recording.title}`;

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-amber px-[30px] text-[0.9375rem] font-semibold text-midnight transition-[background,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#F7BD6E] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isThisPlaying ? (
          <PauseGlyph />
        ) : (
          <PlayIcon className="h-[15px] w-[13px] fill-midnight" />
        )}
        {stateLabel}
      </button>
    );
  }

  // icon variant (card grids)
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="inline-flex min-h-[44px] w-11 items-center justify-center rounded-full border border-amber/50 transition-colors duration-200 hover:bg-amber/[0.16] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    >
      {isThisPlaying ? (
        <PauseGlyph small />
      ) : (
        <PlayIcon className="h-3 w-2.5 fill-amber" />
      )}
    </button>
  );
}

function PauseGlyph({ small }: { small?: boolean }) {
  const size = small ? 10 : 14;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={small ? "fill-amber" : "fill-midnight"}
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
