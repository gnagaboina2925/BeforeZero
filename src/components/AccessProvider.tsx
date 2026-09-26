"use client";

import {
  applyPreferencesToDocument,
  DEFAULT_PREFERENCES,
  parsePreferences,
  PREFERENCE_STORAGE_KEY,
  type AccessPreferences,
} from "@/lib/a11y/preferences";
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

interface AccessContextValue {
  prefs: AccessPreferences;
  setPrefs: (next: AccessPreferences) => void;
  statusMessage: string;
  announce: (message: string) => void;
}

const AccessContext = createContext<AccessContextValue | null>(null);
const PREFERENCE_CHANGE_EVENT = "beforezero-access-preferences-change";

export function useAccessPreferences(): AccessContextValue {
  const value = useContext(AccessContext);
  if (!value) {
    throw new Error("useAccessPreferences must be used within AccessProvider");
  }
  return value;
}

function subscribePreferences(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PREFERENCE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PREFERENCE_CHANGE_EVENT, onStoreChange);
  };
}

function readStoredPreferencesJson(): string {
  try {
    return window.localStorage.getItem(PREFERENCE_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function serverPreferencesJson(): string {
  return "";
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const storedJson = useSyncExternalStore(subscribePreferences, readStoredPreferencesJson, serverPreferencesJson);
  let prefs = DEFAULT_PREFERENCES;
  try {
    prefs = parsePreferences(storedJson ? JSON.parse(storedJson) : DEFAULT_PREFERENCES);
  } catch {
    prefs = DEFAULT_PREFERENCES;
  }
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    applyPreferencesToDocument(prefs, document.documentElement);
  }, [prefs]);

  const value = useMemo(
    () => ({
      prefs,
      setPrefs: (next: AccessPreferences) => {
        try {
          window.localStorage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore quota */
        }
        window.dispatchEvent(new Event(PREFERENCE_CHANGE_EVENT));
      },
      statusMessage,
      announce: (message: string) => setStatusMessage(message),
    }),
    [prefs, statusMessage],
  );

  return (
    <AccessContext.Provider value={value}>
      <div id="status-live" className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>
      {children}
    </AccessContext.Provider>
  );
}
