import { create } from "zustand";

type ContextObject = {
  result?: string;
  error?: string;
};

type State = {
  currentState: "idle" | "camera" | "file" | "results";
  context: ContextObject;
  selectCamera: () => void;
  selectFile: () => void;
  success: (value: string) => void;
  error: (value: string) => void;
  cancel: () => void;
  back: () => void;
  clear: () => void;
};

export const useQRScannerStore = create<State>((set) => ({
  currentState: "idle",
  context: {
    result: undefined,
    error: undefined,
  },
  selectCamera: () =>
    set(() => ({
      currentState: "camera",
      context: { result: undefined, error: undefined },
    })),
  selectFile: () =>
    set(() => ({
      currentState: "file",
      context: { result: undefined, error: undefined },
    })),
  success: (value: string) =>
    set(() => ({
      currentState: "results",
      context: { result: value, error: undefined },
    })),
  error: (value: string) =>
    set(() => ({
      currentState: "idle",
      context: { result: undefined, error: value },
    })),
  cancel: () =>
    set(() => ({
      currentState: "idle",
      context: { result: undefined, error: undefined },
    })),
  back: () =>
    set(() => ({
      currentState: "idle",
      context: { result: undefined, error: undefined },
    })),
  clear: () =>
    set(() => ({ context: { result: undefined, error: undefined } })),
}));
