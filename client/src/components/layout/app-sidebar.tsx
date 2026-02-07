"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores";
import { cn } from "@/lib/utils";
import { getNavItems } from "./nav-config";

export function AppSidebar() {
  const pathname = usePathname();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const sections = getNavItems(isAdmin);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50 border-r bg-background">
      <div className="h-14 border-b" />

      <nav className="flex-1 overflow-y-auto p-4">
        {sections.map((section, idx) => (
          <div key={idx} className={cn(idx > 0 && "mt-6")}>
            {section.title && (
              <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
