/* ==========================================================================
   POST /api/subscribe

   Adds a contact to the Brevo (Sendinblue) mailing list via their Contacts
   API. Uses double opt-in (DOI) so the subscriber must confirm by email
   before they start receiving campaigns.

   Env vars required in Netlify:
     BREVO_API_KEY       — v3 API key from https://app.brevo.com/settings/keys/api
     BREVO_LIST_ID       — numeric list ID (Contacts → Lists → click the list)
     BREVO_DOI_TEMPLATE  — DOI confirmation template ID (set up in Brevo)
     BREVO_REDIRECT_URL  — URL the subscriber lands on after confirming
                           (defaults to the site home page)
   ========================================================================== */

import { NextResponse } from "next/server";

const BREVO_API = "https://api.brevo.com/v3/contacts/doubleOptinConfirmation";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 },
      );
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error("[subscribe] BREVO_API_KEY is not set");
      return NextResponse.json(
        { error: "Newsletter service is not configured yet." },
        { status: 503 },
      );
    }

    const listId = Number(process.env.BREVO_LIST_ID);
    if (!listId) {
      console.error("[subscribe] BREVO_LIST_ID is not set or invalid");
      return NextResponse.json(
        { error: "Newsletter service is not configured yet." },
        { status: 503 },
      );
    }

    const templateId = Number(process.env.BREVO_DOI_TEMPLATE);
    if (!templateId) {
      console.error("[subscribe] BREVO_DOI_TEMPLATE is not set or invalid");
      return NextResponse.json(
        { error: "Newsletter service is not configured yet." },
        { status: 503 },
      );
    }

    const redirectUrl =
      process.env.BREVO_REDIRECT_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      "https://floksspeaks.org";

    const res = await fetch(BREVO_API, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        includeListIds: [listId],
        templateId,
        redirectionUrl: redirectUrl,
      }),
    });

    if (res.status === 201 || res.status === 204) {
      return NextResponse.json({ ok: true });
    }

    // Brevo returns 400 when the contact already exists and is confirmed
    if (res.status === 400) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.message ?? "";

      if (msg.toLowerCase().includes("already exist")) {
        return NextResponse.json({ ok: true });
      }

      console.error("[subscribe] Brevo 400:", msg);
      return NextResponse.json(
        { error: "Could not subscribe. Please try again." },
        { status: 400 },
      );
    }

    const errorBody = await res.text().catch(() => "");
    console.error(`[subscribe] Brevo ${res.status}:`, errorBody);
    return NextResponse.json(
      { error: "Could not subscribe. Please try again later." },
      { status: 502 },
    );
  } catch (err) {
    console.error("[subscribe] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
