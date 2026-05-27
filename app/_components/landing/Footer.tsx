import Link from "next/link";
import Logo from "../shared/Logo";

const cols = [
  {
    title: "Producto",
    links: [
      { href: "#features", label: "Funciones" },
      { href: "#pricing", label: "Precios" },
      { href: "#mockups", label: "Tour del producto" },
      { href: "/book/maison-rose", label: "Demo de reserva" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { href: "#", label: "Centro de ayuda" },
      { href: "#", label: "Guía para fundadoras" },
      { href: "#", label: "Casos de éxito" },
      { href: "#", label: "Cambios y novedades" },
    ],
  },
  {
    title: "Compañía",
    links: [
      { href: "#", label: "Sobre nosotros" },
      { href: "#", label: "Contacto" },
      { href: "#", label: "Términos" },
      { href: "#", label: "Privacidad" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div className="container-tight py-16">
        <div className="grid lg:grid-cols-[1.4fr_2fr] gap-12">
          <div>
            <Link href="/" className="flex items-center">
              <Logo className="h-14 w-auto" />
            </Link>
            <p className="mt-4 text-mauve-600 max-w-sm text-pretty">
              La plataforma premium de reservas para salones de belleza, spas y
              profesionales del cuidado personal.
            </p>

            <form className="mt-6 max-w-md">
              <label className="text-xs uppercase tracking-wider text-mauve-400">
                Recibe novedades y consejos
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="input-soft"
                />
                <button className="btn btn-primary h-[2.875rem] px-5 shrink-0">
                  Suscribirme
                </button>
              </div>
              <p className="mt-2 text-[11px] text-mauve-400">
                Sin spam. Cancela cuando quieras.
              </p>
            </form>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {cols.map((c) => (
              <div key={c.title}>
                <div className="text-xs uppercase tracking-[0.18em] text-mauve-400">{c.title}</div>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-mauve-700 hover:text-mauve-900 transition-colors text-sm">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="divider-gold mt-14" />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-mauve-400">
          <span>© {new Date().getFullYear()} Ecodama. Hecho con ✦ para salones premium.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-mauve-900 transition-colors">Instagram</a>
            <a href="#" className="hover:text-mauve-900 transition-colors">TikTok</a>
            <a href="#" className="hover:text-mauve-900 transition-colors">Pinterest</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
