import { cn } from "@/lib/utils";

interface ClinexaBrandProps {
  variant?: "default" | "white";
  compact?: boolean;
  className?: string;
}

export function ClinexaBrand({
  variant = "default",
  compact = false,
  className,
}: ClinexaBrandProps) {
  const src = compact
    ? variant === "white"
      ? "/brand/clinexa-icon-white.svg"
      : "/brand/clinexa-icon.svg"
    : variant === "white"
      ? "/brand/clinexa-logo-white.svg"
      : "/brand/clinexa-logo.svg";

  return (
    <img
      src={src}
      alt="Clinexa"
      draggable={false}
      className={cn(
        "block object-contain",
        compact ? "h-9 w-9" : "h-10 w-auto",
        className,
      )}
    />
  );
}
