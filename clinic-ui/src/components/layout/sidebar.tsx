import { ChevronLeft, ChevronRight, HeartPulse } from "lucide-react";

import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

import { mainNavigation, secondaryNavigation } from "./navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden h-svh shrink-0 border-r bg-white transition-[width] duration-200 lg:flex lg:flex-col",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-16 items-center border-b px-4",
          collapsed ? "justify-center" : "gap-3",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-clinexa-700 text-white shadow-sm">
          <HeartPulse className="size-5" />
        </div>

        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-900">
              Clinexa
            </p>

            <p className="truncate text-xs text-slate-500">Healthcare</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavigationSection items={mainNavigation} collapsed={collapsed} />

        <div className="my-4 border-t" />

        <NavigationSection items={secondaryNavigation} collapsed={collapsed} />
      </nav>

      {/* Collapse button */}
      <div className="border-t p-3">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex h-10 w-full items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900",
            collapsed ? "justify-center" : "gap-3 px-3",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4" />

              <span className="text-sm">Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

interface NavigationSectionProps {
  items: typeof mainNavigation;
  collapsed: boolean;
}

function NavigationSection({ items, collapsed }: NavigationSectionProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex h-10 items-center rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center" : "gap-3 px-3",
                isActive
                  ? "bg-clinexa-50 text-clinexa-700"
                  : "text-slate-600 hover:bg-clinexa-50 hover:text-clinexa-700",
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <Icon className="size-[18px] shrink-0" />

            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        );
      })}
    </div>
  );
}
