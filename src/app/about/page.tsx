import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

/* Route stub. The layout shell, theme switching and nav state are live here;
   the page content is ported in the next Phase 2 pass. Kept as a real route so
   navigation, prefetch and the Ivory/Midnight theme switch can be tested now. */
export default function Page() {
  return (
    <section className="mx-auto w-full max-w-site px-(--spacing-gut) py-24">
      <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-amber-ink">
        Phase 2
      </p>
      <h1 className="font-display text-h1 font-bold">About</h1>
      <p className="mt-5 text-lede opacity-80">
        Shell is live. Content ports in the next pass.
      </p>
    </section>
  );
}
