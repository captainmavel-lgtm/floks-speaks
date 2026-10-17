/**
 * POST /api/audio/upload
 *
 * Accepts an MP3 file from Felix (via Sanity Studio or the admin upload form),
 * streams it directly to Cloudflare R2, and returns the public CDN URL.
 *
 * Security:
 *  - Requires the UPLOAD_SECRET header to match AUDIO_UPLOAD_SECRET env var.
 *    Set this in .env.local and in Netlify env vars.
 *  - Only accepts audio/mpeg (MP3) files.
 *  - Max file size: 200 MB (podcast episodes rarely exceed this).
 *
 * Usage (from Sanity Studio custom action or upload page):
 *   const form = new FormData()
 *   form.append('file', mp3File)
 *   form.append('slug', 'episode-slug')        // becomes the R2 object key
 *   const res = await fetch('/api/audio/upload', {
 *     method: 'POST',
 *     headers: { 'x-upload-secret': process.env.UPLOAD_SECRET },
 *     body: form,
 *   })
 *   const { url } = await res.json()
 *   // url === 'https://media.floksspeaks.org/episodes/episode-slug.mp3'
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB

// ── CORS — allow Sanity Studio to call this endpoint ────────────────────────
const ALLOWED_ORIGINS = [
  "https://floks-speaks.sanity.studio",
  "http://localhost:3333", // local Sanity dev
  "http://localhost:3000", // local Next.js dev
];

function corsHeaders(req: NextRequest): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-upload-secret",
    "Access-Control-Max-Age": "86400",
  };
}

/** Preflight handler for CORS */
export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const cors = corsHeaders(req);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = req.headers.get("x-upload-secret");
  if (!secret || secret !== process.env.AUDIO_UPLOAD_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors });
  }

  // ── Parse form ────────────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400, headers: cors });
  }

  const file = formData.get("file") as File | null;
  const slug = formData.get("slug") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400, headers: cors });
  }
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "slug is required and must be lowercase letters, numbers and hyphens only" },
      { status: 400, headers: cors }
    );
  }

  // ── Validate type ─────────────────────────────────────────────────────────
  if (!["audio/mpeg", "audio/mp3"].includes(file.type)) {
    return NextResponse.json(
      { error: "Only MP3 files are accepted (audio/mpeg)" },
      { status: 415, headers: cors }
    );
  }

  // ── Validate size ─────────────────────────────────────────────────────────
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Maximum is ${MAX_BYTES / 1024 / 1024} MB` },
      { status: 413, headers: cors }
    );
  }

  // ── Upload to R2 ──────────────────────────────────────────────────────────
  const key = `episodes/${slug}.mp3`;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

  // Refuse to overwrite an existing episode's audio unless the caller said so
  // explicitly. Podcast apps and the website already point at these files, so
  // a silent overwrite from a mistyped slug would swap one episode's audio for
  // another's.
  const allowReplace = formData.get("allowReplace") === "true";
  if (!allowReplace) {
    try {
      await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      // HeadObject succeeded, so the object is already there.
      return NextResponse.json(
        {
          error: `An audio file already exists for the slug "${slug}". Confirm the replacement to overwrite it.`,
          exists: true,
          key,
        },
        { status: 409, headers: cors }
      );
    } catch {
      // Not found (or not reachable) — fall through and upload.
    }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: "audio/mpeg",
        ContentLength: buffer.byteLength,
        // Cache for 1 year — audio files are immutable once published
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
  } catch (err) {
    console.error("[audio/upload] R2 upload failed:", err);
    return NextResponse.json(
      { error: "Upload to storage failed. Check server logs." },
      { status: 502, headers: cors }
    );
  }

  // ── Build public URL ──────────────────────────────────────────────────────
  // Use the custom subdomain if available, fall back to the R2 dev URL
  const cdnBase =
    process.env.NEXT_PUBLIC_AUDIO_CDN_URL ||
    process.env.NEXT_PUBLIC_AUDIO_CDN_FALLBACK;

  const publicUrl = `${cdnBase}/${key}`;

  return NextResponse.json(
    {
      url: publicUrl,
      key,
      size: file.size,
      slug,
    },
    { status: 201, headers: cors }
  );
}

// ── HEAD /api/audio/upload?key=episodes/slug.mp3 ─────────────────────────────
// Lets the upload form check if a file already exists before uploading.
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-upload-secret");
  if (!secret || secret !== process.env.AUDIO_UPLOAD_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "key param required" }, { status: 400 });
  }

  try {
    await r2.send(
      new HeadObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: key,
      })
    );
    return NextResponse.json({ exists: true });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
