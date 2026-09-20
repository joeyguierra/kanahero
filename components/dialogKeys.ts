// What every modal on the board owes the keyboard: Escape closes it, and Tab
// cycles inside it or goes nowhere. One hook, so the ✕ confirm and the
// settings dialog cannot drift apart on it.

import { useEffect, type RefObject } from "react";

export function useDialogKeys(
  panel: RefObject<HTMLElement | null>,
  /** the control to land on when the dialog opens */
  first: RefObject<HTMLElement | null>,
  onClose: () => void,
): void {
  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      // a modal keeps its own focus: tab cycles inside the dialog or nothing
      if (e.key !== "Tab") return;
      const stops = panel.current?.querySelectorAll<HTMLButtonElement>("button");
      if (!stops?.length) return;
      const head = stops[0];
      const tail = stops[stops.length - 1];
      const at = document.activeElement;
      if (e.shiftKey && (at === head || !panel.current?.contains(at))) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && at === tail) {
        e.preventDefault();
        head.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, first, onClose]);
}
