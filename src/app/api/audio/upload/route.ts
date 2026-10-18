/**
 * POST /api/audio/upload
 *
 * Returns a short-lived presigned URL that the browser uses to PUT an episode
 * MP3 straight into Cloudflare R2.
 *
 * Why presigned rather than streaming the file through here: Netlify Functions
 * cap request bodies at roughly 6 MB on every plan, and podcast episodes run
 * far larger than that. Posting the file to this route would fail for any real
 * episode, so the file never touches Netlify — this route only signs a URL,
 * and the bytes go from the browser to R2 directly.
 *
 * Security:
 *  - Requires the x-upload-secret header to match AUDIO_UPLOAD_SECRET.
 *  - The signed URL is valid for 10 minutes and for one exact object key.
 *  - Refuses to sign over an existing object unless allowReplace is set, so a
 *    mistyped slug cannot overwrite a published episode's audio.
 *
 * Request body (JSON):
 *   { slug: string, size?: number, allowReplace?: boolean }
 *
 * Response (201):
 *   { uploadUrl: string, publicUrl: string, key: string }
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB
const URL_TTL_SECONDS = 600; // 10 minutes

/**
 * CORS: the studio is served from a different origin, so it needs these.
 *
 * Allow-Origin is "*" deliberately. Authentication here is a header secret,
 * not a cookie, so there is no ambient authority for a restrictive origin list
 * to protect — and CORS never constrains non-browser clients anyway. Pinning
 * the origin would buy nothing and silently breaks the studio if its hostname
 * changes.
 */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-upload-secret",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function r2Client() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = req.headers.get("x-upload-secret");
  if (!secret || secret !== process.env.AUDIO_UPLOAD_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }

  // ── Parse ─────────────────────────────────────────────────────────────────
  let body: { slug?: string; size?: number; allowReplace?: boolean };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Expected a JSON body" }, 400);
  }

  const { slug, size, allowReplace } = body;

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return json(
      { error: "slug is required and must be lowercase letters, numbers and hyphens only" },
      400
    );
  }

  if (typeof size === "number" && size > MAX_BYTES) {
    return json({ error: `File too large. Maximum is ${MAX_BYTES / 1024 / 1024} MB` }, 413);
  }

  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
  const key = `episodes/${slug}.mp3`;
  const r2 = r2Client();

  // ── Refuse to clobber an existing episode unless asked ────────────────────
  if (!allowReplace) {
    try {
      await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return json(
        {
          error: `An audio file already exists for the slug "${slug}". Confirm the replacement to overwrite it.`,
          exists: true,
          key,
        },
        409
      );
    } catch {
      // Not found — go ahead and sign.
    }
  }

  // ── Sign ──────────────────────────────────────────────────────────────────
  let uploadUrl: string;
  try {
    uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: "audio/mpeg",
      }),
      { expiresIn: URL_TTL_SECONDS }
    );
  } catch (err) {
    console.error("[audio/upload] Could not presign:", err);
    return json({ error: "Could not prepare the upload. Check server logs." }, 502);
  }

  const cdnBase =
    process.env.NEXT_PUBLIC_AUDIO_CDN_URL || process.env.NEXT_PUBLIC_AUDIO_CDN_FALLBACK;

  return json(
    {
      uploadUrl,
      publicUrl: `${cdnBase}/${key}`,
      key,
      expiresIn: URL_TTL_SECONDS,
    },
    201
  );
}

/**
 * GET /api/audio/upload?key=episodes/slug.mp3
 * Reports whether an object already exists.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-upload-secret");
  if (!secret || secret !== process.env.AUDIO_UPLOAD_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }

  const key = req.nextUrl.searchParams.get("key");
  if (!key) return json({ error: "key param required" }, 400);

  try {
    await r2Client().send(
      new HeadObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: key,
      })
    );
    return json({ exists: true }, 200);
  } catch {
    return json({ exists: false }, 200);
  }
}
