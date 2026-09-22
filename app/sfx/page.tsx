"use client";

// The sound board — every cue in the v5d inventory, on one screen, with the
// gesture that fires it. INTERNAL: not linked from anywhere in the app, the
// same way /verify is not.
//
// WHY THIS EXISTS: the only way to hear hand.tick was to run a drill to the
// grade, and the only way to hear the reveal was to finish a run. Twenty-eight
// cues cannot be tuned that way. This page plays each one on a button, and —
// the part a soundboard usually misses — plays them inside the timing of the
// screen they belong to, off the app's own constants (rigs.tsx).
//
// It is also the upload checklist. Half the table has no bytes yet; a row with
// no file says NOT BAKED, its buttons report the miss in the log rather than
// doing nothing, and RESCAN picks up a fresh bake without a reload. The
// sequence: drop the generation in sfx-src/, `npm run sfx`, RESCAN.
//
// Related and deliberately separate: `npm run sfx:lab` (scripts/sfx-lab.mjs) is
// the TRIM rig — it decides where a file starts and how loud it is, and it can
// write that decision to disk, which a page inside a static export cannot. This
// is the AUDITION rig: is the cue right, in place, against its neighbours.
//
// It ships in the export and the service worker precaches it, as /verify does.
// That is the cost of being reachable on the phone the app is tuned on, and it
// is a few kB of JSX and no new audio — every file it plays is one the app
// already ships.

import { useEffect } from "react";

// The lab's decisions, compiled in. `sfx-src/sfx.config.json` is what was
// settled by ear and what the bake actually applied, so it — not the
// inventory's prose cap — is what a baked file should be held to. It is a
// build-time import: change it and re-bake, and the page picks both up on the
// next reload, which is the same moment the .m4a changes anyway.
import tuned from "@/sfx-src/sfx.config.json";
import { CUES, LADDER, SILENT, TIERS, type Cue } from "./inventory";
import { ChromeRig, DealRig, InkRig, RevealRig, TalkRig } from "./rigs";
import { useBoard, type Board } from "./useBoard";

/** four plays at the cue's own worst-case spacing — the fatigue test, and the
    only way to see whether a round-robin is doing anything */
const REPEAT = [0, 380, 760, 1140];

const TUNED: Record<string, { ms?: number; peak?: number }> = tuned;

/**
 * What this file was supposed to come out as, and whether it did.
 *
 * The bar is the lab's config where there is one, and the inventory's cap
 * where there is not — a cue tuned by ear at 245 ms is not off spec, it is a
 * decision, and flagging it would train you to ignore the flag. A derived cue
 * measures its parent's file and is never judged on its own.
 */
function against(cue: Cue, m: { ms: number; peakDb: number }) {
  if (cue.rate || cue.gainDb) return { tuned: false, off: false, smears: false };
  const decided = TUNED[cue.file];
  const ms = decided?.ms ?? cue.capMs;
  const peak = decided?.peak ?? cue.peakDb;
  return {
    tuned: !!decided,
    // the tail is still sounding when the next one starts
    smears: !!cue.gapMs && m.ms > cue.gapMs,
    // 1.5 dB is the window the bake's own report calls converged; a few ms of
    // slack covers the encoder's frame padding
    off: (!!ms && m.ms > ms + 12) || (!!peak && Math.abs(m.peakDb - peak) > 1.5),
  };
}

function Row({ cue, board }: { cue: Cue; board: Board }) {
  const found = board.files[cue.file] ?? [];
  const state = cue.synth ? "synth" : found.length ? "ready" : "missing";
  const measured = board.stats[cue.file];

  return (
    <div className={`cue cue-${state}`}>
      <div className="cueTop">
        <span className="cueDot" aria-hidden />
        <span className="cueName">{cue.name}</span>
        {cue.file !== cue.name && <span className="cueFrom">{cue.file}</span>}
        {cue.rate && <span className="cueFrom">@ {cue.rate}</span>}
        {cue.gainDb && <span className="cueFrom">{cue.gainDb} dB</span>}
        <span className="cueGrow" />
        <span className="cueSpec">{cue.spec}</span>
      </div>

      <div className="cueWhere">{cue.where}</div>
      <p className="cueNote">{cue.note}</p>
      {cue.amended && <p className="cueAmend">AMENDED · {cue.amended}</p>}

      <div className="cueActions">
        <span className="cueState">
          {state === "synth"
            ? "SYNTHESIZED — no file"
            : found.length
              ? `BAKED · ${found.length} file${found.length > 1 ? "s" : ""}`
              : "NOT BAKED"}
        </span>
        {measured &&
          (() => {
            const verdict = against(cue, measured);
            return (
              <span className={`cueReal${verdict.off || verdict.smears ? " cueRealOff" : ""}`}>
                {measured.ms} ms · {measured.peakDb.toFixed(1)} dB
                {measured.files > 1 ? ` · ${measured.files} variants` : ""}
                {verdict.tuned ? " · TUNED" : ""}
                {verdict.off ? " · OFF SPEC" : ""}
                {verdict.smears ? ` · RUNS PAST ITS ${cue.gapMs} MS GAP` : ""}
              </span>
            );
          })()}
        {cue.held && <span className="cueHeld">HELD</span>}
        <span className="cueGrow" />
        {cue.loop ? (
          <a className="cueBtn" href="#rig-ink">
            DRAW IT →
          </a>
        ) : (
          <>
            <button type="button" className="cueBtn" onClick={() => board.fire(cue.name)}>
              PLAY
            </button>
            <button
              type="button"
              className="cueBtn"
              onClick={() => board.fireSeq(REPEAT.map((ms) => ({ name: cue.name, ms })))}
            >
              ×4
            </button>
          </>
        )}
        {cue.rig && (
          <a className="cueBtn cueBtnGhost" href={`#rig-${cue.rig}`}>
            IN CONTEXT →
          </a>
        )}
      </div>
    </div>
  );
}

export default function SoundBoardPage() {
  const board = useBoard();
  const { arm, armed } = board;

  // The context can only open inside a gesture, and every button here is one —
  // but the first tap would then be the tap that decodes rather than the tap
  // that sounds. So the first touch anywhere on the page arms it, and the
  // header button is there for anyone who would rather be explicit.
  useEffect(() => {
    if (armed) return;
    const once = () => arm();
    window.addEventListener("pointerdown", once, { once: true });
    return () => window.removeEventListener("pointerdown", once);
  }, [arm, armed]);

  const wanted = CUES.filter((c) => !c.synth);
  const baked = wanted.filter((c) => (board.files[c.file] ?? []).length);
  const missing = [...new Set(wanted.filter((c) => !(board.files[c.file] ?? []).length).map((c) => c.file))];

  return (
    <main className="board">
      <header className="boardHead">
        <div className="boardTags">
          <span className="boardTag boardTagStrike">V5D</span>
          <span className="boardTag">SOUND BOARD</span>
          <span className="boardTag boardTagGhost">INTERNAL — NOT LINKED FROM THE APP</span>
        </div>
        <h1>Every cue in the inventory, on a button</h1>
        <p>
          {CUES.length} cues over {new Set(wanted.map((c) => c.file)).size} files.{" "}
          <b>{new Set(baked.map((c) => c.file)).size} baked</b>, {missing.length} still to come. A
          cue with no file reports the miss in the log instead of doing nothing — drop the
          generation in <code>sfx-src/</code>, run <code>npm run sfx</code>, then RESCAN.
        </p>
        <div className="boardActions">
          <button type="button" className="btnBone rigBtn" onClick={board.arm}>
            {board.armed ? "ARMED" : "ARM THE CONTEXT"}
          </button>
          <button type="button" className="btnSeam rigBtn" onClick={board.rescan}>
            {board.probing ? "SCANNING…" : "RESCAN /sfx"}
          </button>
          <span className="boardNote">
            Both channels are forced ON here and your saved switches are left alone.
          </span>
        </div>
        {!!missing.length && (
          <p className="boardMissing">
            WAITING ON: {missing.map((f) => `${f}.m4a`).join(" · ")}
          </p>
        )}
      </header>

      <div className="boardRigs">
        <InkRig board={board} />
        <TalkRig board={board} />
        <DealRig board={board} />
        <RevealRig board={board} />
        <ChromeRig board={board} />
      </div>

      {TIERS.map((tier) => (
        <section className="boardTier" key={tier.id}>
          <div className="boardTierHead">
            <span className="boardTag" style={{ background: tier.accent, color: "var(--chassis)" }}>
              {tier.label}
            </span>
            <b>{tier.blurb}</b>
          </div>
          <div className="cueList">
            {CUES.filter((c) => c.tier === tier.id).map((cue) => (
              <Row key={cue.name} cue={cue} board={board} />
            ))}
          </div>
        </section>
      ))}

      <section className="boardTier">
        <div className="boardTierHead">
          <span className="boardTag boardTagGhost">TIER 4</span>
          <b>Deliberately silent — do not build</b>
        </div>
        <div className="boardSilent">
          {SILENT.map((s) => (
            <span key={s.what}>
              <b>{s.what}</b> — {s.why}
            </span>
          ))}
        </div>
      </section>

      <section className="boardTier">
        <div className="boardTierHead">
          <span className="boardTag boardTagBlue">THE MIX</span>
          <b>One ladder, floor to ceiling. Nothing but shiny goes above −12.</b>
        </div>
        <div className="ladder">
          {LADDER.map((step) => (
            <div className="ladderRow" key={step.db}>
              <span className={`ladderDb${step.hot ? " ladderDbHot" : ""}`}>{step.db}</span>
              <div
                className={`ladderBar${step.hot ? " ladderBarHot" : ""}`}
                style={{ width: `${step.width}%` }}
              />
              <span className="ladderCues">{step.cues}</span>
            </div>
          ))}
        </div>
      </section>

      <aside className="boardLog" aria-live="polite">
        <div className="boardLogHead">
          <span className="legend">CUE LOG</span>
          <button type="button" className="cueBtn" onClick={board.clearLog}>
            CLEAR
          </button>
        </div>
        <ol>
          {board.log.map((line) => (
            <li key={line.id} className={line.sounded ? "logHit" : "logMiss"}>
              <span className="logMark">{line.sounded ? "●" : "○"}</span>
              <span className="logName">{line.name}</span>
              {line.ms !== undefined && <span className="logAt">+{line.ms}</span>}
              {line.as && <span className="logAs">{line.as}</span>}
              {!line.sounded && <span className="logWhy">no file</span>}
            </li>
          ))}
          {!board.log.length && <li className="logIdle">nothing has fired yet</li>}
        </ol>
      </aside>
    </main>
  );
}
