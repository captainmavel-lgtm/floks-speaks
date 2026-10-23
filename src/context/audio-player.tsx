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
  /** The list the current track belongs to, in the order it will play. */
  queue: Track[];
  /** Position of the current track within `queue`; -1 when nothing is loaded. */
  queueIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  status: PlayerStatus;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
}

interface AudioPlayerActions {
  /**
   * Start a track. Pass `queue` to play it as part of a list — the album in
   * its running order, or the library as currently filtered — and playback
   * advances through that list on its own. Without a queue the track plays
   * alone and stops at the end.
   */
  play: (track: Track, queue?: Track[]) => void;
  /** Advance to the next track. No-op at the end of the queue. */
  next: () => void;
  /**
   * Restart the current track, or step back if it has only just started.
   * The 3-second rule is the convention every music player uses: pressing
   * back mid-piece means "from the top", pressing it immediately means
   * "I picked the wrong one".
   */
  previous: () => void;
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

/* Where the listener was when they last closed the tab. Nothing survived a
   reload before: a piece abandoned eight minutes in started again from zero,
   which on a phone over mobile data is the difference between finishing
   something and giving up on it.
   Module scope, not component scope, so it is a stable reference rather than
   a dependency that changes on every render. */
const RESUME_KEY = "floks:resume";

type Resume = { track: Track; position: number };

function readResume(): Resume | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RESUME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Resume;
    if (!parsed?.track?.audioUrl || typeof parsed.position !== "number") return null;
    /* A piece that was all but finished is not worth resuming into its last
       few seconds. */
    if (
      parsed.track.durationSeconds &&
      parsed.position > parsed.track.durationSeconds - 5
    ) {
      return null;
    }
    return parsed;
  } catch {
    /* Private mode, blocked storage, or something else wrote nonsense here.
       Resuming is a convenience; never let it break playback. */
    return null;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [track, setTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [status, setStatus] = useState<PlayerStatus>("idle");

  /* The "ended" listener is registered once, on mount, so it closes over the
     queue as it was at that moment — which is empty. These refs are how it
     reads the live queue instead. Same for startTrack, which is redefined on
     every render. */
  const queueRef = useRef<Track[]>([]);
  const indexRef = useRef(-1);
  const startTrackRef = useRef<((t: Track) => void) | null>(null);
  /* The Media Session handlers are registered per track, but next/previous/
     skip are redefined every render. These refs keep the lock-screen buttons
     pointed at the current versions without re-registering on every tick. */
  const nextRef = useRef<(() => void) | null>(null);
  const previousRef = useRef<(() => void) | null>(null);
  const skipRef = useRef<((s: number) => void) | null>(null);
  const hasNextRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);

  /** Load a track into the audio element and start it. Queue-agnostic. */
  const startTrack = useCallback((t: Track, startAt = 0) => {
    const audio = audioRef.current;
    if (!audio) return;
    setTrack(t);
    setStatus("loading");
    setCurrentTime(startAt);
    setDuration(t.durationSeconds ?? 0);
    audio.src = t.audioUrl;
    audio.load();
    if (startAt > 0) {
      /* currentTime cannot be set until the browser knows the duration. */
      const seek = () => {
        audio.currentTime = startAt;
        audio.removeEventListener("loadedmetadata", seek);
      };
      audio.addEventListener("loadedmetadata", seek);
    }
    audio.play().catch((err) => {
      console.error("[AudioPlayer] play failed:", err);
      setStatus("error");
    });
  }, []);

  startTrackRef.current = startTrack;

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
      const q = queueRef.current;
      const i = indexRef.current;
      if (i >= 0 && i + 1 < q.length) {
        indexRef.current = i + 1;
        setQueueIndex(i + 1);
        startTrackRef.current?.(q[i + 1]);
        return;
      }
      // End of the queue: stop cleanly, rewound and ready to replay.
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

    /* Restore the last piece, PAUSED and cued to where it was left.
       Deliberately not resumed: autoplay on load is blocked by every mobile
       browser worth naming, and sound starting on its own because a page was
       reopened is hostile even where it is allowed. The listener sees the bar
       with their place kept and presses play. */
    /* The rule below would have this read during render, as lazy initial state.
       That is exactly what it must not do: EpisodePlayButton is a client
       component rendered on the server, and it reads this status to choose
       between "Play" and "Resume". Seeding the resumed track during render
       makes the server say Play and the first client render say Resume,
       which is a hydration mismatch. Restoring after mount is correct here. */
    const saved = readResume();
    /* eslint-disable react-hooks/set-state-in-effect */
    if (saved) {
      setTrack(saved.track);
      setQueue([saved.track]);
      setQueueIndex(0);
      queueRef.current = [saved.track];
      indexRef.current = 0;
      setDuration(saved.track.durationSeconds ?? 0);
      setCurrentTime(saved.position);
      audio.src = saved.track.audioUrl;
      const cue = () => {
        audio.currentTime = saved.position;
        audio.removeEventListener("loadedmetadata", cue);
      };
      audio.addEventListener("loadedmetadata", cue);
      audio.load();
      setStatus("paused");
    }
    /* eslint-enable react-hooks/set-state-in-effect */

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

  const play = useCallback(
    (newTrack: Track, nextQueue?: Track[]) => {
      const audio = audioRef.current;
      if (!audio) return;

      /* Establish the list this track belongs to. A caller that passes no
         queue is playing a one-off — the track becomes a queue of itself, so
         `ended` has somewhere to stop rather than a stale list to wander
         into. */
      const q = nextQueue?.length ? nextQueue : [newTrack];
      const idx = Math.max(
        0,
        q.findIndex((t) => t.id === newTrack.id),
      );
      setQueue(q);
      setQueueIndex(idx);
      queueRef.current = q;
      indexRef.current = idx;

      // If the same track is already loaded, just resume
      if (track?.id === newTrack.id && audio.src) {
        audio.play().catch(console.error);
        return;
      }

      startTrack(newTrack);
    },
    [track, startTrack],
  );

  const next = useCallback(() => {
    const q = queueRef.current;
    const i = indexRef.current;
    if (i < 0 || i + 1 >= q.length) return;
    indexRef.current = i + 1;
    setQueueIndex(i + 1);
    startTrack(q[i + 1]);
  }, [startTrack]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    const q = queueRef.current;
    const i = indexRef.current;
    /* Past the first few seconds, "back" means restart this piece. Only a
       press right at the top steps to the previous track. */
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (i <= 0) {
      if (audio) audio.currentTime = 0;
      return;
    }
    indexRef.current = i - 1;
    setQueueIndex(i - 1);
    startTrack(q[i - 1]);
  }, [startTrack]);

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

  /* ── Media Session ──────────────────────────────────────────────────────
     Puts the title, artwork and transport controls on the phone lock screen,
     in the notification shade and on headphone buttons. Without it a listener
     who locks their phone mid-piece has no way to pause without unlocking.
     Guarded because Safari and older browsers ship it partially or not at
     all, and an unguarded setActionHandler throws. */
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    if (!track) {
      ms.metadata = null;
      return;
    }

    ms.metadata = new MediaMetadata({
      title: track.title,
      artist: "Felix Lokko",
      album: track.subtitle || "Floks Speaks",
      artwork: track.coverUrl
        ? [{ src: track.coverUrl, sizes: "512x512", type: "image/jpeg" }]
        : [],
    });

    const safe = (action: MediaSessionAction, handler: (() => void) | null) => {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        /* unsupported action on this browser — nothing to do */
      }
    };

    safe("play", () => audioRef.current?.play().catch(console.error));
    safe("pause", () => audioRef.current?.pause());
    safe("seekbackward", () => skipRef.current?.(-15));
    safe("seekforward", () => skipRef.current?.(15));
    safe("previoustrack", () => previousRef.current?.());
    safe("nexttrack", () => (hasNextRef.current ? nextRef.current?.() : undefined));
    /* Without seekto the lock-screen scrubber is drawn but inert: setPositionState
       below tells the OS where we are, so it renders a draggable bar, and
       dragging it did nothing. The two have to be registered together. */
    safe("seekto", ((details: MediaSessionActionDetails) => {
      const el = audioRef.current;
      if (!el || typeof details.seekTime !== "number") return;
      if (details.fastSeek && "fastSeek" in el) {
        (el as HTMLAudioElement & { fastSeek: (t: number) => void }).fastSeek(
          details.seekTime,
        );
        return;
      }
      el.currentTime = details.seekTime;
    }) as unknown as () => void);

    return () => {
      (
        [
          "play",
          "pause",
          "seekbackward",
          "seekforward",
          "previoustrack",
          "nexttrack",
          "seekto",
        ] as MediaSessionAction[]
      ).forEach((a) => safe(a, null));
    };
  }, [track]);

  /* Keep the lock-screen scrubber honest. Chrome draws its own progress bar
     from this, and without it the bar sits frozen at zero. */
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!("setPositionState" in navigator.mediaSession)) return;
    if (!duration || !Number.isFinite(duration)) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: Math.min(currentTime, duration),
        playbackRate: 1,
      });
    } catch {
      /* position outside duration during a track change — next tick fixes it */
    }
  }, [currentTime, duration]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState =
      status === "playing" ? "playing" : status === "paused" ? "paused" : "none";
  }, [status]);

  /* Remember the listener's place.
     Every five seconds rather than on every timeupdate, which fires about
     four times a second and would mean a synchronous JSON write on each one.
     pagehide catches the common case the timer misses: closing the tab
     between ticks. It fires where beforeunload does not, notably when iOS
     Safari moves a tab to the background. */
  useEffect(() => {
    if (!track) return;

    const write = () => {
      const el = audioRef.current;
      if (!el) return;
      const position = el.currentTime;
      /* The first seconds are not worth restoring into, and a finished piece
         should start again rather than resume at its last breath. */
      if (position < 10) return;
      if (el.duration && position > el.duration - 5) {
        try {
          window.localStorage.removeItem(RESUME_KEY);
        } catch {
          /* storage unavailable — nothing to clear */
        }
        return;
      }
      try {
        window.localStorage.setItem(
          RESUME_KEY,
          JSON.stringify({ track, position }),
        );
      } catch {
        /* Private mode or a full quota. Resuming is a convenience. */
      }
    };

    const id = window.setInterval(write, 5000);
    window.addEventListener("pagehide", write);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("pagehide", write);
      write();
    };
  }, [track]);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration || 0));
  }, []);

  // Keep the Media Session refs pointed at the latest closures.
  nextRef.current = next;
  previousRef.current = previous;
  skipRef.current = skip;
  hasNextRef.current = queueIndex >= 0 && queueIndex + 1 < queue.length;

  return (
    <Ctx.Provider
      value={{
        track,
        queue,
        queueIndex,
        hasNext: queueIndex >= 0 && queueIndex + 1 < queue.length,
        hasPrevious: queueIndex > 0,
        status,
        currentTime,
        duration,
        volume,
        muted,
        play,
        next,
        previous,
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
