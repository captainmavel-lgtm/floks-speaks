/**
 * AudioUploadInput — Sanity Studio custom input for the `audioUrl` field.
 *
 * Replaces the plain URL text box with an MP3 uploader that:
 *   1. Takes an MP3 via file picker or drag-and-drop
 *   2. Reads the duration from the audio element's metadata (cheap — it does
 *      not decode the file, so a 90-minute episode costs nothing in memory)
 *   3. POSTs the file to the Next.js /api/audio/upload route, which streams it
 *      to Cloudflare R2 and returns the public CDN URL
 *   4. Writes audioUrl, duration and fileSize onto the document
 *
 * Studio environment variables (set in studio/.env before `sanity deploy`):
 *   SANITY_STUDIO_UPLOAD_URL    — e.g. https://floksspeaks.org
 *   SANITY_STUDIO_UPLOAD_SECRET — must match AUDIO_UPLOAD_SECRET on Netlify
 *
 * Sanity's bundler inlines any process.env.SANITY_STUDIO_* value at build
 * time, so these must be present when the studio is built, not at runtime.
 */

import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { set, unset, useDocumentOperation, useFormValue } from "sanity";
import type { StringInputProps } from "sanity";
import { Box, Button, Card, Flex, Inline, Stack, Text } from "@sanity/ui";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const UPLOAD_URL = (process.env.SANITY_STUDIO_UPLOAD_URL ?? "").replace(/\/$/, "");
const UPLOAD_SECRET = process.env.SANITY_STUDIO_UPLOAD_SECRET ?? "";
const MAX_BYTES = 200 * 1024 * 1024;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Read an MP3's duration in whole seconds using an <audio> element.
 *
 * This reads only the file's metadata. Decoding the file instead (via
 * AudioContext.decodeAudioData) would expand it to raw PCM — roughly 1.3 GB
 * for a one-hour episode — and crash the browser tab.
 */
function readDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = document.createElement("audio");
    audio.preload = "metadata";

    const cleanup = () => URL.revokeObjectURL(url);

    audio.onloadedmetadata = () => {
      const seconds = audio.duration;
      cleanup();
      if (!Number.isFinite(seconds) || seconds <= 0) {
        reject(new Error("Could not determine duration"));
      } else {
        resolve(Math.round(seconds));
      }
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error("Could not read audio metadata"));
    };

    audio.src = url;
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return h > 0
    ? `${h}:${mm}:${String(s).padStart(2, "0")}`
    : `${mm}:${String(s).padStart(2, "0")}`;
}

/** Derive an R2-safe key fragment from a filename, as a slug fallback. */
function slugifyFilename(name: string): string {
  return name
    .replace(/\.mp3$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type Phase = "idle" | "reading" | "uploading" | "saving" | "done" | "confirm-replace";

export function AudioUploadInput(props: StringInputProps) {
  const { onChange, value } = props;

  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  // Escape hatch: upload the MP3 through the Cloudflare dashboard and paste
  // the resulting URL here. Keeps the field usable when the direct uploader
  // cannot run for any reason.
  const [manualEntry, setManualEntry] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const slug = useFormValue(["slug", "current"]) as string | undefined;
  const rawId = useFormValue(["_id"]) as string | undefined;
  const docType = useFormValue(["_type"]) as string | undefined;
  const duration = useFormValue(["duration"]) as number | undefined;
  const fileSize = useFormValue(["fileSize"]) as number | undefined;

  // Document operations work against the published id; strip any draft prefix.
  const publishedId = rawId?.replace(/^drafts\./, "") ?? "";
  const { patch } = useDocumentOperation(publishedId, docType ?? "audioTrack");

  const missingConfig = !UPLOAD_URL || !UPLOAD_SECRET;
  const busy = phase === "reading" || phase === "uploading" || phase === "saving";

  /**
   * Exchange the slug for a presigned URL.
   *
   * The file itself never passes through the site. Netlify's functions cap
   * request bodies at around 6 MB — far below any real episode — so this call
   * carries only a little JSON, and the audio goes to R2 directly.
   */
  const requestPresign = useCallback(
    async (file: File, fileSlug: string, allowReplace: boolean) => {
      const res = await fetch(`${UPLOAD_URL}/api/audio/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-upload-secret": UPLOAD_SECRET,
        },
        body: JSON.stringify({ slug: fileSlug, size: file.size, allowReplace }),
      });

      const data = await res.json().catch(() => ({}) as Record<string, unknown>);

      if (!res.ok) {
        const err = new Error(
          (data.error as string) || `Could not prepare the upload (HTTP ${res.status})`
        ) as Error & { alreadyExists?: boolean };
        err.alreadyExists = data.exists === true;
        throw err;
      }

      return data as { uploadUrl: string; publicUrl: string };
    },
    []
  );

  /** Send the bytes straight to R2, reporting progress as they go. */
  const putToStorage = useCallback(
    (file: File, uploadUrl: string) =>
      new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Storage rejected the upload (HTTP ${xhr.status})`));
          }
        });

        xhr.addEventListener("error", () =>
          reject(
            new Error(
              "Could not reach storage. If this keeps happening, the bucket's CORS policy may not be applied yet."
            )
          )
        );
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", "audio/mpeg");
        xhr.send(file);
      }),
    []
  );

  const runUpload = useCallback(
    async (file: File, allowReplace: boolean) => {
      setError("");

      if (!/^audio\/(mpeg|mp3)$/.test(file.type)) {
        setError("Only MP3 files are accepted.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`File is ${formatBytes(file.size)}. The maximum is 200 MB.`);
        return;
      }

      const fileSlug = slug || slugifyFilename(file.name);
      if (!fileSlug) {
        setError("Add a title and generate the slug first, then upload the audio.");
        return;
      }

      setPendingFile(file);
      setProgress(0);

      // ── 1. Duration ────────────────────────────────────────────────────────
      setPhase("reading");
      setStatusText("Reading audio length…");
      let seconds = 0;
      try {
        seconds = await readDuration(file);
      } catch {
        // Not fatal — the upload still proceeds and we tell them to fill it in.
        seconds = 0;
      }

      // ── 2. Upload ──────────────────────────────────────────────────────────
      setPhase("uploading");
      setStatusText(
        seconds > 0
          ? `${formatDuration(seconds)} · uploading to R2…`
          : "Uploading to R2…"
      );

      let cdnUrl: string;
      try {
        const { uploadUrl, publicUrl } = await requestPresign(file, fileSlug, allowReplace);
        await putToStorage(file, uploadUrl);
        cdnUrl = publicUrl;
      } catch (err) {
        const e = err as Error & { alreadyExists?: boolean };
        if (e.alreadyExists) {
          setPhase("confirm-replace");
          setStatusText("");
          return;
        }
        setError(e.message);
        setPhase("idle");
        setProgress(0);
        return;
      }

      // ── 3. Save the three fields ───────────────────────────────────────────
      setPhase("saving");
      setProgress(100);
      setStatusText("Saving to the document…");

      onChange(set(cdnUrl));

      try {
        const fields: Record<string, number> = { fileSize: file.size };
        if (seconds > 0) fields.duration = seconds;
        patch.execute([{ set: fields }]);
      } catch (err) {
        console.warn("[AudioUploadInput] Could not set duration/fileSize:", err);
        setPhase("done");
        setStatusText(
          seconds > 0
            ? `Uploaded. Enter Duration ${seconds} and File size ${file.size} by hand — they could not be set automatically.`
            : `Uploaded. Enter File size ${file.size} by hand — it could not be set automatically.`
        );
        return;
      }

      setPhase("done");
      setStatusText(
        seconds > 0
          ? `Uploaded · ${formatDuration(seconds)} · ${formatBytes(file.size)}`
          : `Uploaded · ${formatBytes(file.size)} · enter the duration by hand`
      );
    },
    [onChange, patch, requestPresign, putToStorage, slug]
  );

  /* ---- Input handlers ---- */

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) void runUpload(file, false);
    },
    [runUpload]
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (!busy) handleFiles(e.dataTransfer.files);
    },
    [busy, handleFiles]
  );

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = ""; // allow re-picking the same file
    },
    [handleFiles]
  );

  const clearField = useCallback(() => {
    onChange(unset());
    setPhase("idle");
    setStatusText("");
    setError("");
    setProgress(0);
    setPendingFile(null);
  }, [onChange]);

  /* ---- Render ---- */

  // Config missing: explain, and fall back to the plain URL box so the field
  // is still editable rather than being a dead end.
  if (missingConfig) {
    return (
      <Stack space={3}>
        <Card padding={3} radius={2} tone="critical" border>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Audio upload is not configured
            </Text>
            <Text size={1}>
              Set <code>SANITY_STUDIO_UPLOAD_URL</code> and{" "}
              <code>SANITY_STUDIO_UPLOAD_SECRET</code> in <code>studio/.env</code>,
              then rebuild and redeploy the studio. You can paste a URL by hand in
              the meantime.
            </Text>
          </Stack>
        </Card>
        {props.renderDefault(props)}
      </Stack>
    );
  }

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept="audio/mpeg,audio/mp3,.mp3"
      style={{ display: "none" }}
      onChange={onFileChange}
    />
  );

  // A file already exists at this slug — ask before overwriting it.
  if (phase === "confirm-replace") {
    return (
      <Stack space={3}>
        {hiddenInput}
        <Card padding={3} radius={2} tone="caution" border>
          <Stack space={3}>
            <Text size={1} weight="semibold">
              An audio file already exists for this slug
            </Text>
            <Text size={1}>
              Replacing it overwrites the file that podcast apps and the website
              already point at. Only do this if you are correcting the audio for
              this same episode.
            </Text>
            <Inline space={2}>
              <Button
                text="Replace it"
                tone="critical"
                onClick={() => pendingFile && void runUpload(pendingFile, true)}
              />
              <Button
                text="Cancel"
                mode="ghost"
                onClick={() => {
                  setPhase("idle");
                  setPendingFile(null);
                }}
              />
            </Inline>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack space={3}>
      {hiddenInput}

      {/* Saved value */}
      {value && !busy && (
        <Card padding={3} radius={2} tone="transparent" border>
          <Stack space={2}>
            <Text size={0} muted weight="semibold">
              AUDIO FILE
            </Text>
            <Text size={0} muted style={{ wordBreak: "break-all", fontFamily: "monospace" }}>
              {value}
            </Text>
            {(duration || fileSize) && (
              <Text size={1}>
                {duration ? formatDuration(duration) : "duration not set"}
                {fileSize ? ` · ${formatBytes(fileSize)}` : ""}
              </Text>
            )}
          </Stack>
        </Card>
      )}

      {/* Dropzone — shown when there is no file yet */}
      {!value && !busy && !manualEntry && (
        <Stack space={2}>
          <Card
            padding={5}
            radius={2}
            tone={isDragging ? "primary" : "default"}
            border
            style={{ cursor: "pointer", textAlign: "center", borderStyle: "dashed" }}
            onDragOver={onDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <Stack space={2}>
              <Text size={1} weight="semibold">
                Drop an MP3 here, or click to choose a file
              </Text>
              <Text size={0} muted>
                Up to 200 MB. The URL, duration and file size are filled in for you.
              </Text>
            </Stack>
          </Card>
          <Button
            text="Or paste a URL instead"
            mode="bleed"
            fontSize={0}
            onClick={() => setManualEntry(true)}
          />
        </Stack>
      )}

      {/* Manual fallback: upload via the Cloudflare dashboard, paste the URL */}
      {!value && !busy && manualEntry && (
        <Stack space={3}>
          <Card padding={3} radius={2} tone="caution" border>
            <Text size={1}>
              Upload the MP3 in the Cloudflare dashboard (R2 → floks-speaks-audio
              → Upload), then paste its public URL below. Duration and file size
              must then be filled in by hand.
            </Text>
          </Card>
          {props.renderDefault(props)}
          <Button
            text="Back to uploading a file"
            mode="bleed"
            fontSize={0}
            onClick={() => setManualEntry(false)}
          />
        </Stack>
      )}

      {/* Progress */}
      {busy && (
        <Card padding={3} radius={2} tone="primary" border>
          <Stack space={3}>
            <Text size={1}>{statusText}</Text>
            <Box
              style={{
                height: 6,
                borderRadius: 3,
                background: "rgba(127,127,127,0.25)",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "currentColor",
                  transition: "width 0.25s ease",
                }}
              />
            </Box>
            <Text size={0} muted>
              {progress}%
            </Text>
          </Stack>
        </Card>
      )}

      {/* Result / error */}
      {phase === "done" && statusText && !error && (
        <Card padding={3} radius={2} tone="positive" border>
          <Text size={1}>{statusText}</Text>
        </Card>
      )}
      {error && (
        <Card padding={3} radius={2} tone="critical" border>
          <Text size={1}>{error}</Text>
        </Card>
      )}

      {/* Actions */}
      {value && !busy && (
        <Flex gap={2}>
          <Button
            text="Replace audio file"
            mode="ghost"
            fontSize={1}
            onClick={() => inputRef.current?.click()}
          />
          <Button
            text="Clear"
            mode="bleed"
            tone="critical"
            fontSize={1}
            onClick={clearField}
          />
        </Flex>
      )}
    </Stack>
  );
}
