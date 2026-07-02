import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import {
  Upload,
  Search,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  File,
  Cloud,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Documents · Phaos CRM" },
      { name: "description", content: "Centralized document library across leads, deals, and contacts." },
    ],
  }),
  component: DocsPage,
});

const SOURCES = ["Owned by Me", "Shared with Me", "Recent", "Following", "Libraries"];
const EXTERNAL = ["Phaos Cloud", "Google Drive"];

function fmtSize(b: number) {
  if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)}MB`;
  if (b >= 1024) return `${Math.round(b / 1024)}KB`;
  return `${b}B`;
}

function FileIcon({ type }: { type: string }) {
  const t = (type || "").toLowerCase();
  if (t === "xlsx" || t === "csv")
    return <div className="grid size-9 shrink-0 place-items-center rounded bg-success/15 text-success"><FileSpreadsheet className="size-4" /></div>;
  if (t === "pptx" || t === "key")
    return <div className="grid size-9 shrink-0 place-items-center rounded bg-warning/15 text-warning"><Presentation className="size-4" /></div>;
  if (t === "pdf")
    return <div className="grid size-9 shrink-0 place-items-center rounded bg-destructive/15 text-destructive"><FileText className="size-4" /></div>;
  if (t === "docx" || t === "doc")
    return <div className="grid size-9 shrink-0 place-items-center rounded bg-info/15 text-info"><FileText className="size-4" /></div>;
  if (t === "jpg" || t === "png" || t === "webp")
    return <div className="grid size-9 shrink-0 place-items-center rounded bg-primary/15 text-primary"><ImageIcon className="size-4" /></div>;
  return <div className="grid size-9 shrink-0 place-items-center rounded bg-secondary text-muted-foreground"><File className="size-4" /></div>;
}

function DocsPage() {
  const [source, setSource] = useState("Owned by Me");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const { data: docs = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => (await supabase.from("documents").select("*").order("uploaded_at", { ascending: false })).data ?? [],
  });

  const filtered = docs.filter(
    (d: any) => d.source === source && d.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
          Modules · Documents
        </p>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
          Document Library
        </h1>
      </header>

      <div className="phaos-card rounded-xl overflow-hidden">
        <div className="text-center py-4 border-b border-border font-display text-lg font-extrabold">
          Select File
        </div>
        <div className="grid grid-cols-[220px_minmax(0,1fr)] min-h-[500px]">
          {/* Left source rail */}
          <div className="p-4 border-r border-border space-y-1">
            <button className="w-full mb-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold phaos-glow inline-flex items-center justify-center gap-2">
              <Upload className="size-3.5" />
              Upload File
            </button>
            <div className="space-y-0.5">
              {SOURCES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSource(s)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors",
                    source === s
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="pt-4 mt-3 border-t border-border">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                External Sources
              </p>
              {EXTERNAL.map((s) => (
                <button
                  key={s}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center gap-2"
                >
                  {s === "Phaos Cloud" ? <Cloud className="size-3.5" /> : <HardDrive className="size-3.5" />}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Right list + preview */}
          <div className="flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search files…"
                  className="w-full bg-background/60 border border-border rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-10">No files in this source.</p>
              )}
              {filtered.map((d: any) => (
                <button
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  className={cn(
                    "w-full px-4 py-3 flex items-center gap-3 border-b border-border last:border-0 text-left hover:bg-secondary/40 transition-colors",
                    selected === d.id && "bg-primary/5",
                  )}
                >
                  <FileIcon type={d.file_type} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{d.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(d.uploaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {" · "}
                      {fmtSize(Number(d.size_bytes || 0))}
                      {" · "}
                      <span className="uppercase">{d.file_type}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-border flex items-center justify-end gap-2">
              <button className="px-4 py-1.5 rounded-md border border-border bg-secondary/60 text-xs font-semibold">
                Cancel
              </button>
              <button
                disabled={!selected}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-semibold",
                  selected ? "bg-primary text-primary-foreground phaos-glow" : "bg-secondary text-muted-foreground",
                )}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
