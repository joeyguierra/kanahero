"use client";

// The board's state: what is baked, what is armed, what just fired. Internal
// to /sfx.
//
// One hook rather than props threaded through five rigs, because every rig
// wants the same three things — fire a cue by the name the inventory calls it,
// have the miss reported when there is no file behind it, and leave a line in
// the log either way. The log is the point: half this table has no bytes yet,
// and a button that does nothing is indistinguishable from a button that did
// something at −24 dBFS on a laptop speaker.

import { useCallback, useEffect, useRef, useState } from "react";

import { setAudioPrefs } from "@/lib/audio";
import * as board from "./board";
import { CUES, FILES, type Cue } from "./inventory";

const BY_NAME = new Map(CUES.map((cue) => [cue.name, cue]));

export interface LogEntry {
  id: number;
  /** the cue name, as the inventory says it */
  name: string;
  /** did anything actually reach the speakers */
  sounded: boolean;
  /** what it was played as, when that is not just itself */
  as?: string;
  /** ms after the tap, for a scheduled cue */
  ms?: number;
}

export interface Board {
  /** name → the files found for it, or [] */
  files: Record<string, string[]>;
  /** name → what the baked file measured, once it has been decoded */
  stats: Record<string, board.Measured>;
  probing: boolean;
  /** the context is open and every file found is decoded */
  armed: boolean;
  arm: () => void;
  /** re-walk public/sfx/ and decode anything new — the button to press after
      dropping a fresh bake in */
  rescan: () => void;
  /** one cue, by inventory name. False when nothing sounded. */
  fire: (name: string) => boolean;
  /** a laid-out sequence against the audio clock */
  fireSeq: (cues: { name: string; ms: number }[]) => void;
  /** the bed, for the ink rig; null when there is no file or no context */
  bed: (name: string) => board.Bed | null;
  log: LogEntry[];
  clearLog: () => void;
}

/** how it will be played, when that is worth saying */
function playedAs(cue: Cue): string | undefined {
  const parts: string[] = [];
  if (cue.file !== cue.name) parts.push(cue.file);
  if (cue.rate) parts.push(`@ ${cue.rate}`);
  if (cue.gainDb) parts.push(`${cue.gainDb} dB`);
  return parts.length ? parts.join(" ") : undefined;
}

export function useBoard(): Board {
  const [files, setFiles] = useState<Record<string, string[]>>({});
  const [probing, setProbing] = useState(true);
  const [armed, setArmed] = useState(false);
  const [stats, setStats] = useState<Record<string, board.Measured>>({});
  const [log, setLog] = useState<LogEntry[]>([]);
  const seq = useRef(0);

  // The board is not the app: it forces both channels on for as long as you
  // are on this page, whatever the player's stored switches say, and never
  // writes that back to storage. Auditioning a cue through someone's silent
  // mode is how an evening gets lost.
  useEffect(() => {
    setAudioPrefs({ voice: true, sfx: true });
  }, []);

  const scan = useCallback(
    async () =>
      board.probe(FILES).then((found) => {
        setFiles(found);
        setProbing(false);
      }),
    [],
  );

  // `probing` starts true, so the mount scan touches no state until it has an
  // answer — setting it on the way in would be a cascading render before a
  // single row had been drawn, and the walk is four HEADs per name
  useEffect(() => {
    let live = true;
    void board.probe(FILES).then((found) => {
      if (!live) return;
      setFiles(found);
      setProbing(false);
    });
    return () => {
      live = false;
    };
  }, []);

  const arm = useCallback(() => {
    void board.arm().then((ok) => {
      setArmed(ok);
      // measuring needs the decoded buffers, so it can only happen here — the
      // numbers on the rows are the files themselves, not the spec
      if (ok) setStats(board.stats());
    });
  }, []);

  const rescan = useCallback(() => {
    setProbing(true);
    void scan().then(arm);
  }, [scan, arm]);

  const note = useCallback((entry: Omit<LogEntry, "id">) => {
    setLog((lines) => [{ ...entry, id: seq.current++ }, ...lines].slice(0, 60));
  }, []);

  const fire = useCallback(
    (name: string) => {
      const cue = BY_NAME.get(name);
      if (!cue) return false;
      const sounded = cue.synth
        ? false
        : board.fire(cue.file, { rate: cue.rate, gainDb: cue.gainDb });
      note({ name, sounded, as: playedAs(cue) });
      return sounded;
    },
    [note],
  );

  const fireSeq = useCallback(
    (cues: { name: string; ms: number }[]) => {
      for (const { name, ms } of cues) {
        const cue = BY_NAME.get(name);
        if (!cue) continue;
        const sounded =
          !cue.synth &&
          board.fire(cue.file, { rate: cue.rate, gainDb: cue.gainDb, at: ms / 1000 });
        note({ name, sounded, as: playedAs(cue), ms });
      }
    },
    [note],
  );

  const makeBed = useCallback(
    (name: string) => {
      const cue = BY_NAME.get(name);
      if (!cue) return null;
      const live = board.bed(cue.file);
      note({ name, sounded: !!live });
      return live;
    },
    [note],
  );

  return {
    files,
    stats,
    probing,
    armed,
    arm,
    rescan,
    fire,
    fireSeq,
    bed: makeBed,
    log,
    clearLog: () => setLog([]),
  };
}
