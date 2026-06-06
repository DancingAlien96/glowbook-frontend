import BookingFlow from "../../_components/booking/BookingFlow";

export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const res = await fetch(`${apiUrl}/salons`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!res.ok) {
      console.warn(`Failed to fetch salons: ${res.status}`);
      return [];
    }

    const salons = await res.json();
    return salons.map((salon: { slug: string }) => ({
      salon: salon.slug,
    }));
  } catch (error) {
    console.warn("Error generating static params for /book/[salon]:", error);
    return [];
  }
}

export default async function BookSalonPage({
  params,
}: {
  params: Promise<{ salon: string }>;
}) {
  const { salon } = await params;
  return <BookingFlow salonSlug={salon} />;
}
