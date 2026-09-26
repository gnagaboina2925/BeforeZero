"use client";

import { useAccessPreferences } from "@/components/AccessProvider";
import type { ContrastMode, MotionMode, TextSize } from "@/lib/a11y/preferences";
import { useEffect, useId, useRef, useState } from "react";

export function AccessibilityControls() {
  const { prefs, setPrefs, announce } = useAccessPreferences();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);

  function update<K extends keyof typeof prefs>(key: K, value: (typeof prefs)[K], label: string) {
    setPrefs({ ...prefs, [key]: value });
    announce(label);
  }

  function openPanel() {
    dialogRef.current?.showModal();
    setOpen(true);
  }

  function closePanel() {
    dialogRef.current?.close();
    setOpen(false);
    buttonRef.current?.focus();
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dialog.open) {
        dialog.close();
      }
    };
    dialog.addEventListener("close", onClose);
    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      dialog.removeEventListener("close", onClose);
      dialog.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="a11y-menu">
      <button
        ref={buttonRef}
        type="button"
        className="a11y-trigger"
        aria-expanded={open}
        aria-controls={titleId}
        aria-haspopup="dialog"
        onClick={() => (open ? closePanel() : openPanel())}
      >
        <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16M4 12h10M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="16" cy="12" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        Accessibility
      </button>
      <dialog ref={dialogRef} id={titleId} className="a11y-dialog" aria-labelledby={`${titleId}-title`}>
        <div className="a11y-dialog-head">
          <h2 id={`${titleId}-title`} className="a11y-dialog-title">
            Accessibility
          </h2>
        </div>
        <p className="result-note">
          These options change how this site looks and whether captions or narration controls are shown. You do not
          need to describe a disability. This is not a claim of complete accessibility support.
        </p>
        <fieldset className="a11y-fieldset">
          <legend>Text size</legend>
          {(
            [
              ["default", "Default"],
              ["large", "Large"],
              ["larger", "Larger"],
            ] as Array<[TextSize, string]>
          ).map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="text-size"
                checked={prefs.textSize === value}
                onChange={() => update("textSize", value, `Text size ${label}`)}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <fieldset className="a11y-fieldset">
          <legend>Contrast</legend>
          {(
            [
              ["default", "Default"],
              ["high", "Higher contrast"],
            ] as Array<[ContrastMode, string]>
          ).map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="contrast"
                checked={prefs.contrast === value}
                onChange={() => update("contrast", value, label)}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <fieldset className="a11y-fieldset">
          <legend>Motion</legend>
          {(
            [
              ["system", "Use device setting"],
              ["reduce", "Reduce motion"],
              ["allow", "Allow motion"],
            ] as Array<[MotionMode, string]>
          ).map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="motion"
                checked={prefs.motion === value}
                onChange={() => update("motion", value, `Motion: ${label}`)}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <label className="a11y-check">
          <input
            type="checkbox"
            checked={prefs.captions}
            onChange={(event) =>
              update("captions", event.target.checked, event.target.checked ? "Captions on" : "Captions off")
            }
          />
          Show captions when a lesson is playing
        </label>
        <label className="a11y-check">
          <input
            type="checkbox"
            checked={prefs.narration}
            onChange={(event) =>
              update(
                "narration",
                event.target.checked,
                event.target.checked
                  ? "Narration controls shown. Playback is optional and not started automatically."
                  : "Narration controls hidden",
              )
            }
          />
          Show narration controls (does not start audio by itself)
        </label>
        <button type="button" className="btn-ghost a11y-close" onClick={closePanel}>
          Close
        </button>
      </dialog>
    </div>
  );
}
