"use client";

// S9 — what ships, and whose work it is.
//
// Only the lines the licenses actually require: KanjiVG's CC BY-SA asks for a
// visible credit with the license name and a link, so it gets one. The rest
// are satisfied by the texts in public/licenses, and are named here because
// naming them costs one line each.

import { useJokerLine } from "@/lib/joker-lines";
import Joker from "./Joker";

const CREDITS = [
  {
    name: "strokesvg",
    license: "MIT",
    href: "https://github.com/zhengkyl/strokesvg",
    note: "kana stroke data",
  },
  {
    name: "Klee One",
    license: "SIL OFL 1.1",
    href: "https://github.com/fontworks-fonts/Klee",
    note: "kana strokes derived",
  },
  {
    name: "KanjiVG",
    license: "CC BY-SA 3.0",
    href: "https://kanjivg.tagaini.net/",
    note: "kanji stroke data, modified",
  },
];

export default function Credits({ onBack }: { onBack: () => void }) {
  const line = useJokerLine("credits");
  return (
    <main className="frame">
      <div className="screenHead">
        <button type="button" className="backLink" onClick={onBack}>
          ← HOME
        </button>
        <span className="screenTitle">CREDITS</span>
      </div>

      <Joker line={line.text} lineId={line.id} className="jokerDeck" />

      <div className="legend legendSpaced">SHIPPED WITH THIS APP</div>
      <ul className="creditList">
        {CREDITS.map((c) => (
          <li key={c.name} className="creditRow">
            <a href={c.href} className="creditName">
              {c.name}
            </a>
            <span className="creditLicense">{c.license}</span>
            <span className="creditNote">{c.note}</span>
          </li>
        ))}
        <li className="creditRow">
          <span className="creditName">Archivo · JetBrains Mono · Noto Sans JP</span>
          <span className="creditLicense">SIL OFL 1.1</span>
          <span className="creditNote">interface type</span>
        </li>
      </ul>

      <div className="grow" />
      <a className="attribution" href="/licenses/NOTICE.txt">
        FULL LICENSE TEXTS
      </a>
    </main>
  );
}
