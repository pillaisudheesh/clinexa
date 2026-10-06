import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  message?: string;
  className?: string;
}

export function PageLoader({
  message = "Loading...",
  className = "",
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex min-h-[280px] items-center justify-center ${className}`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50">
          <Loader2 className="size-5 animate-spin text-teal-600" />
        </div>
        <span className="text-sm font-medium text-slate-400">{message}</span>
      </div>
    </div>
  );
}
