import {
  CalendarDays,
  LayoutDashboard,
  MoreHorizontal,
  Pill,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  {
    label: "Home",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Patients",
    path: "/patients",
    icon: Users,
  },
  {
    label: "Appointments",
    path: "/appointments",
    icon: CalendarDays,
  },
  {
    label: "Pharmacy",
    path: "/pharmacy",
    icon: Pill,
  },
];

interface MobileBottomNavProps {
  onMoreClick: () => void;
}

export function MobileBottomNav({ onMoreClick }: MobileBottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid h-16 grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors",
                  isActive
                    ? "text-clinexa-700"
                    : "text-slate-500 hover:text-clinexa-700",
                )
              }
            >
              <Icon className="size-5" />

              <span className="text-[11px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-1 text-slate-500 transition-colors hover:text-slate-900"
        >
          <MoreHorizontal className="size-5" />

          <span className="text-[11px] font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}
