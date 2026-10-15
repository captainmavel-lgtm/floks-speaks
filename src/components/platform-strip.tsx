import Image from "next/image";
import { PLATFORMS } from "@/lib/site";

/* ============================================================================
   PLATFORM STRIP

   Like the footer, this is Midnight on every page and pins its own surface.
   On the Ivory pages it and the footer form one continuous dark block closing
   the page. That is intended, not a bug.
   ========================================================================= */

export default function PlatformStrip() {
  return (
    <section className="bg-midnight text-ivory border-t border-hairline">
      <div className="mx-auto w-full max-w-site px-(--spacing-gut) py-14">
        <h2 className="font-display mb-3 text-h2 font-semibold">Listen everywhere</h2>
        <p className="mb-8 text-ivory/70">
          The same recordings, wherever you already listen.
        </p>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
          {PLATFORMS.map((p) => (
            <a
              key={p.id}
              href={p.href}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center opacity-90 transition-opacity hover:opacity-100"
            >
              <Image
                src={`/platforms/${p.id}.png`}
                alt={`Listen on ${p.label}`}
                width={140}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
