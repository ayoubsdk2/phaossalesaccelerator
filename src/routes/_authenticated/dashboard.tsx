import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import { Plus, RefreshCcw, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Command Center · Phaos CRM" },
      { name: "description", content: "Real-time sales pipeline, forecast, and rep performance." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: deals = [] } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => (await supabase.from("deals").select("*")).data ?? [],
  });

  const won = deals.filter((d: any) => d.status === "won");
  const closedBusiness = won.reduce((a: number, d: any) => a + Number(d.value), 0);
  const target = 80000;
  const pct = Math.min(100, Math.round((closedBusiness / target) * 100));

  const stages = [
    { key: "qualified", name: "Qualified" },
    { key: "contact_made", name: "Contact Made" },
    { key: "demo_scheduled", name: "Demo Scheduled" },
    { key: "proposal_made", name: "Proposal/Quote" },
    { key: "negotiations_started", name: "Negotiation" },
  ];
  const pipelineByStage = stages.map((s) => ({
    name: s.name,
    value: deals
      .filter((d: any) => d.stage === s.key && d.status === "open")
      .reduce((a: number, d: any) => a + Number(d.value), 0),
  }));

  const reps = ["Alex Sterling", "Sarah Chen", "Elena Rodriguez", "James Wilson", "Mark S."];
  const repActivity = reps.map((r) => ({
    name: r.split(" ")[0],
    Calls: Math.round(20 + Math.random() * 30),
    Emails: Math.round(15 + Math.random() * 30),
    Meetings: Math.round(5 + Math.random() * 15),
  }));

  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const growth = months.map((m, i) => ({
    month: m,
    growth: Math.round(40 + i * 8 + (Math.random() - 0.5) * 20),
  }));

  const forecast = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((m, i) => ({
    month: m,
    Pipeline: Math.round(40000 + Math.random() * 30000),
    "Best Case": Math.round(30000 + Math.random() * 20000),
    Commit: Math.round(20000 + Math.random() * 15000),
  }));

  const pipelineByRep = reps.map((r) => ({
    name: r,
    value: deals
      .filter((d: any) => d.owner_name === r && d.status === "open")
      .reduce((a: number, d: any) => a + Number(d.value), 0),
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Team Wild West / Q3 FY26
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight truncate">
            Command Center
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-secondary/60 text-xs font-semibold hover:bg-secondary">
            <Download className="size-3.5" />
            Export
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-secondary/60 text-xs font-semibold hover:bg-secondary">
            <RefreshCcw className="size-3.5" />
            Refresh
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold phaos-glow hover:opacity-90">
            <Plus className="size-3.5" />
            Add Widget
          </button>
        </div>
      </header>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Widget title="Closed Business" subtitle="How are we performing against goal?">
          <div className="relative h-44">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={[{ name: "won", value: pct, fill: "var(--color-primary)" }]}
                startAngle={210}
                endAngle={-30}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: "var(--color-secondary)" }} dataKey="value" cornerRadius={6} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="font-display text-2xl font-extrabold">
                  {formatCurrency(closedBusiness)}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-primary">
                  {pct}% of {formatCurrency(target)}
                </div>
              </div>
            </div>
          </div>
        </Widget>

        <Widget title="Sales Pipeline by Stage" subtitle="Is there enough business in the pipeline?" wide>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pipelineByStage} layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" tick={{ fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="var(--color-muted-foreground)"
                tick={{ fontSize: 10 }}
                width={100}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {pipelineByStage.map((_, i) => (
                  <Cell key={i} fill={chartFill(i)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Widget>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Widget title="Sales Activity by Rep" subtitle="Are reps engaging in the right activity?">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={repActivity}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Calls" stackId="a" fill="var(--color-chart-1)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Emails" stackId="a" fill="var(--color-chart-3)" />
              <Bar dataKey="Meetings" stackId="a" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Widget>

        <Widget title="Month Over Month Growth" subtitle="How does this month compare to the previous?">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growth}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="growth"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ fill: "var(--color-primary)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Widget>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Widget title="Forecast by Month" subtitle="What's the status of expected deals?" wide>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={forecast}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Pipeline" stackId="b" fill="var(--color-chart-3)" />
              <Bar dataKey="Best Case" stackId="b" fill="var(--color-chart-1)" />
              <Bar dataKey="Commit" stackId="b" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Widget>

        <Widget title="Pipeline by Rep" subtitle="How is each rep tracking toward target?">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineByRep} layout="vertical">
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
              <YAxis type="category" dataKey="name" stroke="var(--color-muted-foreground)" tick={{ fontSize: 10 }} width={110} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Widget>
      </div>
    </div>
  );
}

function chartFill(i: number) {
  const colors = [
    "var(--color-chart-3)",
    "var(--color-chart-1)",
    "var(--color-chart-4)",
    "var(--color-chart-2)",
    "var(--color-chart-5)",
  ];
  return colors[i % colors.length];
}

const tooltipStyle = {
  backgroundColor: "oklch(0.165 0.014 285)",
  border: "1px solid oklch(1 0 0 / 0.1)",
  borderRadius: 8,
  fontSize: 11,
} as const;

function Widget({
  title,
  subtitle,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`phaos-card rounded-xl p-5 ${wide ? "md:col-span-2" : ""}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
