import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users2,
  KanbanSquare,
  CheckSquare,
  Contact2,
  FileText,
  BarChart3,
  Settings as SettingsIcon,
  Infinity as InfinityIcon,
  PhoneCall,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveCall } from "@/stores/active-call";

const nav = [
  { to: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users2 },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/contacts", label: "Contacts", icon: Contact2 },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const togglePanel = useActiveCall((s) => s.togglePanel);
  const status = useActiveCall((s) => s.status);

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <Link to="/dashboard" className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_20px_-4px_oklch(0.68_0.21_305/0.6)]">
          <InfinityIcon className="size-4" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-extrabold tracking-tight">
            PHAOS <span className="text-muted-foreground font-medium">CRM</span>
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
            v1.0 · live
          </span>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Workspace
        </div>
        {nav.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {active && (
                <span className="ml-auto size-1.5 rounded-full bg-primary shadow-[0_0_6px] shadow-primary" />
              )}
            </Link>
          );
        })}

        <div className="px-2 pt-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          System
        </div>
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-primary/10 text-primary ring-1 ring-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
          )}
        >
          <SettingsIcon className="size-4 shrink-0" />
          Settings
        </Link>
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-3">
        <button
          onClick={togglePanel}
          className={cn(
            "w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all",
            status === "connected" || status === "on_hold"
              ? "bg-primary text-primary-foreground phaos-glow"
              : "bg-secondary text-foreground hover:bg-accent",
          )}
        >
          <PhoneCall className="size-4" />
          <span>Power Dialer</span>
          <span
            className={cn(
              "ml-auto size-2 rounded-full",
              status === "connected" || status === "on_hold"
                ? "bg-success phaos-pulse"
                : "bg-muted-foreground/40",
            )}
          />
        </button>
        <div className="px-1 text-[10px] text-muted-foreground/70 font-mono leading-relaxed">
          <span className="text-success">●</span> Voice agent network online
        </div>
      </div>
    </aside>
  );
}
