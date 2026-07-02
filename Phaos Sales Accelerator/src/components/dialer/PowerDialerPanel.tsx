import { useEffect, useState } from "react";
import { useActiveCall } from "@/stores/active-call";
import { formatDuration, initials } from "@/lib/format";
import {
  Mic,
  MicOff,
  Pause,
  Play,
  PhoneOff,
  ArrowRightLeft,
  Disc,
  X,
  PhoneIncoming,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const KEYS: Array<{ d: string; l?: string }> = [
  { d: "1" },
  { d: "2", l: "ABC" },
  { d: "3", l: "DEF" },
  { d: "4", l: "GHI" },
  { d: "5", l: "JKL" },
  { d: "6", l: "MNO" },
  { d: "7", l: "PQRS" },
  { d: "8", l: "TUV" },
  { d: "9", l: "WXYZ" },
  { d: "*" },
  { d: "0", l: "+" },
  { d: "#" },
];

const DISPOSITIONS = [
  { key: "no_answer", label: "No Answer" },
  { key: "voicemail", label: "Went to VM" },
  { key: "contact_not_in", label: "Contact Not In" },
  { key: "left_message", label: "Left Message" },
  { key: "call_back_later", label: "Call Back Later" },
  { key: "busy", label: "Busy" },
  { key: "not_interested", label: "Not Interested" },
  { key: "meeting_set", label: "Meeting Set" },
];

export function PowerDialerPanel() {
  const {
    panelOpen,
    closePanel,
    status,
    activeContact,
    startedAt,
    muted,
    recording,
    notes,
    queue,
    setNotes,
    toggleMute,
    toggleHold,
    toggleRecording,
    endCall,
    nextInQueue,
    startCall,
  } = useActiveCall();

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (!panelOpen) return null;

  const live = activeContact && (status === "connected" || status === "on_hold");

  async function handleDispose(d: { key: string; label: string }) {
    if (activeContact) {
      try {
        await supabase.from("calls").insert({
          contact_id: activeContact.contactId,
          direction: "outbound",
          started_at: new Date(startedAt ?? Date.now()).toISOString(),
          ended_at: new Date().toISOString(),
          duration_sec: elapsed,
          disposition: d.key as any,
          notes,
          agent_name: "You",
        });
        await supabase.from("activities").insert({
          type: "call",
          title: `Outbound Call · ${d.label}`,
          body: notes || `Call ended after ${formatDuration(elapsed)}`,
          contact_id: activeContact.contactId,
          actor_name: "You",
        });
      } catch (e) {
        console.error(e);
      }
    }
    toast.success(`Call logged: ${d.label}`);
    endCall();
  }

  return (
    <aside className="fixed right-0 top-14 bottom-0 z-30 w-[360px] border-l border-border bg-surface/95 backdrop-blur-xl flex flex-col shadow-2xl">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Power Dialer
          </span>
          {live && (
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
          )}
        </div>
        <button
          onClick={closePanel}
          className="size-7 grid place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Active Call header */}
        {live ? (
          <div className="p-6 flex flex-col items-center text-center">
            <div className="relative">
              <div className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-2xl font-bold text-primary-foreground ring-4 ring-primary/20">
                {initials(activeContact.name)}
              </div>
              <span
                className={cn(
                  "absolute -bottom-1 -right-1 size-5 rounded-full ring-2 ring-surface grid place-items-center",
                  status === "on_hold" ? "bg-warning" : "bg-success",
                )}
              >
                {status === "on_hold" ? (
                  <Pause className="size-2.5 text-background" />
                ) : (
                  <PhoneIncoming className="size-2.5 text-background" />
                )}
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold">{activeContact.name}</h3>
            <p className="text-xs text-muted-foreground">
              {activeContact.title}
              {activeContact.company ? ` · ${activeContact.company}` : ""}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground mt-1">
              {activeContact.phone}
            </p>
            <div className="mt-4 font-mono text-2xl font-bold tracking-widest text-primary">
              {formatDuration(elapsed)}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="grid size-20 mx-auto place-items-center rounded-full bg-secondary text-muted-foreground">
              <PhoneIncoming className="size-7" />
            </div>
            <p className="mt-4 text-sm font-semibold">No active call</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start a call from a contact, or pull the next from queue below.
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="px-6 grid grid-cols-4 gap-2">
          <DialerBtn
            label="Mute"
            active={muted}
            disabled={!live}
            onClick={toggleMute}
            icon={muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          />
          <DialerBtn
            label="Hold"
            active={status === "on_hold"}
            disabled={!live}
            onClick={toggleHold}
            icon={status === "on_hold" ? <Play className="size-4" /> : <Pause className="size-4" />}
          />
          <DialerBtn
            label="Transfer"
            disabled={!live}
            onClick={() => toast.info("Transfer panel — coming soon")}
            icon={<ArrowRightLeft className="size-4" />}
          />
          <DialerBtn
            label="Record"
            active={recording}
            disabled={!live}
            onClick={toggleRecording}
            icon={<Disc className={cn("size-4", recording && "text-destructive")} />}
          />
        </div>

        {/* Keypad */}
        <div className="px-6 mt-6">
          <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-background/60 border border-border">
            {KEYS.map((k) => (
              <button
                key={k.d}
                className="aspect-square rounded-md hover:bg-secondary transition-colors flex flex-col items-center justify-center"
              >
                <span className="font-mono text-lg font-medium">{k.d}</span>
                {k.l && <span className="text-[8px] text-muted-foreground">{k.l}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        {live && (
          <div className="px-6 mt-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Call Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Write your call notes…"
              className="mt-2 w-full bg-background/60 border border-border rounded-md p-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        )}

        {/* Dispositions */}
        {live && (
          <div className="px-6 mt-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Disposition
            </label>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {DISPOSITIONS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => handleDispose(d)}
                  className="text-[10px] font-semibold uppercase tracking-wide py-2 px-2 rounded border border-border bg-background/40 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Queue */}
        <div className="px-6 mt-6 pb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Next in Queue ({queue.length})
            </label>
            {queue.length > 0 && (
              <button
                onClick={nextInQueue}
                className="text-[10px] font-semibold text-primary hover:underline"
              >
                Skip to next
              </button>
            )}
          </div>
          {queue.length === 0 ? (
            <p className="text-xs text-muted-foreground">Queue is empty.</p>
          ) : (
            <div className="space-y-2">
              {queue.slice(0, 4).map((q, i) => (
                <div
                  key={q.contactId}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-md border bg-background/40 group",
                    i === 0 ? "border-primary/40 ring-1 ring-primary/20" : "border-border",
                  )}
                >
                  <div className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-[10px] font-bold">
                    {initials(q.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{q.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {q.title} · {q.company}
                    </p>
                  </div>
                  {i === 0 ? (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                      Next
                    </span>
                  ) : (
                    <ChevronRight className="size-3 text-muted-foreground/60" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed End Call bar */}
      {live && (
        <div className="p-4 border-t border-border bg-background/60">
          <button
            onClick={() => handleDispose({ key: "no_answer", label: "Ended" })}
            className="w-full py-3 rounded-md bg-destructive text-destructive-foreground font-bold uppercase tracking-widest text-xs hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <PhoneOff className="size-4" />
            End Call
          </button>
        </div>
      )}
      {!live && queue.length > 0 && (
        <div className="p-4 border-t border-border bg-background/60">
          <button
            onClick={nextInQueue}
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs hover:opacity-90 transition flex items-center justify-center gap-2 phaos-glow"
          >
            <PhoneIncoming className="size-4" />
            Start Next Call
          </button>
        </div>
      )}
    </aside>
  );
}

function DialerBtn({
  label,
  active,
  disabled,
  icon,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-1.5 py-3 rounded-md border transition-all text-muted-foreground",
        active
          ? "bg-primary text-primary-foreground border-primary phaos-glow"
          : "bg-background/40 border-border hover:bg-secondary hover:text-foreground",
        disabled && "opacity-40 pointer-events-none",
      )}
    >
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
