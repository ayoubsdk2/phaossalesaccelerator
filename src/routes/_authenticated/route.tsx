import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { AppTopbar } from "@/components/shell/AppTopbar";
import { PowerDialerPanel } from "@/components/dialer/PowerDialerPanel";
import { MobileBottomNav } from "@/components/shell/MobileBottomNav";
import { useActiveCall } from "@/stores/active-call";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const panelOpen = useActiveCall((s) => s.panelOpen);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user.id]);

  const userName = profile?.full_name ?? user.email?.split("@")[0] ?? "User";

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar userName={userName} userEmail={user.email ?? ""} />
        <main
          className={cn(
            "flex-1 min-w-0 pb-20 md:pb-0 transition-[padding] duration-300",
            panelOpen && "lg:pr-[360px]",
          )}
        >
          <Outlet />
        </main>
        <MobileBottomNav />
      </div>
      <PowerDialerPanel />
    </div>
  );
}
