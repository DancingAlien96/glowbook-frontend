import Link from "next/link";
import Logo from "../shared/Logo";
import { SUPPORT_MESSAGES, SUPPORT_WHATSAPP_DISPLAY, whatsappHref } from "../../_lib/support";

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
      { href: whatsappHref(SUPPORT_MESSAGES.general), label: "Centro de ayuda", external: true },
      { href: "#", label: "Guía para fundadoras" },
      { href: "#", label: "Casos de éxito" },
      { href: "#", label: "Cambios y novedades" },
    ],
  },
  {
    title: "Compañía",
    links: [
      { href: "#", label: "Sobre nosotros" },
      { href: whatsappHref(SUPPORT_MESSAGES.general), label: "Contacto", external: true },
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
              <Logo className="h-20 w-auto" />
            </Link>
            <p className="mt-4 text-mauve-600 max-w-sm text-pretty">
              La plataforma premium de reservas para salones de belleza, spas y
              profesionales del cuidado personal.
            </p>

            <form className="mt-6 max-w-md">
              <label className="text-xs uppercase tracking-wider text-mauve-400">
                Recibe novedades y consejos
              </label>
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="input-soft min-w-0 flex-1"
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
                  {c.links.map((l) =>
                    "external" in l && l.external ? (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-mauve-700 hover:text-mauve-900 transition-colors text-sm inline-flex items-center gap-1.5"
                        >
                          {l.label}
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M14 10l7-7M10 21H4a1 1 0 01-1-1v-6"/></svg>
                        </a>
                      </li>
                    ) : (
                      <li key={l.label}>
                        <Link href={l.href} className="text-mauve-700 hover:text-mauve-900 transition-colors text-sm">
                          {l.label}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Direct WhatsApp pill — explicit support contact under the columns */}
        <div className="mt-10 rounded-2xl bg-cream-soft border border-line p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-mauve-400">¿Necesitas ayuda?</div>
            <div className="text-sm text-mauve-900 font-medium mt-0.5">Escríbenos directo por WhatsApp</div>
            <div className="text-xs text-mauve-500 font-mono mt-0.5">{SUPPORT_WHATSAPP_DISPLAY}</div>
          </div>
          <a
            href={whatsappHref(SUPPORT_MESSAGES.general)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary h-11 text-sm shrink-0"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.1-.3 0-.5l-.7-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.7 2.6 4.1 3.6 2 .9 2 .6 2.4.6.4 0 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1z"/></svg>
            Abrir WhatsApp
          </a>
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
