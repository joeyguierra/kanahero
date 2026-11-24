"use client";

// /time — study minutes per day, for the person who made the app
// (docs/spec/BRIEF-study-time-dashboard.md). Like /verify it is its own route,
// outside the app's screens; Today's menu links to it. It reads the ledger
// this device holds and nothing else, so anyone else opening it sees an empty
// page.
//
// It measures; it does not coach. No goal, no streak, no comparison, no word
// about a day that is not there (brief §6).

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { dayLabel } from "@/lib/days";
import { allRows, exportLedger, writeRow, type LedgerRow } from "@/lib/ledger";
import { addDays, localDay } from "@/lib/schedule";
import { aggregate, fmt, parseMSS, PARTS, toMSS, type Cell, type DayTime, type Part } from "@/lib/time";
import { LINES, type JokerState } from "./lines";
import s from "./time.module.css";

// When each paper routine began (results.md → Time per day). Before these a
// part is blank; from them on, a part with no time is untimed.
const STARTS = { check: "2026-11-16", night: "2026-11-23" };

const PART_LABEL: Record<Part, string> = {
  check: "CHECK",
  morning: "MORNING ITEMS",
  night: "NIGHT SHEET",
};

const Dash = () => <span className={s.dash}>—</span>;

function Joker({ state, seed }: { state: JokerState; seed: number }) {
  const pool = LINES[state];
  return (
    <div className={s.joker}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={s.jokerMark} src="/assets/joker-mascot-open.png" alt="" />
      <div className={s.jokerPanel}>
        <div className={s.jokerTag}>JOKER</div>
        <div className={s.jokerLine} data-testid="joker">
          {pool[seed % pool.length]}
        </div>
      </div>
    </div>
  );
}

function Chart({ days, opened, saved }: { days: DayTime[]; opened: string | null; saved: Saved | null }) {
  const cols = useRef<HTMLDivElement>(null);
  // newest in view; older days scroll off the left
  useEffect(() => {
    if (cols.current) cols.current.scrollLeft = cols.current.scrollWidth;
  }, [days.length]);

  const max = Math.max(1, ...days.map((d) => d.total));
  const px = Math.min(0.65, 200 / max); // per tenth of a minute; 6.5 px a minute at most
  const h = (tenths: number) => ({ height: Math.round(tenths * px) });
  const t = (c: Cell) => (c.kind === "timed" ? c.tenths : 0);

  return (
    <section className={s.chart}>
      <div className={`${s.mono} ${s.legend}`}>
        <span>
          <i className={s.swatch} style={{ background: "var(--pre)" }} />
          pre-check
        </span>
        <span>
          <i className={s.swatch} style={{ background: "var(--drill)" }} />
          app drill
        </span>
        <span>
          <i className={s.swatch} style={{ background: "var(--night)" }} />
          night drill
        </span>
        <span>
          <i className={s.tick} />a part untimed
        </span>
      </div>
      <div className={s.cols} ref={cols}>
        {days.map((d) => (
          <div
            key={saved?.day === d.day ? `${d.day}-${saved.n}` : d.day}
            className={`${s.col}${saved?.day === d.day ? ` ${s.ring}` : ""}`}
            data-testid={`col-${d.day}`}
          >
            <span className={`${s.mono} ${s.colTotal}`}>{fmt(d.total)}</span>
            <div className={s.stack}>
              {opened === d.day ? (
                <>
                  <i style={{ ...h(t(d.check)), background: "var(--pre)" }} />
                  <i style={{ ...h(t(d.morning)), background: "var(--pre2)" }} />
                </>
              ) : (
                <i style={{ ...h(d.pre ?? 0), background: "var(--pre)" }} />
              )}
              <i style={{ ...h(d.drill ?? 0), background: "var(--drill)" }} />
              <i style={{ ...h(t(d.night)), background: "var(--night)" }} />
            </div>
            <span className={`${s.mono} ${s.colDay}`}>{dayLabel(d.day).split(" ").slice(0, 2).join(" ")}</span>
            <i className={s.colTick} data-on={d.untimed > 0 ? "" : undefined} />
          </div>
        ))}
      </div>
    </section>
  );
}

interface Saved {
  day: string;
  n: number;
}

type Fields = Record<Part, { text: string; none: boolean }>;

const fieldsFor = (d: DayTime | undefined): Fields => {
  const one = (c: Cell | undefined) => ({
    text: c?.kind === "timed" ? toMSS(c.ms) : "",
    none: c?.kind === "none",
  });
  return { check: one(d?.check), morning: one(d?.morning), night: one(d?.night) };
};

function Sheet({
  today,
  start,
  days,
  seed,
  onClose,
  onSaved,
}: {
  today: string;
  start: string;
  days: DayTime[];
  seed: number;
  onClose: () => void;
  onSaved: (day: string) => void;
}) {
  const [day, setDay] = useState(start);
  const held = useMemo(() => fieldsFor(days.find((d) => d.day === day)), [days, day]);
  const [fields, setFields] = useState(held);
  const [bad, setBad] = useState<Part | null>(null);
  const [failed, setFailed] = useState(false);

  const pick = (next: string) => {
    setDay(next);
    setFields(fieldsFor(days.find((d) => d.day === next)));
    setBad(null);
  };
  const edit = (part: Part, patch: Partial<Fields[Part]>) => {
    setFields((f) => ({ ...f, [part]: { ...f[part], ...patch } }));
    setBad(null);
  };

  const yesterday = addDays(today, -1);
  const chips: [string, string][] = [
    [today, "TODAY"],
    [yesterday, "YESTERDAY"],
  ];
  if (start !== today && start !== yesterday) chips.push([start, dayLabel(start)]);

  // one row per part that changed; nothing is edited, the newest row wins
  async function write(next: Fields) {
    const rows: LedgerRow[] = [];
    for (const part of PARTS) {
      const was = held[part];
      const now = next[part];
      const text = now.none ? "" : now.text.trim();
      if (now.none === was.none && text === was.text) continue;
      const base = { type: "time" as const, day, part, ts: Date.now(), how: "manual" as const };
      if (now.none) rows.push({ ...base, ms: null, none: true });
      else if (text === "") rows.push({ ...base, ms: null });
      else {
        const ms = parseMSS(text);
        if (ms === null) return setBad(part);
        rows.push({ ...base, ms });
      }
    }
    try {
      for (const row of rows) await writeRow(row);
    } catch {
      return setFailed(true);
    }
    if (rows.length) onSaved(day);
    else onClose();
  }

  return (
    <div className={s.scrim} onClick={onClose}>
      <form
        className={s.sheet}
        data-testid="sheet"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          void write(fields);
        }}
      >
        <div className={s.head}>
          <span>ENTER TIME</span>
          <span>{dayLabel(day)}</span>
        </div>
        <div className={s.chips}>
          {chips.map(([d, label]) => (
            <button
              key={d}
              type="button"
              className={`${s.chip}${d === day ? ` ${s.chipOn}` : ""}`}
              onClick={() => pick(d)}
            >
              {label}
            </button>
          ))}
        </div>

        {PARTS.map((part) => (
          <label key={part} className={s.field}>
            <span className={s.label}>{PART_LABEL[part]}</span>
            <span className={s.fieldRow}>
              <input
                className={s.input}
                data-testid={`in-${part}`}
                inputMode="numeric"
                autoComplete="off"
                placeholder="m:ss"
                value={fields[part].none ? "" : fields[part].text}
                disabled={fields[part].none}
                aria-invalid={bad === part}
                onChange={(e) => edit(part, { text: e.target.value.replace(/[.\s]/, ":") })}
              />
              <button
                type="button"
                className={`${s.chip}${fields[part].none ? ` ${s.chipOn}` : ""}`}
                aria-pressed={fields[part].none}
                data-testid={`none-${part}`}
                onClick={() => edit(part, { none: !fields[part].none })}
              >
                NONE
              </button>
            </span>
            {bad === part && <span className={`${s.mono} ${s.note}`}>minutes:seconds, like 11:12</span>}
          </label>
        ))}

        {failed && <span className={`${s.mono} ${s.note}`}>not saved: this device refused the write</span>}
        <button type="submit" className={`btnStrike ${s.save}`} data-testid="save">
          SAVE
        </button>
        <button
          type="button"
          className={`${s.mono} ${s.clear}`}
          onClick={() =>
            void write({
              check: { text: "", none: false },
              morning: { text: "", none: false },
              night: { text: "", none: false },
            })
          }
        >
          clear
        </button>
        <Joker state="entry" seed={seed} />
      </form>
    </div>
  );
}

export default function TimePage() {
  const [today, setToday] = useState<string | null>(null);
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [error, setError] = useState(false);
  const [sheet, setSheet] = useState<string | null>(null);
  const [opened, setOpened] = useState<string | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [seed, setSeed] = useState(0);

  // the day and the ledger are the device's: neither exists at build time.
  // `reads` goes up after a save, and the ledger is read again.
  const [reads, setReads] = useState(0);
  useEffect(() => {
    const show = (next: LedgerRow[]) => {
      setRows(next);
      setToday(localDay(new Date()));
      // which of his lines: drawn once, on the device
      setSeed((seed) => seed || 1 + Math.floor(Math.random() * 1000));
    };
    allRows().then(show, () => {
      setError(true);
      show([]);
    });
  }, [reads]);

  const { days, totals } = useMemo(
    () => (today ? aggregate(rows, { today, starts: STARTS }) : { days: [], totals: null }),
    [rows, today],
  );

  if (!today || !totals) return <main className={s.page} />;

  const hasPaper = rows.some((r) => r.type === "time");
  const state: JokerState = saved ? "saved" : opened ? "pre" : hasPaper ? "normal" : "drill";
  const open = (day: string) => {
    setSaved(null);
    setSheet(day);
  };
  const ring = (day: string) => (saved?.day === day ? s.ring : undefined);

  const preCell = (d: DayTime) => {
    if (d.pre === null) {
      return (
        <button type="button" className={s.cellBtn} data-testid={`pre-${d.day}`} onClick={() => open(d.day)}>
          {d.preUntimed > 0 ? <Dash /> : " "}
        </button>
      );
    }
    return (
      <button
        type="button"
        className={s.cellBtn}
        data-testid={`pre-${d.day}`}
        aria-expanded={opened === d.day}
        onClick={() => {
          setSaved(null);
          setOpened(opened === d.day ? null : d.day);
        }}
      >
        {fmt(d.pre)}
        {d.preUntimed > 0 && <i className={s.partly} title="one part untimed" />}
      </button>
    );
  };

  const part = (c: Cell) => (c.kind === "timed" ? fmt(c.tenths) : c.kind === "untimed" ? "—" : "none");

  return (
    <main className={s.page}>
      <div className={s.head}>
        <span>TIME</span>
        <span>{dayLabel(today)}</span>
      </div>

      <div className={s.grid}>
        <div className={s.left}>
          <div>
            <div className={s.big}>
              <span className={s.bigNum} data-testid="total">
                {fmt(totals.total)}
              </span>
              <span className={s.bigUnit}>MEASURED MIN</span>
            </div>
            <div className={s.mono} style={{ marginTop: 12 }} data-testid="untimed">
              {totals.untimed} {totals.untimed === 1 ? "PART" : "PARTS"} UNTIMED
            </div>
          </div>

          <div className={s.parts}>
            {(
              [
                ["PRE-CHECK", totals.pre, "var(--pre)"],
                ["APP DRILL", totals.drill, "var(--drill)"],
                ["NIGHT DRILL", totals.night, "var(--night)"],
              ] as const
            ).map(([label, value, color]) => (
              <div key={label} className={`${s.mono} ${s.part}`}>
                <i className={s.swatch} style={{ background: color }} />
                {label}
                <b>{value === null ? <Dash /> : fmt(value)}</b>
              </div>
            ))}
          </div>

          <button type="button" className={`btnStrike ${s.enter}`} data-testid="enter" onClick={() => open(today)}>
            ENTER TIME
          </button>

          {!sheet && <Joker state={state} seed={seed} />}
        </div>

        <Chart days={days} opened={opened} saved={saved} />
      </div>

      {error && <div className={s.mono}>the ledger on this device could not be read</div>}

      {days.length > 0 && (
        <table className={s.table}>
          <thead>
            <tr className={s.mono}>
              <th>DAY</th>
              <th>PRE-CHECK</th>
              <th>APP DRILL</th>
              <th>NIGHT</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          {/* newest first */}
          {[...days].reverse().map((d) => (
            <tbody key={saved?.day === d.day ? `${d.day}-${saved.n}` : d.day} className={ring(d.day)}>
              <tr data-testid={`row-${d.day}`}>
                <td>{dayLabel(d.day)}</td>
                <td>{preCell(d)}</td>
                <td>{d.drill === null ? "" : fmt(d.drill)}</td>
                <td>
                  <button
                    type="button"
                    className={s.cellBtn}
                    data-testid={`night-${d.day}`}
                    onClick={() => open(d.day)}
                  >
                    {d.night.kind === "timed" ? fmt(d.night.tenths) : d.night.kind === "untimed" ? <Dash /> : " "}
                  </button>
                </td>
                <td>{fmt(d.total)}</td>
              </tr>
              {opened === d.day && d.pre !== null && (
                <tr className={s.inset}>
                  <td colSpan={5} className={s.mono} data-testid="inset">
                    CHECK {part(d.check)} · MORNING ITEMS {part(d.morning)} = {fmt(d.pre)}
                    <button type="button" onClick={() => open(d.day)}>
                      edit
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          ))}
        </table>
      )}

      <div className={s.foot}>
        <Link href="/">← kanahero</Link>
        <button type="button" onClick={() => void exportLedger(today)}>
          export ledger
        </button>
      </div>

      {sheet && (
        <Sheet
          today={today}
          start={sheet}
          days={days}
          seed={seed}
          onClose={() => setSheet(null)}
          onSaved={(day) => {
            setSheet(null);
            setOpened(null);
            setSaved({ day, n: Date.now() });
            setReads((n) => n + 1);
          }}
        />
      )}
    </main>
  );
}
