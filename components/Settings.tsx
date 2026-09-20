"use client";

// The settings dialog, off the foot of S1. One section for now — AUDIO — with
// the three switches the sound pass needs (SPEC-v5d §0.1): his voice, the
// table's one-shots, and SILENT MODE over both of them.
//
// Both channels start ON (creator call, 2026-09-20). SILENT MODE is the two of
// them off at once: turning it on takes both switches to OFF, turning it off
// brings both back, and switching both off by hand shows as silent mode on.
// One tap mutes the app for a night bus, one tap brings it back.

import { useRef } from "react";

import { isSilent, type AudioPrefs } from "@/lib/progress";
import { useDialogKeys } from "./dialogKeys";

function Row({
  legend,
  on,
  hintOn,
  hintOff,
  onChange,
}: {
  legend: string;
  on: boolean;
  hintOn: string;
  hintOff: string;
  onChange: (on: boolean) => void;
}) {
  return (
    <div className="settingRow">
      <div className="settingLabel">
        <span className="legend settingLegend">{legend}</span>
        <span className={`settingHint${on ? "" : " settingHintOff"}`}>{on ? hintOn : hintOff}</span>
      </div>
      <span className="toggle toggleTap" role="radiogroup" aria-label={legend.toLowerCase()}>
        <button
          type="button"
          role="radio"
          aria-checked={on}
          className={`toggleOpt${on ? " toggleOn" : ""}`}
          onClick={() => onChange(true)}
        >
          ON
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!on}
          className={`toggleOpt toggleStrike${on ? "" : " toggleOn"}`}
          onClick={() => onChange(false)}
        >
          OFF
        </button>
      </span>
    </div>
  );
}

export default function Settings({
  audio,
  onAudio,
  onClose,
}: {
  audio: AudioPrefs;
  /** one switch at a time; the caller owns the store and the audio gate */
  onAudio: (patch: Partial<AudioPrefs>) => void;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const done = useRef<HTMLButtonElement>(null);
  useDialogKeys(panel, done, onClose);

  return (
    <div className="dialogScrim" onClick={onClose}>
      <div
        ref={panel}
        className="dialogPanel settingsPanel"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settingsTitle">SETTINGS</div>

        <div className="legend settingsSection">AUDIO</div>
        <div className="settingRows">
          <Row
            legend="JOKER VOICE"
            on={audio.voice}
            hintOn="He talks as he types"
            hintOff="He types, and that is all"
            onChange={(voice) => onAudio({ voice })}
          />
          <Row
            legend="SOUND EFFECTS"
            on={audio.sfx}
            hintOn="Cards, felt and wood"
            hintOff="The table is quiet"
            onChange={(sfx) => onAudio({ sfx })}
          />
          <Row
            legend="SILENT MODE"
            on={isSilent(audio)}
            hintOn="Nothing sounds"
            hintOff="The switches above apply"
            onChange={(silent) => onAudio({ voice: !silent, sfx: !silent })}
          />
        </div>

        <div className="dialogActions">
          <button ref={done} type="button" className="btnBone dialogBtn" onClick={onClose}>
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
