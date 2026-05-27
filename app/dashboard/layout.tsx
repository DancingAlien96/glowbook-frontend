import RequireAuth from "../_components/auth/RequireAuth";
import Sidebar from "../_components/dashboard/Sidebar";
import Topbar from "../_components/dashboard/Topbar";
import BillingBanner from "../_components/dashboard/BillingBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allow={["OWNER"]}>
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <Topbar />
          <BillingBanner />
          <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
