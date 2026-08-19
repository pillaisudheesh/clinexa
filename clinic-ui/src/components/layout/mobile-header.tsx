import { Bell, HeartPulse, Menu } from "lucide-react";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4 lg:hidden">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-clinexa-700 shadow-sm text-white">
            <HeartPulse className="size-4" />
          </div>

          <span className="font-semibold text-slate-900">Clinexa</span>
        </div>
      </div>

      <button
        type="button"
        className="relative flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-clinexa-50"
        aria-label="Notifications"
      >
        <Bell className="size-5" />

        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" />
      </button>
    </header>
  );
}
