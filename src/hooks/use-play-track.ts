"use client";

/**
 * usePlayTrack
 *
 * Thin convenience hook for episode cards and the featured player section.
 * Returns a `playTrack` function and the current player state scoped to
 * whether THIS track is the one playing.
 *
 * Usage:
 *   const { playTrack, isThisPlaying, isThisLoading } = usePlayTrack(track.id)
 *
 *   <button onClick={() => playTrack({ id, title, audioUrl, coverUrl })}>
 *     {isThisPlaying ? <PauseIcon /> : <PlayIcon />}
 *   </button>
 */

import { useCallback } from "react";
import { useAudioPlayer, type Track } from "@/context/audio-player";

export function usePlayTrack(trackId?: string) {
  const { play, pause, resume, track, status } = useAudioPlayer();

  const isThisTrack = !!trackId && track?.id === trackId;
  const isThisPlaying = isThisTrack && status === "playing";
  const isThisLoading = isThisTrack && status === "loading";
  const isThisPaused = isThisTrack && status === "paused";

  const playTrack = useCallback(
    (t: Track) => {
      if (isThisPlaying) {
        pause();
      } else if (isThisPaused) {
        resume();
      } else {
        play(t);
      }
    },
    [isThisPlaying, isThisPaused, play, pause, resume]
  );

  return { playTrack, isThisPlaying, isThisLoading, isThisPaused };
}
