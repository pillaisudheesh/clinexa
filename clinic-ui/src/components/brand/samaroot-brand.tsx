import { cn } from "@/lib/utils";

interface SamaRootBrandProps {
  variant?: "default" | "white";
  compact?: boolean;
  className?: string;
}

export function SamaRootBrand({
  variant = "default",
  compact = false,
  className,
}: SamaRootBrandProps) {
  const src = compact
    ? variant === "white"
      ? "/brand/samaroot-icon-white.svg"
      : "/brand/samaroot-icon.svg"
    : variant === "white"
      ? "/brand/samaroot-logo-white.svg"
      : "/brand/samaroot-logo.svg";

  return (
    <img
      src={src}
      alt="SamaRoot"
      draggable={false}
      className={cn(
        "block object-contain",
        compact ? "h-9 w-9" : "h-10 w-auto",
        className,
      )}
    />
  );
}
