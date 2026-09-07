import { create } from "zustand";
import { DEFAULT_WIZARD_INPUTS } from "../lib/tax/defaults";
import type { WizardInputs } from "../lib/tax/types";

// PRD §25.1 — sessionStorage only, one key, cleared when the tab closes.
const STORAGE_KEY = "wtr_draft";

export { DEFAULT_WIZARD_INPUTS };

function loadDraft(): WizardInputs | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return { ...DEFAULT_WIZARD_INPUTS, ...(JSON.parse(raw) as Partial<WizardInputs>) };
  } catch {
    return null;
  }
}

function persistDraft(inputs: WizardInputs): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    // sessionStorage unavailable (e.g. some private-browsing modes) — nothing to persist to.
  }
}

function clearDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to clear
  }
}

const restoredDraft = loadDraft();

interface WizardState {
  inputs: WizardInputs;
  currentStep: number;
  /** True only when a draft already existed in sessionStorage when the app started — used once, to decide whether to show the "we start fresh" toast. */
  hasRestoredDraft: boolean;
  /**
   * Bumped on every `clearAll()`. Money inputs keep their own local display
   * text (for live formatting), which a store reset alone won't touch — the
   * UI remounts the step keyed on this so cleared fields actually go blank.
   */
  resetCount: number;
  setField: <K extends keyof WizardInputs>(key: K, value: WizardInputs[K]) => void;
  setFields: (patch: Partial<WizardInputs>) => void;
  goToStep: (step: number) => void;
  clearAll: () => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  inputs: restoredDraft ?? DEFAULT_WIZARD_INPUTS,
  currentStep: 1,
  hasRestoredDraft: restoredDraft !== null,
  resetCount: 0,
  setField: (key, value) => {
    const next = { ...get().inputs, [key]: value };
    set({ inputs: next });
    persistDraft(next);
  },
  setFields: (patch) => {
    const next = { ...get().inputs, ...patch };
    set({ inputs: next });
    persistDraft(next);
  },
  goToStep: (step) => set({ currentStep: step }),
  clearAll: () => {
    clearDraft();
    set((s) => ({
      inputs: DEFAULT_WIZARD_INPUTS,
      currentStep: 1,
      hasRestoredDraft: false,
      resetCount: s.resetCount + 1,
    }));
  },
}));
