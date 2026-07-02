import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/format";
import { ChevronDown, Filter, Hand, Plus, Search, ListFilter, EyeOff, Layers, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks · Phaos CRM" },
      { name: "description", content: "Task board with priority, status, owners, and due dates." },
    ],
  }),
  component: TasksPage,
});

const PRIORITY: Record<string, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-warning text-background",
  low: "bg-success text-background",
};

const STATUS: Record<string, string> = {
  pending: "bg-secondary text-muted-foreground",
  working: "bg-warning text-background",
  waiting: "bg-info text-background",
  approved: "bg-success text-background",
  done: "bg-muted text-muted-foreground",
};

const GROUP_COLOR: Record<string, string> = {
  violet: "bg-primary",
  rose: "bg-destructive",
  emerald: "bg-success",
  amber: "bg-warning",
};

function TasksPage() {
  const qc = useQueryClient();
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const t of tasks) {
      const k = t.group_label ?? "Ungrouped";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    }
    return Array.from(map.entries());
  }, [tasks]);

  async function setStatus(id: string, status: string) {
    await supabase.from("tasks").update({ status: status as any }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["tasks"] });
  }
  async function setPriority(id: string, priority: string) {
    await supabase.from("tasks").update({ priority: priority as any }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["tasks"] });
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Modules · Tasks
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight truncate flex items-center gap-2">
            Sales Weekly Tasks
            <ChevronDown className="size-5 text-muted-foreground" />
          </h1>
        </div>
        <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold phaos-glow inline-flex items-center gap-1.5">
          <Plus className="size-3.5" />
          New Item
        </button>
      </header>

      {/* Top tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {["Main Table", "Timeline View", "Kanban", "Team Workload", "All"].map((t, i) => (
          <button
            key={t}
            className={cn(
              "px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors",
              i === 0
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <ToolBtn icon={<Search className="size-3.5" />} label="Search" />
        <ToolBtn icon={<Hand className="size-3.5" />} label="Person" />
        <ToolBtn icon={<Filter className="size-3.5" />} label="Filter" />
        <ToolBtn icon={<ListFilter className="size-3.5" />} label="Sort" />
        <ToolBtn icon={<EyeOff className="size-3.5" />} label="Hide" />
        <ToolBtn icon={<Layers className="size-3.5" />} label="Group by" />
        <ToolBtn icon={<MoreHorizontal className="size-3.5" />} />
      </div>

      {/* Groups */}
      <div className="space-y-8">
        {grouped.map(([group, items]) => {
          const sample = items[0];
          return (
            <div key={group} className="phaos-card rounded-xl overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2 border-b border-border">
                <ChevronDown className="size-3.5" />
                <h3 className="font-semibold text-sm" style={{ color: `var(--color-${sample?.group_color === "rose" ? "destructive" : sample?.group_color === "emerald" ? "success" : sample?.group_color === "amber" ? "warning" : "primary"})` }}>
                  {group}
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {items.length} items
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background/30">
                      <th className="w-1.5"></th>
                      <th className="w-10 px-3 py-2"></th>
                      <Th>Item</Th>
                      <Th>Owner</Th>
                      <Th>Priority</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                      <Th>Description</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((t) => (
                      <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/30 group">
                        <td className={cn("w-1.5", GROUP_COLOR[t.group_color] || "bg-primary")} />
                        <td className="px-3 py-2">
                          <input type="checkbox" className="accent-primary" />
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-medium truncate max-w-[260px]">{t.title}</p>
                        </td>
                        <td className="px-3 py-2">
                          <div className="grid size-7 place-items-center rounded-full bg-secondary text-[10px] font-bold" title={t.owner_name}>
                            {initials(t.owner_name)}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={t.priority}
                            onChange={(e) => setPriority(t.id, e.target.value)}
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border-0 cursor-pointer",
                              PRIORITY[t.priority],
                            )}
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={t.status}
                            onChange={(e) => setStatus(t.id, e.target.value)}
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border-0 cursor-pointer",
                              STATUS[t.status],
                            )}
                          >
                            <option value="pending">Pending</option>
                            <option value="working">Working on it</option>
                            <option value="waiting">Waiting for review</option>
                            <option value="approved">Approved</option>
                            <option value="done">Done</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {t.due_date
                            ? new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[400px]">
                          {t.description}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className={cn("w-1.5", GROUP_COLOR[sample?.group_color] || "bg-primary", "opacity-30")} />
                      <td colSpan={7} className="px-3 py-2.5">
                        <button className="text-xs font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1.5">
                          <Plus className="size-3" />
                          Add item
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </th>
  );
}

function ToolBtn({ icon, label }: { icon: React.ReactNode; label?: string }) {
  return (
    <button className="px-2.5 py-1.5 rounded-md border border-border bg-secondary/60 hover:bg-secondary text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
      {icon}
      {label && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}
