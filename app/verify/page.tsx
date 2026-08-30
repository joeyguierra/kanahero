"use client";

// Stroke-data acceptance page: renders all 142 kana animating so the vendored
// data can be eyeballed before anything is built on top of it.
// Not part of the app's four screens — it exists for verification only.

import { useState } from "react";
import { HIRAGANA, KATAKANA } from "@/lib/kana";
import StrokeChar from "@/components/StrokeChar";

const ALL = [...HIRAGANA, ...KATAKANA];

export default function VerifyPage() {
  const [run, setRun] = useState(0);

  return (
    <main className="verify">
      <header className="verifyHeader">
        <h1>stroke data check — {ALL.length} kana</h1>
        <p>
          Each tile should draw the way a pen writes: stroke by stroke, in order, each stroke
          growing from its start point. Tap a tile to replay it.
        </p>
        <button type="button" className="verifyReplay" onClick={() => setRun((n) => n + 1)}>
          Replay all
        </button>
      </header>
      <div className="verifyGrid" key={run}>
        {ALL.map((kana) => (
          <StrokeChar key={kana.hex} kana={kana} />
        ))}
      </div>
      <footer className="verifyFooter">
        Stroke data from strokesvg (MIT), derived from Klee One (SIL OFL 1.1) —{" "}
        <a href="/licenses/strokesvg-LICENSE.txt">licenses</a>
      </footer>
    </main>
  );
}
