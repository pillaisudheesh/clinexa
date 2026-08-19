import { Badge } from "@/components/ui/badge";

interface PatientStatusBadgeProps {
  isActive: boolean;
}

export function PatientStatusBadge({ isActive }: PatientStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }
    >
      <span
        className={
          isActive
            ? "mr-1.5 size-1.5 rounded-full bg-emerald-500"
            : "mr-1.5 size-1.5 rounded-full bg-slate-400"
        }
      />

      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
