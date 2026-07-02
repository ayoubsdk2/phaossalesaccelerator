import { create } from "zustand";

export type CallStatus = "idle" | "dialing" | "ringing" | "connected" | "on_hold" | "ended";

export type QueueItem = {
  contactId: string;
  name: string;
  title?: string;
  company?: string;
  phone: string;
  avatarUrl?: string | null;
};

type ActiveCallState = {
  panelOpen: boolean;
  status: CallStatus;
  activeContact: QueueItem | null;
  startedAt: number | null;
  muted: boolean;
  recording: boolean;
  notes: string;
  queue: QueueItem[];
  // actions
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  startCall: (item: QueueItem) => void;
  endCall: (disposition?: string) => void;
  toggleMute: () => void;
  toggleHold: () => void;
  toggleRecording: () => void;
  setNotes: (s: string) => void;
  setQueue: (items: QueueItem[]) => void;
  nextInQueue: () => void;
};

export const useActiveCall = create<ActiveCallState>((set, get) => ({
  panelOpen: false,
  status: "idle",
  activeContact: null,
  startedAt: null,
  muted: false,
  recording: false,
  notes: "",
  queue: [],
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false }),
  startCall: (item) =>
    set({
      activeContact: item,
      status: "connected",
      startedAt: Date.now(),
      muted: false,
      recording: true,
      notes: "",
      panelOpen: true,
    }),
  endCall: () =>
    set({
      status: "ended",
      activeContact: null,
      startedAt: null,
      muted: false,
      recording: false,
      notes: "",
    }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  toggleHold: () =>
    set((s) => ({ status: s.status === "on_hold" ? "connected" : "on_hold" })),
  toggleRecording: () => set((s) => ({ recording: !s.recording })),
  setNotes: (s) => set({ notes: s }),
  setQueue: (items) => set({ queue: items }),
  nextInQueue: () => {
    const { queue } = get();
    if (queue.length === 0) return;
    const [next, ...rest] = queue;
    set({
      activeContact: next,
      status: "connected",
      startedAt: Date.now(),
      muted: false,
      recording: true,
      notes: "",
      queue: rest,
    });
  },
}));
