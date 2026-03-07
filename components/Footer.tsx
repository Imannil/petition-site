export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]/30 py-10">
      <div className="mx-auto max-w-2xl px-4 text-center text-sm text-[var(--dim)] space-y-4">
        <p>
          <strong className="text-[var(--cream)]">Privacy:</strong> We do not share your
          personal data. Your email is used to register your signature and
          is never displayed publicly or shared with third parties.
        </p>
        <p>
          Contact:{" "}
          <a
            href="mailto:stopiranwar2026@gmail.com"
            className="text-[var(--red-l)] underline hover:no-underline"
          >
            stopiranwar2026@gmail.com
          </a>
        </p>
        <p className="text-xs">
          stopiranwar.org · Petition for peace · 2026
        </p>
      </div>
    </footer>
  );
}
