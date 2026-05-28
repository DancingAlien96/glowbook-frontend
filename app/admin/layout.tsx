import type { Metadata } from "next";
import AdminGate from "../_components/admin/AdminGate";

// Hide /admin (and every subroute) from search engines. The gate itself also
// injects a noindex meta when the login form is showing.
export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  title: "Ecodama · Plataforma",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
