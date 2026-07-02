import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users2, KanbanSquare, BarChart3, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Deals", icon: KanbanSquare },
  { to: "/tasks", label: "Activities", icon: LayoutDashboard },
  { to: "/contacts", label: "Contacts", icon: Users2 },
  { to: "/analytics", label: "More", icon: BarChart3 },
] as const;

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 border-t border-border bg-background/95 backdrop-blur-xl flex items-center justify-around px-2">
      {items.map((item) => {
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
