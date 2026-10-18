/**
 * GET /api/audio/cors-setup?secret=<AUDIO_UPLOAD_SECRET>
 *
 * One-time setup. The studio now uploads episode audio straight to Cloudflare
 * R2 using a presigned URL, which means the browser makes a cross-origin PUT
 * to the bucket. R2 rejects that unless the bucket itself carries a CORS
 * policy naming the studio's origin.
 *
 * This route applies that policy using the R2 credentials the server already
 * holds, so nobody has to copy keys around or hunt through the Cloudflare
 * dashboard. The secret is accepted as a query parameter rather than a header
 * so it can simply be opened in a browser.
 *
 * Safe to run more than once — PutBucketCors replaces the whole policy, so
 * repeat calls are idempotent rather than cumulative.
 */

import {
  S3Client,
  PutBucketCorsCommand,
  GetBucketCorsCommand,
} from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

/** Origins allowed to PUT directly into the bucket. */
const ALLOWED_ORIGINS = [
  "https://floks-speaks.sanity.studio",
  "http://localhost:3333",
  "http://localhost:3000",
];

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.AUDIO_UPLOAD_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

  const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });

  try {
    await r2.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: ALLOWED_ORIGINS,
              AllowedMethods: ["PUT", "GET", "HEAD"],
              AllowedHeaders: ["*"],
              ExposeHeaders: ["ETag"],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      })
    );
  } catch (err) {
    console.error("[audio/cors-setup] Could not apply CORS policy:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Could not apply the CORS policy. Check server logs.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }

  // Read it back so the response proves what actually landed on the bucket.
  let applied: unknown = null;
  try {
    const current = await r2.send(new GetBucketCorsCommand({ Bucket: bucket }));
    applied = current.CORSRules;
  } catch {
    // Some S3-compatible endpoints lag on read-after-write here; the PUT
    // succeeded, so this is not worth failing the request over.
  }

  return NextResponse.json({
    ok: true,
    bucket,
    message: "CORS policy applied. The studio can now upload audio directly to R2.",
    allowedOrigins: ALLOWED_ORIGINS,
    applied,
  });
}
