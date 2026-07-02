import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sun, Moon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [{ title: "Settings · Phaos CRM" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  }, [theme]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
      if (p) {
        setName(p.full_name ?? "");
        setTitle(p.title ?? "");
      }
    });
  }, []);

  async function save() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("profiles").update({ full_name: name, title }).eq("id", u.user.id);
    toast.success("Profile updated");
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
          System · Settings
        </p>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">Settings</h1>
      </header>

      <section className="phaos-card rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full bg-background/60 border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full bg-background/60 border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button onClick={save} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold phaos-glow">
          Save
        </button>
      </section>

      <section className="phaos-card rounded-xl p-6">
        <h2 className="font-semibold mb-4">Appearance</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 py-3 rounded-md border ${theme === "dark" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"} flex items-center justify-center gap-2`}
          >
            <Moon className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Phaos Dark</span>
          </button>
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 py-3 rounded-md border ${theme === "light" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"} flex items-center justify-center gap-2`}
          >
            <Sun className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Phaos Light</span>
          </button>
        </div>
      </section>

      <section className="phaos-card rounded-xl p-6">
        <h2 className="font-semibold">Voice Automation</h2>
        <p className="text-xs text-muted-foreground mt-2">
          Voice provider integration is provisioned and ready to connect. Configure your account once
          credentials are available in workspace secrets.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-success">
            Ready for activation
          </span>
        </div>
      </section>
    </div>
  );
}
