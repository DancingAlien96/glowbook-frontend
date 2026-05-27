import RequireAuth from "../_components/auth/RequireAuth";
import PortalShell from "../_components/portal/PortalShell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allow={["STYLIST"]}>
      <PortalShell>{children}</PortalShell>
    </RequireAuth>
  );
}
