import type { AppointmentStatus, PaymentStatus } from "./types";

export function statusChip(s: AppointmentStatus | string): string {
  switch (s) {
    case "CONFIRMED": return "status-confirmed";
    case "COMPLETED": return "status-completed";
    case "CANCELLED":
    case "NO_SHOW":   return "status-cancelled";
    default:          return "status-pending";
  }
}

export function translateStatus(s: AppointmentStatus | string): string {
  return ({
    PENDING: "Pendiente",
    CONFIRMED: "Confirmada",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
    NO_SHOW: "No asistió",
  } as Record<string, string>)[s] ?? s;
}

export function paymentChip(s: PaymentStatus | string): string {
  switch (s) {
    case "APPROVED": return "status-completed";
    case "REJECTED": return "status-cancelled";
    case "REFUNDED": return "chip-cream";
    default:         return "status-pending";
  }
}

export function translatePayment(s: PaymentStatus | string): string {
  return ({
    PENDING_REVIEW: "Por revisar",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
    REFUNDED: "Reembolsado",
  } as Record<string, string>)[s] ?? s;
}
