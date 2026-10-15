/* ============================================================================
   DRAFT NOTICE

   Privacy and Terms are both unreviewed, and the reader deserves to know that
   before they rely on either. Removing this is a deliberate act at the end of
   the legal check, not something to tidy away: Build Bible Phase 1 holds the
   gate open until the review lands.

   #e9e2d6 on Ivory is a 1.08:1 surface change, so the notice is marked by its
   border, icon and bold lead-in as well, never by the fill alone.
   ========================================================================= */

export default function DraftNotice({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-9 flex items-start gap-3.5 rounded-xl border border-hairline-ink bg-[#e9e2d6] px-[22px] py-5">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#865009"
        strokeWidth="1.7"
        aria-hidden="true"
        className="mt-0.5 h-5 w-5 shrink-0"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.2v.2" />
      </svg>
      <p className="m-0 text-[0.9375rem] leading-[1.65] text-midnight/78">
        {children}
      </p>
    </div>
  );
}
