"use client";

import { useRef, useState } from "react";

/* ============================================================================
   CONTACT FORM

   Validation is our own, not the browser's: novalidate is set so the messages
   are in the site's voice and in the site's type, and so the first invalid
   field receives focus rather than a native bubble that a screen reader may
   not announce. Each message is tied to its field with aria-describedby and
   the field carries aria-invalid, which is what makes the error reach
   assistive technology at all (WCAG 3.3.1).

   The endpoint is read from NEXT_PUBLIC_FORMSPREE_ENDPOINT. It is deliberately
   not hard-coded and not committed: Phase 7 sets it as an environment variable
   in Netlify. Until it is set the form validates and tells the reader plainly
   that sending is not connected yet, rather than pretending to succeed.
   ========================================================================= */

const ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ?? "";

const ENQUIRY_TYPES = ["Booking", "Collaboration", "Media / Press", "General"];

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export default function ContactForm() {
  const [enquiry, setEnquiry] = useState("Booking");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Errors = {};

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name) next.name = "Add your name so Floks knows who to reply to.";
    if (!email) next.email = "Add an email address for the reply.";
    // Deliberately loose. A strict pattern rejects valid addresses, and the
    // address is verified by the reply landing or not landing.
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "That address is missing something. Check it over.";
    if (!message) next.message = "Tell him a little about it, even a line.";

    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${first}"]`)
        ?.focus();
      return;
    }

    if (!ENDPOINT) {
      setState("failed");
      return;
    }

    setState("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      setState(res.ok ? "sent" : "failed");
      if (res.ok) {
        formRef.current?.reset();
        setEnquiry("Booking");
        requestAnimationFrame(() => sentRef.current?.focus());
      }
    } catch {
      setState("failed");
    }
  }

  const isBooking = enquiry === "Booking";

  return (
    <>
      <form
        ref={formRef}
        noValidate
        onSubmit={onSubmit}
        className="rounded-2xl border border-midnight/14 bg-[#fffdf9] p-[clamp(24px,4vw,40px)]"
      >
        {/* The enquiry type is a radio group, not a select: four options that
            all fit, and the choice changes which fields appear below. */}
        <fieldset className="m-0 mb-7 border-none p-0">
          <legend className="mb-3.5 p-0 text-[0.75rem] uppercase tracking-[0.08em] text-midnight/60">
            What is this about?
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {ENQUIRY_TYPES.map((t) => (
              <label key={t} className="pick">
                <input
                  type="radio"
                  name="enquiry"
                  value={t}
                  checked={enquiry === t}
                  onChange={() => setEnquiry(t)}
                />
                {t}
              </label>
            ))}
          </div>
        </fieldset>

        <Field
          id="cn"
          name="name"
          label="Your name"
          autoComplete="name"
          error={errors.name}
        />
        <Field
          id="ce"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          error={errors.email}
        />

        {isBooking && (
          <>
            <Field id="cd" name="event_date" type="date" label="Event date" optional />
            <Field
              id="cv"
              name="venue"
              label="Venue or town"
              optional
              placeholder="Church, campus, conference hall, city"
            />
          </>
        )}

        <Field id="cs" name="subject" label="Subject" optional />

        <div className="field">
          <label htmlFor="cm">Message</label>
          <textarea
            id="cm"
            name="message"
            rows={6}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "cm-err" : undefined}
            placeholder="The occasion, the date, the place, whatever you have so far."
          />
          {errors.message && <FieldError id="cm-err">{errors.message}</FieldError>}
        </div>

        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-amber px-[30px] text-[0.9375rem] font-semibold text-midnight disabled:opacity-60"
        >
          {state === "sending" ? "Sending" : "Send enquiry"}
        </button>

        <p className="mt-[18px] text-[0.8125rem] leading-[1.65] text-midnight/60">
          Submissions go through Formspree, which also handles spam filtering.
          Your details are used to reply to you and nothing else. See the{" "}
          <a href="/privacy" className="text-amber-ink underline underline-offset-2">
            privacy policy
          </a>
          .
        </p>
      </form>

      {state === "sent" && (
        <div
          ref={sentRef}
          role="status"
          tabIndex={-1}
          className="mt-6 flex items-center gap-4 rounded-xl border border-[#3d6b35] bg-[#e4ecdf] px-6 py-5"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2f5529"
            strokeWidth="2.2"
            aria-hidden="true"
            className="h-[22px] w-[22px] shrink-0"
          >
            <path d="m4 12.5 5 5L20 6.5" />
          </svg>
          <div>
            <p className="m-0 font-semibold text-[#24411f]">Sent. Thank you.</p>
            <p className="m-0 text-[0.9375rem] text-midnight/68">
              Floks will come back to you.
            </p>
          </div>
        </div>
      )}

      {state === "failed" && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-[#8a2f2f] bg-[#f3e2df] px-6 py-5"
        >
          <p className="m-0 font-semibold text-[#5e1f1f]">
            {ENDPOINT ? "That did not send." : "Sending is not connected yet."}
          </p>
          <p className="m-0 mt-1 text-[0.9375rem] text-midnight/72">
            Email Floks directly at{" "}
            <a
              href="mailto:floksspeaks@gmail.com"
              className="text-amber-ink underline underline-offset-2"
            >
              floksspeaks@gmail.com
            </a>{" "}
            and he will pick it up there.
          </p>
        </div>
      )}
    </>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  optional,
  placeholder,
  autoComplete,
  error,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  optional?: boolean;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {optional && (
          <span className="font-normal text-midnight/66"> (optional)</span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {error && <FieldError id={`${id}-err`}>{error}</FieldError>}
    </div>
  );
}

/* #8a2f2f is 6.1:1 on Ivory. The message is text, not a red outline, because
   colour alone cannot carry the error (WCAG 1.4.1). */
function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-2 text-[0.8125rem] font-semibold text-[#8a2f2f]">
      {children}
    </p>
  );
}
