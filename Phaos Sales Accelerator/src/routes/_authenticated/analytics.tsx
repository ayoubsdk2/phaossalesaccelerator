import { createFileRoute } from "@tanstack/react-router";
import { initials } from "@/lib/format";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, Bookmark, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Coaching Hub · Phaos CRM" },
      { name: "description", content: "Agent performance leaderboard and conversion funnel analytics." },
    ],
  }),
  component: AnalyticsPage,
});

const reps = [
  { name: "Elena Moreno", total: 150, delta: "+32%", validated: 120, quality: 100, adherence: 39, dispo: 4, trend: "up" },
  { name: "Robert Jones", total: 125, delta: "N/A", validated: 55, quality: 35, adherence: 13, dispo: 7, trend: "flat" },
  { name: "Jean Foster", total: 200, delta: "N/A", validated: 170, quality: 150, adherence: 75, dispo: 10, trend: "up" },
  { name: "Takeshi Soto", total: 88, delta: "-70%", validated: 12, quality: 6, adherence: 10, dispo: 3, trend: "down" },
  { name: "Ava Davis", total: 116, delta: "N/A", validated: 46, quality: 25, adherence: 15, dispo: 5, trend: "flat" },
  { name: "Matthew Rodriguez", total: 180, delta: "N/A", validated: 120, quality: 98, adherence: 50, dispo: 7, trend: "flat" },
  { name: "Alex Sterling", total: 142, delta: "+18%", validated: 110, quality: 88, adherence: 64, dispo: 6, trend: "up" },
  { name: "Sarah Chen", total: 168, delta: "+25%", validated: 140, quality: 122, adherence: 71, dispo: 8, trend: "up" },
];

function sparkData(seed: number, trend: string) {
  const arr = [];
  for (let i = 0; i < 12; i++) {
    const base = trend === "up" ? 30 + i * 4 : trend === "down" ? 80 - i * 5 : 50 + Math.sin(i) * 6;
    arr.push({ y: base + Math.random() * 10 + seed });
  }
  return arr;
}

function adherenceColor(v: number) {
  if (v >= 60) return "text-success";
  if (v >= 30) return "text-warning";
  return "text-destructive";
}

function adherenceBg(v: number) {
  if (v >= 60) return "bg-success/15";
  if (v >= 30) return "bg-warning/15";
  return "bg-destructive/15";
}

function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Aerolabs Office · Coaching Hub
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-1">All data is in US/Eastern</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            placeholder="Search reps, calls, playbooks…"
            className="bg-secondary/60 border border-border rounded-md py-1.5 pl-9 pr-3 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </header>

      <div className="flex items-center gap-2 flex-wrap">
        <SelectChip label="Last 30 days" />
        <SelectChip label="Everyone" />
        <button className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/60 border border-border text-xs">
          <Bookmark className="size-3.5" />
          Saved Views
        </button>
      </div>

      {/* Conversion Funnel */}
      <div className="phaos-card rounded-xl p-6">
        <h2 className="text-sm font-semibold mb-1">Conversion Funnel</h2>
        <div className="flex items-baseline gap-2 mb-6">
          <span className="font-display text-4xl font-extrabold">35.67%</span>
          <span className="text-xs text-muted-foreground">Team Average</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 1222, label: "Total Calls (Outbound)", pct: 100 },
            { value: 1035, label: "Conversations", pct: 84 },
            { value: 436, label: "Playbook Adherence", pct: 42 },
          ].map((f) => (
            <div key={f.label} className="relative">
              <div
                className="h-32 rounded-md bg-gradient-to-b from-primary/60 to-primary/20"
                style={{ opacity: f.pct / 100 }}
              />
              <p className="font-display text-2xl font-extrabold mt-3">{f.value.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="phaos-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Leaderboard</h2>
          <button className="px-3 py-1 rounded-md bg-secondary/60 border border-border text-xs inline-flex items-center gap-1">
            Playbooks <ChevronDown className="size-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/30">
                <Th>Name</Th>
                <Th>Total Calls</Th>
                <Th>Validated</Th>
                <Th>Quality Sales</Th>
                <Th>Avg Playbook Adherence</Th>
                <Th>Disposition</Th>
              </tr>
            </thead>
            <tbody>
              {reps.map((r, i) => (
                <tr key={r.name} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-3 py-3 flex items-center gap-2.5">
                    <div className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-primary/40 to-primary-glow/40 text-[10px] font-bold">
                      {initials(r.name)}
                    </div>
                    <span className="font-medium">{r.name}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-semibold">{r.total}</div>
                        <div
                          className={cn(
                            "text-[10px] font-mono",
                            r.trend === "up" ? "text-success" : r.trend === "down" ? "text-destructive" : "text-muted-foreground",
                          )}
                        >
                          {r.trend === "up" ? "↑ " : r.trend === "down" ? "↓ " : ""}
                          {r.delta}
                        </div>
                      </div>
                      <div className="w-16 h-8">
                        <ResponsiveContainer>
                          <LineChart data={sparkData(i, r.trend)}>
                            <Line
                              type="monotone"
                              dataKey="y"
                              stroke={r.trend === "up" ? "var(--color-success)" : r.trend === "down" ? "var(--color-destructive)" : "var(--color-muted-foreground)"}
                              strokeWidth={1.5}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono">{r.validated}</td>
                  <td className="px-3 py-3 font-mono">{r.quality}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-0.5 rounded font-mono text-xs font-bold", adherenceBg(r.adherence), adherenceColor(r.adherence))}>
                        {r.adherence}%
                      </span>
                      <div className="w-16 h-6">
                        <ResponsiveContainer>
                          <LineChart data={sparkData(i + 5, r.trend)}>
                            <Line
                              type="monotone"
                              dataKey="y"
                              stroke={r.adherence >= 60 ? "var(--color-success)" : r.adherence >= 30 ? "var(--color-warning)" : "var(--color-destructive)"}
                              strokeWidth={1.5}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono">{r.dispo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SelectChip({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-secondary/60 text-xs">
      {label}
      <ChevronDown className="size-3" />
    </button>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </th>
  );
}
