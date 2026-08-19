import { ChevronRight, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { PatientStatusBadge } from "./patient-status-badge";

import type { Patient } from "@/types/patient";

interface PatientCardProps {
  patient: Patient;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
}

export function PatientCard({ patient, onView, onEdit }: PatientCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onView(patient)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-app-text">
              {patient.fullName}
            </h3>

            <p className="mt-0.5 font-mono text-xs text-app-muted">
              {patient.patientNumber}
            </p>
          </div>

          <PatientStatusBadge isActive={patient.isActive} />
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-app-muted">
            <span className="w-12">Age</span>

            <span className="text-app-text">{patient.age} years</span>
          </div>

          {patient.phone && (
            <div className="flex items-center gap-2 text-app-muted">
              <Phone className="size-4" />

              <span className="truncate text-app-text">{patient.phone}</span>
            </div>
          )}

          {patient.email && (
            <div className="flex items-center gap-2 text-app-muted">
              <Mail className="size-4" />

              <span className="truncate text-app-text">{patient.email}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(patient);
            }}
          >
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-clinexa-700"
            onClick={() => onView(patient)}
          >
            View
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
