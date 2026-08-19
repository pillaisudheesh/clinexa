import { HeartPulse } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

import { mainNavigation, secondaryNavigation } from "./navigation";

interface MobileNavigationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNavigation({
  open,
  onOpenChange,
}: MobileNavigationProps) {
  const items = [...mainNavigation, ...secondaryNavigation];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-3 text-left">
            <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <HeartPulse className="size-5" />
            </div>

            <span>Clinexa</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 overflow-y-auto p-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onOpenChange(false)}
                className={({ isActive }) =>
                  cn(
                    "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-clinexa-50 text-clinexa-700"
                      : "text-slate-600 hover:bg-clinexa-50 hover:text-clinexa-700",
                  )
                }
              >
                <Icon className="size-[18px]" />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
