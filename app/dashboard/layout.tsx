import RequireAuth from "../_components/auth/RequireAuth";
import DashboardChrome from "../_components/dashboard/DashboardChrome";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allow={["OWNER"]}>
      <DashboardChrome>{children}</DashboardChrome>
    </RequireAuth>
  );
}
