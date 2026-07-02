import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, timeAgo, initials } from "@/lib/format";
import {
  Filter,
  Plus,
  Settings2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { useActiveCall } from "@/stores/active-call";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/leads/")({
  head: () => ({
    meta: [
      { title: "Leads · Phaos CRM" },
      { name: "description", content: "Prioritized lead pipeline with smart filters and bulk actions." },
    ],
  }),
  component: LeadsPage,
});

const FILTERS = ["All Contacts", "Hot Leads", "Cold Calls", "Inbound", "Referrals"];

function LeadsPage() {
  const startCall = useActiveCall((s) => s.startCall);
  const [filter, setFilter] = useState("All Contacts");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts-with-company"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contacts")
        .select("*, companies(name)")
        .order("last_activity_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = contacts.filter((c: any) => {
    if (filter === "Hot Leads") return c.lead_status === "hot";
    if (filter === "Cold Calls") return c.lead_source === "Cold Call";
    if (filter === "Inbound") return c.lead_source === "Inbound";
    if (filter === "Referrals") return c.lead_source === "Employee Referral";
    return true;
  });

  function toggleAll() {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((c: any) => c.id)));
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Modules · Leads
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight truncate">
            Lead Pipeline
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="px-3 py-1.5 rounded-md border border-border bg-secondary/60 text-xs font-semibold inline-flex items-center gap-1.5">
            Actions <ChevronDown className="size-3" />
          </button>
          <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold phaos-glow inline-flex items-center gap-1.5">
            <Plus className="size-3.5" />
            Create Contact
          </button>
        </div>
      </header>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button className="size-8 grid place-items-center rounded-md border border-border bg-secondary/60 text-muted-foreground hover:text-foreground">
            <Filter className="size-3.5" />
          </button>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors",
                filter === f
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border bg-secondary/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Total Records {filtered.length}
          </span>
          <div className="flex items-center gap-1 border border-border rounded-md bg-secondary/60">
            <button className="size-7 grid place-items-center hover:bg-secondary">
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="text-xs px-2 font-mono">1–20</span>
            <button className="size-7 grid place-items-center hover:bg-secondary">
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="phaos-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/40">
                <th className="px-3 py-2.5 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="accent-primary"
                  />
                </th>
                <Th>Last Name</Th>
                <Th>Lead Source</Th>
                <Th>Phone</Th>
                <Th align="right">Annual Revenue</Th>
                <Th>Email</Th>
                <th className="px-3 py-2.5 w-20"></th>
                <th className="px-3 py-2.5 w-10">
                  <Settings2 className="size-3.5 text-muted-foreground" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 group">
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => {
                        const next = new Set(selected);
                        next.has(c.id) ? next.delete(c.id) : next.add(c.id);
                        setSelected(next);
                      }}
                      className="accent-primary"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <Link
                      to="/leads/$id"
                      params={{ id: c.id }}
                      className="flex items-center gap-2.5 group/link"
                    >
                      <div className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-primary/40 to-primary-glow/40 text-[10px] font-bold">
                        {initials(`${c.first_name} ${c.last_name}`)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate group-hover/link:text-primary transition-colors">
                          {c.last_name}, {c.first_name}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {c.companies?.name}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{c.lead_source}</td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-xs">{c.phone}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    {c.annual_revenue ? formatCurrency(c.annual_revenue) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[200px]">{c.email}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          startCall({
                            contactId: c.id,
                            name: `${c.first_name} ${c.last_name}`,
                            title: c.title,
                            company: c.companies?.name,
                            phone: c.phone,
                          });
                        }}
                        className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Phone className="size-3.5" />
                      </button>
                      <button className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <Mail className="size-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-block size-2 rounded-full",
                        c.lead_status === "hot" && "bg-destructive shadow-[0_0_6px] shadow-destructive",
                        c.lead_status === "warm" && "bg-warning",
                        c.lead_status === "cold" && "bg-info/60",
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-${align}`}
    >
      {children}
    </th>
  );
}
