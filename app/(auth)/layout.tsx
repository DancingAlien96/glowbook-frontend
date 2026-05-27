import Link from "next/link";
import Logo from "../_components/shared/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-aurora-soft flex flex-col">
      <header className="px-6 py-5">
        <Link href="/" className="inline-flex items-center">
          <Logo className="h-16 w-auto" />
        </Link>
      </header>
      <main className="flex-1 grid place-items-center px-4 pb-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
