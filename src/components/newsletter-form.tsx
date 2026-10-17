"use client";

/**
 * NewsletterForm
 *
 * Shared newsletter subscribe form used on homepage and blog page.
 * Submits to Brevo (formerly Sendinblue) via their public-facing
 * subscription endpoint. Uses the DOI (double opt-in) flow so the
 * subscriber receives a confirmation email first.
 *
 * The form posts to a Next.js API route (/api/subscribe) which calls
 * the Brevo API server-side, keeping the API key out of the browser.
 */

import { FormEvent, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function NewsletterForm({
  inputId = "nl",
}: {
  /** HTML id for the email input — must be unique per page */
  inputId?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message ?? "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="min-w-0 flex-[1_1_380px] rounded-2xl border border-amber/30 bg-amber/[0.06] p-6">
        <p className="m-0 text-[1.0625rem] font-semibold text-ivory">
          Check your inbox ✓
        </p>
        <p className="mt-2 text-[0.9375rem] leading-[1.6] text-ivory/70">
          A confirmation email is on its way. Click the link inside to complete
          your subscription.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 flex-[1_1_380px]"
    >
      <label
        htmlFor={inputId}
        className="mb-3 block text-[0.8125rem] uppercase tracking-[0.08em] text-ivory/60"
      >
        Email address
      </label>
      <div className="flex flex-wrap gap-3">
        <input
          id={inputId}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={status === "submitting"}
          className="min-h-[52px] min-w-0 flex-[1_1_220px] rounded-full border border-edge-dark bg-[#1a1b21] px-5 text-ivory placeholder:text-placeholder-dark disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-amber px-[30px] text-[0.9375rem] font-semibold text-midnight transition-[background,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#F7BD6E] disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {status === "submitting" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>

      {status === "error" && (
        <p className="mt-3 text-[0.875rem] text-red-400">{errorMsg}</p>
      )}

      <p className="mt-3.5 text-[0.8125rem] leading-[1.6] text-ivory/66">
        Double opt-in. You will get a confirmation email first. Unsubscribe any
        time.
      </p>
    </form>
  );
}
