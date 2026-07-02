import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Bell, PhoneCall, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveCall } from "@/stores/active-call";
import { formatDuration, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AppTopbar({ userName, userEmail }: { userName: string; userEmail: string }) {
  const navigate = useNavigate();
  const { status, activeContact, startedAt, openPanel } = useActiveCall();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const live = (status === "connected" || status === "on_hold") && !!activeContact;

  return (
    <header className="h-14 border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 md:px-6 gap-3">
      <Link to="/dashboard" className="md:hidden flex items-center gap-2">
        <div className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
          <span className="font-display font-extrabold text-sm">∞</span>
        </div>
      </Link>

      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search leads, deals, contacts…"
          className="w-full bg-secondary/60 border border-border rounded-md py-1.5 pl-10 pr-16 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground/70 px-1.5 py-0.5 rounded border border-border bg-background/50">
          ⌘K
        </kbd>
      </div>

      {live && (
        <button
          onClick={openPanel}
          className={cn(
            "hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 border transition-colors",
            status === "on_hold"
              ? "bg-warning/10 border-warning/30 text-warning"
              : "bg-success/10 border-success/30 text-success",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              status === "on_hold" ? "bg-warning" : "bg-success animate-pulse",
            )}
          />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {status === "on_hold" ? "On Hold" : "Live"} · {activeContact.name}
          </span>
          <span className="font-mono text-[11px] text-foreground/80">
            {formatDuration(elapsed)}
          </span>
        </button>
      )}

      <button className="size-9 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary">
        <Bell className="size-4" />
      </button>

      <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-border">
        <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-bold text-primary-foreground">
          {initials(userName)}
        </div>
        <div className="hidden md:flex flex-col leading-tight">
          <span className="text-xs font-semibold">{userName}</span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
            {userEmail}
          </span>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
          className="ml-1 size-7 grid place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary"
          title="Sign out"
        >
          <LogOut className="size-3.5" />
        </button>
      </div>

      <button className="md:hidden size-9 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary" onClick={openPanel}>
        <PhoneCall className="size-4" />
      </button>
    </header>
  );
}
