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

function emit() {
  for (const listener of listeners) listener();
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.sessionStorage;
}

export function loadDemoState(): DemoState {
  if (!canUseStorage()) return { ...empty };
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return { ...empty };
    return { ...empty, ...(JSON.parse(raw) as Partial<DemoState>) };
  } catch {
    return { ...empty };
  }
}

export function saveDemoState(patch: Partial<DemoState>): DemoState {
  const next = { ...loadDemoState(), ...patch };
  if (canUseStorage()) {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  }
  emit();
  return next;
}

export function clearDemoState(): void {
  if (canUseStorage()) sessionStorage.removeItem(KEY);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribe, loadDemoState, () => empty);
}

export function useSaveDemoState() {
  return useCallback((patch: Partial<DemoState>) => saveDemoState(patch), []);
}
