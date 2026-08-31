"use client";

// Screen 5 — the bank. A contact sheet of everything caught in the field,
// the capture button, and the export that insures it.
//
// The bank is not a fourth track: no denominator, no progress bar, and the
// count is an instrument reading rather than a score.

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  addCapture,
  bankBytes,
  clearBankError,
  exportBank,
  formatBytes,
  getBank,
  getServerBank,
  subscribeBank,
  type Capture,
} from "@/lib/bank";

/** the count flash is one frame of inverse, no motion — anything springier is
    retention theater */
const FLASH_MS = 180;

/** Thumbnails render from the stored blob; a separate thumb blob is an
    optimization to add only if a long grid measurably janks. The URLs are
    minted with the list they belong to and revoked once that list is off
    screen — the new set is live before the old one is released, so a capture
    never paints as a blank frame. */
function useObjectUrls(captures: Capture[]): Map<string, string> {
  const urls = useMemo(
    () => new Map(captures.map((c) => [c.id, URL.createObjectURL(c.blob)])),
    [captures],
  );

  useEffect(() => {
    return () => {
      for (const url of urls.values()) URL.revokeObjectURL(url);
    };
  }, [urls]);

  return urls;
}

export default function Bank({
  onBack,
  onOpen,
}: {
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  const bank = useSyncExternalStore(subscribeBank, getBank, getServerBank);
  const urls = useObjectUrls(bank.captures);
  const [flash, setFlash] = useState(false);

  const count = bank.captures.length;
  const previous = useRef(count);

  useEffect(() => {
    if (count > previous.current) {
      setFlash(true);
      const timer = window.setTimeout(() => setFlash(false), FLASH_MS);
      previous.current = count;
      return () => window.clearTimeout(timer);
    }
    previous.current = count;
  }, [count]);

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    // let the same photo be picked twice in a row
    event.target.value = "";
    for (const file of files) await addCapture(file);
  }

  return (
    <main className="frame bankFrame">
      <div className="livery" aria-hidden>
        {/* 未 — "not yet": the bank is characters not yet readable */}
        <span className="ghost ghostHome">未</span>
      </div>

      <header className="appHead">
        <button type="button" className="quit" onClick={onBack}>
          ← Back
        </button>
        <span className="legend">
          Bank ·{" "}
          <span
            className={`bankHeadCount${count === 0 ? " bankHeadCountZero" : ""}${
              flash ? " bankFlash" : ""
            }`}
          >
            {bank.ready ? count : "—"}
          </span>
        </span>
      </header>

      {count === 0 ? (
        <div className="bankEmpty">
          <span className="bankEmptyLine">Snap what you can&rsquo;t read</span>
        </div>
      ) : (
        <div className="bankGrid">
          <div className="bankSheet">
            {bank.captures.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className="thumb"
                onClick={() => onOpen(c.id)}
                aria-label={`Capture ${count - i}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a blob URL from IndexedDB; there is no loader to optimize it */}
                <img src={urls.get(c.id)} alt="" />
              </button>
            ))}
          </div>
        </div>
      )}

      {bank.error && (
        <p className="bankAlert" role="alert">
          {bank.error}
        </p>
      )}

      <label className="btnStrike homeStart bankCapture">
        Capture
        <input
          className="bankInput"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPick}
        />
      </label>

      <button
        type="button"
        className="btnSeam bankExport"
        disabled={count === 0}
        onClick={() => {
          clearBankError();
          void exportBank();
        }}
      >
        Export
      </button>

      <p className={`bankFooter${bank.persistence === "persistent" ? "" : " bankFooterWarn"}`}>
        {bank.persistence === "persistent"
          ? `Storage: persistent · ${count} items · ${formatBytes(bankBytes(bank.captures))}`
          : "Storage: best-effort — export often"}
      </p>
    </main>
  );
}
