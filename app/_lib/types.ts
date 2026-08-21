// Shared API DTO types — mirror the Prisma schema (kept loose to avoid coupling).

export type UserRole = "OWNER" | "STYLIST" | "STAFF" | "ADMIN";
export type DepositMode = "NONE" | "PERCENTAGE" | "FULL";
export type ApprovalMode = "MANUAL" | "AUTOMATIC";
export type ClientTag = "NEW" | "RETURNING" | "VIP";
export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
export type PaymentMethod = "TRANSFER" | "CARD" | "CASH" | "WALLET";
export type PaymentStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "REFUNDED";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  salonId?: string | null;
}

export interface MeUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  salon?: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    currency: string;
  } | null;
  stylist?: {
    id: string;
    role: string | null;
    active: boolean;
  } | null;
}

export interface Salon {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  coverImageUrl: string | null;
  brandColor: string;
  timezone: string;
  currency: string;
  depositMode: DepositMode;
  depositPercent: number;
  approvalMode: ApprovalMode;
  bankDetails: string | null;
  aboutText: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  whatsappContact: string | null;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  businessHours?: BusinessHour[];
  photos?: SalonPhoto[];
  testimonials?: Testimonial[];
}

export interface SalonPhoto {
  id: string;
  url: string;
  caption: string | null;
}

export interface Testimonial {
  id: string;
  clientName: string;
  text: string;
  rating: number;
  serviceName: string | null;
}

export interface BusinessHour {
  id: string;
  dayOfWeek: number;
  openMin: number;
  closeMin: number;
}

/** A weekly schedule row (salon or per-stylist). */
export interface WeekHour {
  dayOfWeek: number;
  openMin: number;
  closeMin: number;
}

export interface BlockedSlot {
  id: string;
  stylistId: string | null;
  startAt: string;
  endAt: string;
  reason: string | null;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  durationMin: number;
  priceCents: number;
  active: boolean;
  imageUrl?: string | null;
  stylists?: { stylistId: string }[];
}

export interface Stylist {
  id: string;
  name: string;
  role: string | null;
  active: boolean;
  photoUrl?: string | null;
  /** % of priceCents the stylist earns on COMPLETED appointments. 0-100. */
  commissionPercent?: number;
  services?: { serviceId: string }[];
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  tag: ClientTag;
  createdAt: string;
  updatedAt: string;
  _count?: { appointments: number };
}

export interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  durationMin: number;
  priceCents: number;
  depositCents: number;
  status: AppointmentStatus;
  notes: string | null;
  services: { service: { id: string; name: string; durationMin?: number; priceCents?: number } }[];
  stylist: { id: string; name: string } | null;
  client: { id: string; name: string; email?: string | null; phone?: string | null };
  payments?: { id: string; status: PaymentStatus; amountCents: number; method: PaymentMethod }[];
}

export interface Payment {
  id: string;
  amountCents: number;
  method: PaymentMethod;
  status: PaymentStatus;
  receiptUrl: string | null;
  receiptName: string | null;
  reference: string | null;
  rejectedReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  appointment: {
    id: string;
    client: { id: string; name: string };
    services: { service: { id: string; name: string } }[];
  };
}

export interface Metrics {
  todayAppointments: number;
  weekRevenueCents: number;
  weekRevenueBuckets: number[];
  pendingPayments: number;
  newClientsThisWeek: number;
}

// =========================
// Platform billing
// =========================
export type Plan = "MONTHLY" | "YEARLY" | "LIFETIME";
export type SubStatus = "TRIAL" | "ACTIVE" | "OVERDUE" | "SUSPENDED" | "CANCELLED" | "LIFETIME";
export type SubPaymentStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export interface Subscription {
  id: string;
  salonId: string;
  plan: Plan;
  status: SubStatus;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  amountCents: number;
  currency: string;
  status: SubPaymentStatus;
  periodMonths: number;
  receiptUrl: string | null;
  receiptName: string | null;
  reference: string | null;
  rejectedReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface PlatformInfo {
  bankDetails: string | null;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  lifetimePriceCents: number;
  contactEmail: string | null;
  contactWhatsapp: string | null;
  recurrenteUrl: string | null;
  recurrenteYearlyUrl: string | null;
  recurrenteLifetimeUrl: string | null;
}

export interface PlatformSettings extends PlatformInfo {
  id: string;
  trialDays: number;
  graceDays: number;
  updatedAt: string;
  createdAt: string;
}

export interface AdminMetrics {
  totalSalons: number;
  activeSubs: number;
  lifetimeSubs: number;
  overdueSubs: number;
  pendingPayments: number;
  mrrCents: number;
  monthRevenueCents: number;
}

export interface AdminSalon {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  subscription: Subscription | null;
  _count: { members: number; appointments: number };
}
