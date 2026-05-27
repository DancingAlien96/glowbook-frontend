import RequireAuth from "../_components/auth/RequireAuth";
import AdminShell from "../_components/admin/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allow={["ADMIN"]}>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
