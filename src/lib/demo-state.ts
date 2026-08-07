/**
 * Client-only sessionStorage for the diner scan → review → findings flow.
 */
"use client";

import { useCallback, useSyncExternalStore } from "react";
import type {
  CanonicalMenu,
  ComparisonResult,
  ExtractionDraft,
} from "@shared/contracts";

const KEY = "feeseal.demo.v1";

export type DemoScanStep = "physical_menu" | "receipt";

export type DemoState = {
  restaurantId: string;
  menu: CanonicalMenu | null;
  physicalMenu: ExtractionDraft | null;
  receipt: ExtractionDraft | null;
  menuImageDataUrl: string | null;
  receiptImageDataUrl: string | null;
  scanStep: DemoScanStep;
  comparison: ComparisonResult | null;
  /** Sealed evidence record ids from POST /api/evidence/seal */
  menuEvidenceId: string | null;
  receiptEvidenceId: string | null;
};

const empty: DemoState = {
  restaurantId: "demo",
  menu: null,
  physicalMenu: null,
  receipt: null,
  menuImageDataUrl: null,
  receiptImageDataUrl: null,
  scanStep: "physical_menu",
  comparison: null,
  menuEvidenceId: null,
  receiptEvidenceId: null,
};

const listeners = new Set<() => void>();

/** Cached snapshot — must be referentially stable when data is unchanged. */
let cachedRaw: string | null = null;
let cachedState: DemoState = empty;

function emit() {
  for (const listener of listeners) listener();
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.sessionStorage;
}

function parseState(raw: string | null): DemoState {
  if (!raw) return empty;
  try {
    return { ...empty, ...(JSON.parse(raw) as Partial<DemoState>) };
  } catch {
    return empty;
  }
}

/**
 * Stable getSnapshot for useSyncExternalStore.
 * Returns the same object reference unless sessionStorage content changed.
 */
export function loadDemoState(): DemoState {
  if (!canUseStorage()) return cachedState === empty ? empty : cachedState;

  let raw: string | null;
  try {
    raw = sessionStorage.getItem(KEY);
  } catch {
    return cachedState;
  }

  if (raw === cachedRaw) return cachedState;

  cachedRaw = raw;
  cachedState = parseState(raw);
  return cachedState;
}

export function saveDemoState(patch: Partial<DemoState>): DemoState {
  const next = { ...loadDemoState(), ...patch };
  const raw = JSON.stringify(next);
  if (canUseStorage()) {
    sessionStorage.setItem(KEY, raw);
  }
  cachedRaw = raw;
  cachedState = next;
  emit();
  return next;
}

export function clearDemoState(): void {
  if (canUseStorage()) sessionStorage.removeItem(KEY);
  cachedRaw = null;
  cachedState = empty;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getServerSnapshot(): DemoState {
  return empty;
}

export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribe, loadDemoState, getServerSnapshot);
}

export function useSaveDemoState() {
  return useCallback((patch: Partial<DemoState>) => saveDemoState(patch), []);
}
