import BookingFlow from "../../_components/booking/BookingFlow";

// This page has no server-rendered content of its own — BookingFlow is a
// "use client" component that fetches the salon's public data live, in the
// browser, on every visit. Statically prerendering it (generateStaticParams
// + ISR) bought nothing and actively hurt: Next cached the compiled page
// shell per slug and kept serving that stale shell for up to
// stale-time after every deploy, so a fresh redesign could sit invisible
// behind the old cached HTML for minutes after a "successful" deploy —
// exactly what happened here. force-dynamic renders fresh on every request
// (still cheap: there's nothing to compute server-side) and removes this
// whole class of staleness.
export const dynamic = "force-dynamic";

export default async function BookSalonPage({
  params,
}: {
  params: Promise<{ salon: string }>;
}) {
  const { salon } = await params;
  return <BookingFlow salonSlug={salon} />;
}
