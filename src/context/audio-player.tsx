"use client";

/**
 * AudioPlayerContext
 *
 * Global audio state that persists across page navigation in the App Router.
 * The layout wraps the whole app in this provider, so any component can call
 * useAudioPlayer() to play, pause, or read the current track.
 *
 * Design rule: the actual <audio> element is owned by this context.
 * Components NEVER create their own audio elements — they call the context
 * actions and render the state they get back.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Track {
  /** Unique identifier — matches the audioTrack slug in Sanity */
  id: string;
  title: string;
  /** Short descriptor shown under the title in the player bar */
  subtitle?: string;
  /** Full URL to the MP3 on R2 (via media.floksspeaks.org) */
  audioUrl: string;
  /** URL to the episode cover art */
  coverUrl?: string;
  /** Duration in seconds (populated from Sanity; used before audio loads) */
  durationSeconds?: number;
}

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

interface AudioPlayerState {
  track: Track | null;
  status: PlayerStatus;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
}

interface AudioPlayerActions {
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  /** Skip forward/back by N seconds (default ±15) */
  skip: (seconds: number) => void;
}

type AudioPlayerContext = AudioPlayerState & AudioPlayerActions;

// ── Context ───────────────────────────────────────────────────────────────────

const Ctx = createContext<AudioPlayerContext | null>(null);

export function useAudioPlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [track, setTrack] = useState<Track | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);

  // ── Initialise the singleton audio element once ──────────────────────────
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onPlaying = () => setStatus("playing");
    const onPause = () => setStatus("paused");
    const onWaiting = () => setStatus("loading");
    const onEnded = () => {
      setStatus("paused");
      setCurrentTime(0);
    };
    const onError = () => setStatus("error");
    const onCanPlay = () => {
      if (audio.paused) return; // don't flip status if user paused while loading
      setStatus("playing");
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("canplay", onCanPlay);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const play = useCallback((newTrack: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    // If the same track is already loaded, just resume
    if (track?.id === newTrack.id && audio.src) {
      audio.play().catch(console.error);
      return;
    }

    setTrack(newTrack);
    setStatus("loading");
    setCurrentTime(0);
    setDuration(newTrack.durationSeconds ?? 0);

    audio.src = newTrack.audioUrl;
    audio.load();
    audio.play().catch((err) => {
      console.error("[AudioPlayer] play failed:", err);
      setStatus("error");
    });
  }, [track]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(console.error);
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 0));
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }, []);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration || 0));
  }, []);

  return (
    <Ctx.Provider
      value={{
        track,
        status,
        currentTime,
        duration,
        volume,
        muted,
        play,
        pause,
        resume,
        seek,
        setVolume,
        toggleMute,
        skip,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
