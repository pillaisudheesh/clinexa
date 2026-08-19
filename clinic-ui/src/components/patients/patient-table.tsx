import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PatientStatusBadge } from "./patient-status-badge";

import type { Patient } from "@/types/patient";

interface PatientTableProps {
  patients: Patient[];
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onToggleStatus: (patient: Patient) => void;
}

export function PatientTable({
  patients,
  onView,
  onEdit,
  onToggleStatus,
}: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-48 items-center justify-center">
          <p className="text-sm text-app-muted">No patients found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="hidden overflow-hidden rounded-xl border bg-white md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Patient #</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {patients.map((patient) => (
            <TableRow
              key={patient.id}
              className="cursor-pointer"
              onClick={() => onView(patient)}
            >
              <TableCell>
                <div>
                  <p className="font-medium text-app-text">
                    {patient.fullName}
                  </p>

                  {patient.email && (
                    <p className="text-xs text-app-muted">{patient.email}</p>
                  )}
                </div>
              </TableCell>

              <TableCell className="font-mono text-xs">
                {patient.patientNumber}
              </TableCell>

              <TableCell>{formatGender(patient.gender)}</TableCell>

              <TableCell>{patient.age}</TableCell>

              <TableCell>{patient.phone || "—"}</TableCell>

              <TableCell>
                <PatientStatusBadge isActive={patient.isActive} />
              </TableCell>

              <TableCell>
                <div onClick={(event) => event.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(patient)}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatGender(gender: Patient["gender"]) {
  switch (gender) {
    case "MALE":
      return "Male";

    case "FEMALE":
      return "Female";

    default:
      return "Other";
  }
}
