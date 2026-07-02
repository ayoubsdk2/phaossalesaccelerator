import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { initials, timeAgo } from "@/lib/format";
import { useActiveCall } from "@/stores/active-call";
import { useState } from "react";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  CheckSquare,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronsRight,
  Video,
  FileText,
  PhoneCall as PhoneCallIcon,
  Sparkles,
  TrendingUp,
  Building2,
  Globe,
  Users,
  DollarSign,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/leads/$id")({
  head: () => ({
    meta: [{ title: "Contact · Phaos CRM" }],
  }),
  component: ContactPage,
});

const TABS = ["Activity", "Notes", "Emails", "Calls", "Tasks"] as const;

function ContactPage() {
  const { id } = Route.useParams();
  const startCall = useActiveCall((s) => s.startCall);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Activity");

  const { data: contact } = useQuery({
    queryKey: ["contact", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("contacts")
        .select("*, companies(*)")
        .eq("id", id)
        .maybeSingle();
      return data;
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("contact_id", id)
        .order("occurred_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["deals", id],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("*").eq("contact_id", id);
      return data ?? [];
    },
  });

  if (!contact) {
    return <div className="p-8 text-muted-foreground text-sm">Loading…</div>;
  }

  const fullName = `${contact.first_name} ${contact.last_name}`;
  const company = contact.companies;

  // Match score for enrichment widget
  const enrichmentAttrs = [
    { name: "Type", value: 94 },
    { name: "Tech Used", value: 88 },
    { name: "Tech Category", value: 86 },
    { name: "Tags", value: 79 },
    { name: "Headcount", value: 92 },
  ];

  return (
    <div className="grid lg:grid-cols-[300px_minmax(0,1fr)_320px] min-h-[calc(100vh-3.5rem)]">
      {/* Left: profile */}
      <aside className="border-r border-border bg-surface/30 p-5 space-y-5 overflow-y-auto">
        <Link
          to="/leads"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          Contacts
        </Link>

        <div className="text-center">
          <div className="grid size-20 mx-auto place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xl font-bold text-primary-foreground phaos-glow">
            {initials(fullName)}
          </div>
          <h1 className="font-display text-xl font-extrabold mt-3">{fullName}</h1>
          <p className="text-xs text-muted-foreground">{contact.title}</p>
          <p className="text-xs text-primary">{company?.name}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="size-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Score {contact.score}
            </span>
          </div>
        </div>

        {/* quick actions */}
        <div className="grid grid-cols-6 gap-1">
          <QuickAction icon={<MessageSquare className="size-3.5" />} label="Note" />
          <QuickAction icon={<Mail className="size-3.5" />} label="Email" />
          <QuickAction
            icon={<Phone className="size-3.5" />}
            label="Call"
            onClick={() =>
              startCall({
                contactId: contact.id,
                name: fullName,
                title: contact.title ?? "",
                company: company?.name,
                phone: contact.phone ?? "",
              })
            }
            highlighted
          />
          <QuickAction icon={<Plus className="size-3.5" />} label="Log" />
          <QuickAction icon={<CheckSquare className="size-3.5" />} label="Task" />
          <QuickAction icon={<Calendar className="size-3.5" />} label="Meet" />
        </div>

        <Section title="About this contact">
          <Field label="Email" value={contact.email} mono />
          <Field label="Phone" value={contact.phone} mono />
          <Field label="Lead status" value={contact.lead_status} pill />
          <Field label="Lead source" value={contact.lead_source} />
          <Field label="Owner" value={contact.owner_name} />
          <Field label="Last activity" value={contact.last_activity_at ? timeAgo(contact.last_activity_at) : "—"} />
        </Section>

        {company && (
          <Section title="Company">
            <div className="flex items-center gap-2 mb-3">
              <div className="grid size-8 place-items-center rounded bg-primary/10 text-primary">
                <Building2 className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{company.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{company.domain}</p>
              </div>
            </div>
            <Field icon={<Globe className="size-3" />} label="Domain" value={company.domain} />
            <Field icon={<MapPin className="size-3" />} label="HQ" value={company.location} />
            <Field icon={<Users className="size-3" />} label="Employees" value={company.employees?.toLocaleString()} />
            <Field icon={<DollarSign className="size-3" />} label="Industry" value={company.industry} />
          </Section>
        )}
      </aside>

      {/* Center: activity feed */}
      <section className="p-5 lg:p-8 overflow-y-auto">
        <div className="flex items-center gap-6 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "py-3 text-sm font-semibold border-b-2 transition-colors",
                tab === t
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mt-4 mb-6 flex-wrap">
          <span className="text-xs text-muted-foreground">
            Filter activity ({activities.length}/{activities.length})
          </span>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              placeholder="Search timeline"
              className="bg-secondary/60 border border-border rounded-md py-1 pl-7 pr-3 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-3">
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No activity yet.</p>
          )}
          {activities.map((a: any) => (
            <ActivityRow key={a.id} a={a} />
          ))}
        </div>
      </section>

      {/* Right: enrichment / company / deals */}
      <aside className="border-l border-border bg-surface/30 p-5 space-y-5 overflow-y-auto">
        <Section title="Smart Enrichment" badge="Live">
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Company match
              </span>
              <span className="font-display text-2xl font-extrabold text-success">94%</span>
            </div>
            {enrichmentAttrs.map((a) => (
              <div key={a.name} className="space-y-0.5">
                <div className="flex justify-between text-[10px] font-medium">
                  <span className="text-muted-foreground">{a.name}</span>
                  <span className="font-mono">{a.value}%</span>
                </div>
                <div className="h-1 bg-background/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
                    style={{ width: `${a.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title={`Deals (${deals.length})`}>
          {deals.length === 0 ? (
            <button className="w-full py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary">
              + Add deal
            </button>
          ) : (
            deals.map((d: any) => (
              <div
                key={d.id}
                className="p-2 rounded border border-border bg-background/40 mb-1.5 flex items-center justify-between"
              >
                <span className="text-xs font-medium truncate">{d.title}</span>
                <span className="font-mono text-[10px] text-primary">${Number(d.value).toLocaleString()}</span>
              </div>
            ))
          )}
        </Section>

        <Section title="Tickets (0)">
          <p className="text-xs text-muted-foreground">No tickets opened.</p>
        </Section>
      </aside>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  highlighted,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  highlighted?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 py-2 rounded-md border transition-colors",
        highlighted
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background/40 text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </h3>
        {badge && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  pill,
  icon,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  pill?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="flex items-center gap-1 text-muted-foreground">
        {icon}
        {label}
      </span>
      {pill ? (
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
          {value || "—"}
        </span>
      ) : (
        <span className={cn("truncate text-right", mono && "font-mono text-[11px]")}>{value || "—"}</span>
      )}
    </div>
  );
}

function ActivityRow({ a }: { a: any }) {
  const ICONS: Record<string, React.ReactNode> = {
    lifecycle: <TrendingUp className="size-3.5" />,
    email: <Mail className="size-3.5" />,
    call: <PhoneCallIcon className="size-3.5" />,
    note: <MessageSquare className="size-3.5" />,
    meeting: <Calendar className="size-3.5" />,
    task: <CheckSquare className="size-3.5" />,
    form: <FileText className="size-3.5" />,
    video: <Video className="size-3.5" />,
    sms: <MessageSquare className="size-3.5" />,
  };
  return (
    <div className="phaos-card rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="size-8 shrink-0 grid place-items-center rounded-md bg-primary/10 text-primary">
          {ICONS[a.type] || <FileText className="size-3.5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-semibold text-sm truncate">{a.title}</p>
            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
              {timeAgo(a.occurred_at)}
            </span>
          </div>
          {a.body && <p className="text-xs text-muted-foreground mt-1">{a.body}</p>}
          {a.actor_name && (
            <p className="text-[10px] text-muted-foreground/70 mt-1.5 uppercase tracking-wider">
              {a.actor_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
