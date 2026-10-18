import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { clinicSettingsService } from "@/services/clinic-settings-service";

interface ClinicLogoProps {
  logoUrl?: string | null;
  clinicName?: string | null;
  className?: string;
  fallbackClassName?: string;
}

export function ClinicLogo({ logoUrl, clinicName, className = "size-10 rounded-lg object-contain", fallbackClassName = "flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700" }: ClinicLogoProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setSrc(null);
    if (!logoUrl) return () => { active = false; };
    if (/^https?:\/\//i.test(logoUrl)) { setSrc(logoUrl); return () => { active = false; }; }

    clinicSettingsService.getLogoObjectUrl(logoUrl)
      .then((url) => {
        if (active) {
          objectUrl = url;
          setSrc(url);
        } else {
          URL.revokeObjectURL(url);
        }
      })
      .catch((error) => console.error("Unable to load clinic logo", error));

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [logoUrl]);

  if (src) return <img src={src} alt={`${clinicName || "Clinic"} logo`} className={className} />;
  return <span className={fallbackClassName} aria-label={`${clinicName || "Clinic"} logo unavailable`}><Building2 className="size-5" /></span>;
}
