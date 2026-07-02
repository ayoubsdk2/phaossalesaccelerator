import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, initials } from "@/lib/format";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { AlertTriangle, ChevronRight, KanbanSquare, List, Edit3, Plus, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline · Phaos CRM" },
      { name: "description", content: "Visual sales pipeline with drag-and-drop deal management." },
    ],
  }),
  component: PipelinePage,
});

const STAGES = [
  { id: "qualified", label: "Qualified", color: "info" },
  { id: "contact_made", label: "Contact Made", color: "primary" },
  { id: "demo_scheduled", label: "Demo Scheduled", color: "warning" },
  { id: "proposal_made", label: "Proposal Made", color: "warning" },
  { id: "negotiations_started", label: "Negotiations Started", color: "success" },
] as const;

const COLOR_TOP: Record<string, string> = {
  blue: "bg-info",
  violet: "bg-primary",
  emerald: "bg-success",
  amber: "bg-warning",
  rose: "bg-destructive",
};

function PipelinePage() {
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const { data: deals = [] } = useQuery({
    queryKey: ["deals", "pipeline"],
    queryFn: async () => {
      const { data } = await supabase
        .from("deals")
        .select("*, contacts(first_name, last_name), companies(name)")
        .order("sort_order");
      return data ?? [];
    },
  });

  const totalValue = deals
    .filter((d: any) => d.status === "open")
    .reduce((a: number, d: any) => a + Number(d.value), 0);

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const dealId = e.active.id as string;
    const targetId = e.over?.id as string;
    if (!targetId) return;

    let patch: any = {};
    if (targetId === "drop-won") patch = { status: "won" };
    else if (targetId === "drop-lost") patch = { status: "lost" };
    else if (targetId === "drop-delete") {
      await supabase.from("deals").delete().eq("id", dealId);
      qc.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal deleted");
      return;
    } else if (STAGES.some((s) => s.id === targetId)) {
      patch = { stage: targetId };
    } else {
      return;
    }
    await supabase.from("deals").update(patch).eq("id", dealId);
    qc.invalidateQueries({ queryKey: ["deals"] });
    toast.success("Deal moved");
  }

  const activeDeal = activeId ? deals.find((d: any) => d.id === activeId) : null;

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0 flex items-center gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Modules · Pipeline
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight truncate">
              Deal Board
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-1 ml-4">
            <ViewBtn active icon={<KanbanSquare className="size-3.5" />} />
            <ViewBtn icon={<List className="size-3.5" />} />
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end">
            <span className="font-mono text-sm font-bold">
              {formatCurrency(totalValue)}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {deals.filter((d: any) => d.status === "open").length} open deals
            </span>
          </div>
          <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold phaos-glow inline-flex items-center gap-1.5">
            <Plus className="size-3.5" />
            Deal
          </button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => {
              const stageDeals = deals.filter(
                (d: any) => d.stage === stage.id && d.status === "open",
              );
              const stageValue = stageDeals.reduce((a: number, d: any) => a + Number(d.value), 0);
              return (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  deals={stageDeals}
                  total={stageValue}
                />
              );
            })}
          </div>
        </div>

        {/* Drop zones */}
        {activeId && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-3 phaos-card rounded-full p-2">
            <DropZone id="drop-delete" label="Delete" tone="muted" icon={<Trash2 className="size-3.5" />} />
            <DropZone id="drop-lost" label="Lost" tone="destructive" icon={<X className="size-3.5" />} />
            <DropZone id="drop-won" label="Won" tone="success" icon={<Check className="size-3.5" />} />
          </div>
        )}

        <DragOverlay>
          {activeDeal && <DealCard deal={activeDeal} isDragging />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function ViewBtn({ active, icon }: { active?: boolean; icon: React.ReactNode }) {
  return (
    <button
      className={cn(
        "size-8 grid place-items-center rounded-md border transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-secondary/60 text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
    </button>
  );
}

function StageColumn({ stage, deals, total }: { stage: typeof STAGES[number]; deals: any[]; total: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <div ref={setNodeRef} className="w-[300px] shrink-0">
      <div className="phaos-card rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm">{stage.label}</h3>
          <span className="size-2 rounded-full bg-primary/40" />
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <span>{formatCurrency(total)}</span>
          <span>·</span>
          <span>{deals.length} deals</span>
        </div>
      </div>
      <div className={cn("space-y-2 min-h-[300px] p-1 rounded-md transition-colors", isOver && "bg-primary/5 ring-1 ring-primary/30")}>
        {deals.map((d: any) => (
          <DraggableDeal key={d.id} deal={d} />
        ))}
      </div>
    </div>
  );
}

function DraggableDeal({ deal }: { deal: any }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn("touch-none", isDragging && "opacity-30")}
    >
      <DealCard deal={deal} />
    </div>
  );
}

function DealCard({ deal, isDragging }: { deal: any; isDragging?: boolean }) {
  return (
    <div
      className={cn(
        "phaos-card rounded-lg p-3 cursor-grab active:cursor-grabbing transition-shadow",
        isDragging && "shadow-2xl phaos-glow",
      )}
    >
      <div className="flex gap-0.5 mb-2.5">
        <span className={cn("h-1 flex-1 rounded-full", COLOR_TOP[deal.color_top] || "bg-primary")} />
        <span className={cn("h-1 flex-1 rounded-full", COLOR_TOP[deal.color_bottom] || "bg-warning")} />
      </div>
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-sm leading-tight">{deal.title}</h4>
        <ChevronRight className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
      </div>
      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
        {deal.companies?.name || (deal.contacts ? `${deal.contacts.first_name} ${deal.contacts.last_name}` : "")}
      </p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <div className="grid size-5 place-items-center rounded-full bg-secondary text-[9px] font-bold">
            {initials(deal.owner_name)}
          </div>
          <span className="font-mono text-xs text-foreground/80">
            {formatCurrency(Number(deal.value))}
          </span>
        </div>
        {deal.rotting && (
          <span className="text-warning" title="Rotting deal">
            <AlertTriangle className="size-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}

function DropZone({
  id,
  label,
  tone,
  icon,
}: {
  id: string;
  label: string;
  tone: "muted" | "destructive" | "success";
  icon: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "px-4 py-2 rounded-full border-2 border-dashed flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all",
        tone === "muted" && "border-muted-foreground/40 text-muted-foreground",
        tone === "destructive" && "border-destructive/60 text-destructive",
        tone === "success" && "border-success/60 text-success",
        isOver && tone === "success" && "bg-success/20 scale-110",
        isOver && tone === "destructive" && "bg-destructive/20 scale-110",
        isOver && tone === "muted" && "bg-muted/30 scale-110",
      )}
    >
      {icon}
      {label}
    </div>
  );
}
