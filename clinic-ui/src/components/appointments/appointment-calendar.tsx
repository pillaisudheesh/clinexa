import { useCallback, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import "./appointment-calendar.css";
import type { DatesSetArg, EventClickArg, DateSelectArg, DateClickArg, EventInput } from "@fullcalendar/core";

import { appointmentService } from "@/services/appointment-service";
import type { Appointment, AppointmentStatus, AppointmentType } from "@/types/appointment";

type AppointmentCalendarProps = {
  canRead: boolean;
  compact?: boolean;
  status?: AppointmentStatus | "";
  type?: AppointmentType | "";
  onDateSelect?: (date: string) => void;
  onAppointmentSelect?: (appointment: Appointment) => void;
};

function dateKey(value: Date | string) {
  const date = typeof value === "string" ? value.slice(0, 10) : value.toLocaleDateString("en-CA");
  return date;
}

function patientName(appointment: Appointment) {
  const patient = appointment.patient;
  if (!patient) return "Appointment";
  return [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(" ") || "Appointment";
}

function statusColor(status: AppointmentStatus) {
  switch (status) {
    case "CONFIRMED": return { backgroundColor: "#2563eb", borderColor: "#2563eb" };
    case "CHECKED_IN": return { backgroundColor: "#d97706", borderColor: "#d97706" };
    case "IN_CONSULTATION": return { backgroundColor: "#7c3aed", borderColor: "#7c3aed" };
    case "COMPLETED": return { backgroundColor: "#0f766e", borderColor: "#0f766e" };
    case "CANCELLED": return { backgroundColor: "#dc2626", borderColor: "#dc2626" };
    case "NO_SHOW": return { backgroundColor: "#ea580c", borderColor: "#ea580c" };
    default: return { backgroundColor: "#64748b", borderColor: "#64748b" };
  }
}

export function AppointmentCalendar({
  canRead,
  compact = false,
  status = "",
  type = "",
  onDateSelect,
  onAppointmentSelect,
}: AppointmentCalendarProps) {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const requestId = useRef(0);
  const rangeKey = useRef("");

  const loadRange = useCallback(async (start: string, end: string) => {
    if (!canRead) {
      setEvents([]);
      return;
    }
    const key = `${start}|${end}|${status}|${type}`;
    if (rangeKey.current === key) return;
    rangeKey.current = key;
    const currentRequest = ++requestId.current;
    setLoading(true);
    setLoadError(false);
    try {
      const response = await appointmentService.getAppointments({
        page: 1,
        limit: 500,
        fromDate: start,
        toDate: end,
        status: status || undefined,
        type: type || undefined,
        sortBy: "appointmentDate",
        sortOrder: "asc",
      });
      if (currentRequest !== requestId.current) return;
      const appointments = Array.isArray(response.items) ? response.items : [];
      setEvents(appointments.map((appointment) => {
        const day = dateKey(appointment.appointmentDate);
        const colors = statusColor(appointment.status);
        return {
          id: appointment.id,
          title: patientName(appointment),
          start: `${day}T${appointment.startTime}`,
          end: `${day}T${appointment.endTime}`,
          ...colors,
          extendedProps: { appointment },
        };
      }));
    } catch (error) {
      console.error("Unable to load calendar appointments.", error);
      if (currentRequest === requestId.current) {
        setEvents([]);
        setLoadError(true);
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [canRead, status, type]);

  const handleDatesSet = useCallback((info: DatesSetArg) => {
    // FullCalendar's end is exclusive; API's toDate is inclusive.
    const start = dateKey(info.start);
    const end = new Date(info.end.getTime() - 86400000);
    void loadRange(start, dateKey(end));
  }, [loadRange]);

  const handleEventClick = useCallback((info: EventClickArg) => {
    const appointment = info.event.extendedProps.appointment as Appointment | undefined;
    if (appointment) onAppointmentSelect?.(appointment);
  }, [onAppointmentSelect]);

  const handleDateClick = useCallback((info: DateClickArg) => {
    onDateSelect?.(info.dateStr.slice(0, 10));
  }, [onDateSelect]);

  const handleSelect = useCallback((info: DateSelectArg) => {
    onDateSelect?.(info.startStr.slice(0, 10));
  }, [onDateSelect]);

  if (!canRead) {
    return <div className="flex min-h-40 items-center justify-center px-4 text-sm text-slate-500">You don&apos;t have permission to view appointments.</div>;
  }

  return (
    <div className={`appointment-calendar relative ${compact ? "appointment-calendar--compact" : ""}`}>
      {loading && <div className="absolute right-3 top-3 z-10 rounded-md bg-white/90 px-2 py-1 text-[11px] text-slate-500 shadow-sm">Loading…</div>}
      {loadError && <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">Couldn&apos;t load calendar appointments. Try changing the view or navigating to another date.</div>}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="timeGridDay"
        headerToolbar={compact
          ? { left: "title", right: "prev,next" }
          : { left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek" }}
        height={compact ? "auto" : "auto"}
        contentHeight={compact ? 420 : "auto"}
        aspectRatio={compact ? 1.45 : 1.8}
        dayMaxEvents={compact ? 2 : true}
        nowIndicator={!compact}
        selectable={!compact && Boolean(onDateSelect)}
        selectMirror={!compact}
        select={handleSelect}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        events={events}
        displayEventTime={!compact}
        eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
        slotMinTime={compact ? "08:00:00" : "07:00:00"}
        slotMaxTime={compact ? "18:00:00" : "21:00:00"}
        allDaySlot={false}
        weekends
        expandRows={!compact}
        stickyHeaderDates
        dayHeaderFormat={compact ? { weekday: "short", month: "short", day: "numeric" } : { weekday: "short", month: "numeric", day: "numeric" }}
        eventDisplay="block"
        moreLinkClick={compact ? "popover" : "day"}
      />
    </div>
  );
}
