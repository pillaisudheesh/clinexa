import { Loader2 } from "lucide-react";

interface SectionLoaderProps {
  message?: string;
  className?: string;
}

export function SectionLoader({
  message = "Loading...",
  className = "",
}: SectionLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex min-h-[160px] items-center justify-center ${className}`}
    >
      <div className="flex items-center gap-2.5 text-sm font-medium text-slate-400">
        <Loader2 className="size-4 animate-spin text-teal-500" />
        <span>{message}</span>
      </div>
    </div>
  );
}
