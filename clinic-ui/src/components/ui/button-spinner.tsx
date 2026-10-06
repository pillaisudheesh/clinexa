import { Loader2 } from "lucide-react";

interface ButtonSpinnerProps {
  label?: string;
}

export function ButtonSpinner({ label }: ButtonSpinnerProps) {
  return (
    <>
      <Loader2 className="size-4 animate-spin" />
      {label && <span>{label}</span>}
    </>
  );
}
