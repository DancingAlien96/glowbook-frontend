import BookingFlow from "../../_components/booking/BookingFlow";

export default async function BookSalonPage({
  params,
}: {
  params: Promise<{ salon: string }>;
}) {
  const { salon } = await params;
  return <BookingFlow salonSlug={salon} />;
}
