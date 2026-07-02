import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, initials, timeAgo } from "@/lib/format";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Building2, Users, Globe, MapPin, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({
    meta: [
      { title: "Contact Enrichment · Phaos CRM" },
      { name: "description", content: "Smart contact enrichment with company match rate analysis." },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => (await supabase.from("companies").select("*")).data ?? [],
  });
  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts-overview"],
    queryFn: async () => (await supabase.from("contacts").select("id, created_at")).data ?? [],
  });

  const newCompanies = 1811;
  const newPeople = 2219;
  const visitors = 682;
  const companiesEnriched = 1579;
  const peopleEnriched = 1643;

  const spark = Array.from({ length: 12 }, (_, i) => ({ x: i, y: 30 + Math.sin(i / 2) * 20 + Math.random() * 10 }));

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <div className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold text-xl phaos-glow">
          DM
        </div>
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Good morning, <span className="text-primary">David</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Users className="size-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Phaos Workspace</span>
          </div>
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="size-6 grid place-items-center rounded bg-primary/10 text-primary">
              <TrendingUp className="size-3.5" />
            </div>
            <h2 className="font-semibold">Data Overview</h2>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <RangeBtn>Last 7 Days</RangeBtn>
            <RangeBtn>Last 14 Days</RangeBtn>
            <RangeBtn active>Last 30 Days</RangeBtn>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="New companies" value={newCompanies.toLocaleString()} color="primary" spark={spark} />
          <MetricCard label="New people" value={newPeople.toLocaleString()} color="success" spark={spark} />
          <MetricCard label="Visitors to your site" value={visitors.toLocaleString()} color="info" spark={spark} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <MetricCard label="Companies enriched in Phaos" value={companiesEnriched.toLocaleString()} color="primary" spark={spark} large />
          <MetricCard label="People enriched in Phaos" value={peopleEnriched.toLocaleString()} color="success" spark={spark} large />
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="size-6 grid place-items-center rounded bg-primary/10 text-primary">
            <Sparkles className="size-3.5" />
          </div>
          <h2 className="font-semibold">Match Rate Analysis</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="phaos-card rounded-xl p-5">
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Company match rate</p>
                <p className="font-display text-3xl font-extrabold text-success mt-1">94%</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4">Companies analyzed</p>
                <p className="font-display text-2xl font-extrabold mt-1">1,891</p>
              </div>
              <div className="w-32 h-32">
                <ResponsiveContainer>
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "match", value: 94, fill: "var(--color-success)" }]} startAngle={90} endAngle={-270}>
                    <RadialBar background={{ fill: "var(--color-secondary)" }} dataKey="value" cornerRadius={6} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                ["Type", 94],
                ["Tech Used", 88],
                ["Tech Category", 86],
                ["Tags", 79],
              ].map(([n, v]) => (
                <div key={n as string}>
                  <div className="flex justify-between text-[10px] font-medium">
                    <span className="text-muted-foreground">{n}</span>
                    <span className="font-mono">{v}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-background/60 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="phaos-card rounded-xl p-5">
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">People match rate</p>
                <p className="font-display text-3xl font-extrabold text-success mt-1">72%</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4">People analyzed</p>
                <p className="font-display text-2xl font-extrabold mt-1">2,448</p>
              </div>
              <div className="w-32 h-32">
                <ResponsiveContainer>
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "match", value: 72, fill: "var(--color-primary)" }]} startAngle={90} endAngle={-270}>
                    <RadialBar background={{ fill: "var(--color-secondary)" }} dataKey="value" cornerRadius={6} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                ["Title", 82],
                ["Seniority", 76],
                ["Department", 70],
                ["Email", 66],
              ].map(([n, v]) => (
                <div key={n as string}>
                  <div className="flex justify-between text-[10px] font-medium">
                    <span className="text-muted-foreground">{n}</span>
                    <span className="font-mono">{v}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-background/60 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-success to-info" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-4">All Companies ({companies.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {companies.map((c: any) => (
            <div key={c.id} className="phaos-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{c.domain}</p>
                </div>
                <span className="text-[10px] font-mono text-success">
                  {formatCurrency(Number(c.annual_revenue || 0))}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-2.5" />
                  {c.location}
                </span>
                <span className="text-muted-foreground flex items-center gap-1 justify-end">
                  <Users className="size-2.5" />
                  {c.employees?.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function RangeBtn({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      className={
        active
          ? "px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold"
          : "px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground"
      }
    >
      {children}
    </button>
  );
}

function MetricCard({
  label,
  value,
  color,
  spark,
  large,
}: {
  label: string;
  value: string;
  color: "primary" | "success" | "info";
  spark: { x: number; y: number }[];
  large?: boolean;
}) {
  const colorVar = `var(--color-${color})`;
  return (
    <div className={"phaos-card rounded-xl p-5 " + (large ? "min-h-[180px]" : "")}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="size-1.5 rounded-full" style={{ background: colorVar }} />
      </div>
      <p className="font-display text-3xl font-extrabold">{value}</p>
      <div className="h-12 mt-3 -mx-2">
        <ResponsiveContainer>
          <AreaChart data={spark}>
            <defs>
              <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colorVar} stopOpacity={0.5} />
                <stop offset="100%" stopColor={colorVar} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="y" stroke={colorVar} strokeWidth={2} fill={`url(#spark-${color})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
