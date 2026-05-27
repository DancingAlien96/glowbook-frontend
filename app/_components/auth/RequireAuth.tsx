"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../_lib/auth";
import type { UserRole } from "../../_lib/types";

export const defaultRouteForRole = (role: UserRole | undefined): string => {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "OWNER":
    case "STAFF":
      return "/dashboard";
    case "STYLIST":
      return "/portal";
    default:
      return "/login";
  }
};

export default function RequireAuth({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow?: UserRole[];
}) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anonymous") {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
      return;
    }
    if (status === "authenticated" && allow && user && !allow.includes(user.role)) {
      router.replace(defaultRouteForRole(user.role));
    }
  }, [status, user, allow, pathname, router]);

  const wrongRole = !!(allow && user && !allow.includes(user.role));

  if (status !== "authenticated" || wrongRole) {
    return (
      <div className="min-h-screen grid place-items-center bg-aurora-soft">
        <div className="flex flex-col items-center gap-3 text-mauve-600">
          <span className="h-9 w-9 rounded-full border-2 border-mauve-900/15 border-t-mauve-900 animate-spin" />
          <span className="text-xs uppercase tracking-wider">Cargando…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
