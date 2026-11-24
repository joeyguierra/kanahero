"use client";

// Menu — the internal pages, reached from Today's footer. Each one is its own
// route outside the app's screens (/time now; /insights and others later).
//
// For the creator only. Before kanahero is public this has to be redesigned:
// the pages read one person's ledger and were never meant for a stranger
// (docs/backlog.md, "Menu and internal pages before public").

import Link from "next/link";

const PAGES = [{ href: "/time", name: "TIME", note: "study minutes per day" }];

export default function Menu({ onBack }: { onBack: () => void }) {
  return (
    <main className="frame">
      <div className="screenHead">
        <button type="button" className="backLink" onClick={onBack}>
          ← TODAY
        </button>
        <span className="screenTitle">MENU</span>
      </div>

      <ul className="creditList legendSpaced">
        {PAGES.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="creditRow menuRow">
              <span className="creditName">{p.name}</span>
              <span className="creditNote">{p.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
