// Shape of GET /public/salons/:slug — shared by BookingFlow and the landing
// section components so they don't each redefine an overlapping subset.
export type PublicSalon = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  coverImageUrl: string | null;
  brandColor: string;
  currency: string;
  depositMode: "NONE" | "PERCENTAGE" | "FULL";
  depositPercent: number;
  bankDetails: string | null;
  aboutText: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  whatsappContact: string | null;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  photos: { id: string; url: string; caption: string | null }[];
  testimonials: { id: string; clientName: string; text: string; rating: number; serviceName: string | null }[];
  services: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    durationMin: number;
    priceCents: number;
    imageUrl: string | null;
  }[];
  stylists: { id: string; name: string; role: string | null; photoUrl: string | null }[];
  businessHours: { dayOfWeek: number; openMin: number; closeMin: number }[];
};
