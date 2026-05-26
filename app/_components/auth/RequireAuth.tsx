"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../_lib/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anonymous") {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
    }
  }, [status, pathname, router]);

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen grid place-items-center bg-aurora-soft">
        <div className="flex flex-col items-center gap-3 text-mauve-600">
          <span className="h-9 w-9 rounded-full border-2 border-mauve-900/15 border-t-mauve-900 animate-spin" />
          <span className="text-xs uppercase tracking-wider">Cargando tu salón…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
