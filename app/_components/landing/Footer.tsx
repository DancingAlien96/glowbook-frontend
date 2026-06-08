"use client";

import { useState } from "react";
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
    title: "Compañía",
    links: [
      { href: whatsappHref(SUPPORT_MESSAGES.general), label: "Centro de ayuda", external: true },
      { href: whatsappHref(SUPPORT_MESSAGES.general), label: "Contacto", external: true },
      { id: "terms", label: "Términos y condiciones", modal: true, href: undefined },
      { id: "privacy", label: "Política de privacidad", modal: true, href: undefined },
    ],
  },
];

const TERMS_CONTENT = `# Términos y Condiciones

**Última actualización: 2025**

## 1. Aceptación de Términos
Al utilizar Ecodama, aceptas estos términos y condiciones en su totalidad.

## 2. Uso del Servicio
- Ecodama es una plataforma de reservas para salones de belleza
- Eres responsable de mantener la confidencialidad de tu cuenta
- No puedes usar la plataforma para fines ilegales

## 3. Suscripción y Pago
- Los planes son: Mensual ($20), Anual ($200) y Lifetime ($1,000)
- Los pagos se procesan mediante Recurrente
- Las suscripciones se renuevan automáticamente según el plan

## 4. Cancelación
- Puedes cancelar tu suscripción en cualquier momento
- No hay reembolsos por pagos ya procesados
- El acceso se mantiene hasta el final del período pagado

## 5. Limitaciones de Responsabilidad
Ecodama no es responsable por interrupciones, pérdida de datos o daños indirectos.

## 6. Cambios en los Términos
Nos reservamos el derecho de modificar estos términos. Los cambios serán notificados por email.`;

const PRIVACY_CONTENT = `# Política de Privacidad

**Última actualización: 2025**

## 1. Información que Recopilamos
- Datos de tu cuenta (nombre, email, teléfono)
- Información del salón (servicios, horarios, precios)
- Datos de clientes y citas
- Información de pago procesada por Recurrente

## 2. Cómo Usamos tu Información
- Para proporcionar el servicio de reservas
- Para mejorar la plataforma
- Para enviar notificaciones importantes
- Para procesar pagos y facturación

## 3. Protección de Datos
Utilizamos encriptación y medidas de seguridad estándar para proteger tu información.

## 4. Terceros
- Recurrente procesa tus pagos (su política de privacidad aplica)
- Resend envía tus emails (su política de privacidad aplica)
- No vendemos tu información a terceros

## 5. Derechos del Usuario
Tienes derecho a:
- Acceder a tus datos
- Solicitar la corrección de información incorrecta
- Solicitar la eliminación de tu cuenta

## 6. Cambios en la Política
Nos reservamos el derecho de actualizar esta política. Notificaremos cambios importantes por email.`;

export default function Footer() {
  const [openModal, setOpenModal] = useState<"terms" | "privacy" | null>(null);
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

          <div className="grid sm:grid-cols-2 gap-8">
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
                    ) : "modal" in l && l.modal ? (
                      <li key={l.id}>
                        <button
                          onClick={() => setOpenModal(l.id as "terms" | "privacy")}
                          className="text-mauve-700 hover:text-mauve-900 transition-colors text-sm"
                        >
                          {l.label}
                        </button>
                      </li>
                    ) : "href" in l && l.href ? (
                      <li key={l.label}>
                        <Link href={l.href} className="text-mauve-700 hover:text-mauve-900 transition-colors text-sm">
                          {l.label}
                        </Link>
                      </li>
                    ) : null
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

      {/* Modal overlay */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-cream-soft">
            <div className="sticky top-0 bg-cream-soft border-b border-line px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-xl text-mauve-900">
                {openModal === "terms" ? "Términos y Condiciones" : "Política de Privacidad"}
              </h2>
              <button
                onClick={() => setOpenModal(null)}
                className="h-9 w-9 rounded-full bg-mauve-900/5 hover:bg-mauve-900/10 transition flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="prose prose-sm max-w-none px-6 py-6 text-mauve-700">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {(openModal === "terms" ? TERMS_CONTENT : PRIVACY_CONTENT)
                  .split("\n")
                  .map((line, i) => (
                    <div
                      key={i}
                      className={`${
                        line.startsWith("#") ? "mt-4 font-serif text-lg text-mauve-900 font-bold" : ""
                      } ${line.startsWith("- ") ? "ml-4" : ""}`}
                    >
                      {line.replace(/^#+\s/, "").replace(/^\- /, "• ")}
                    </div>
                  ))}
              </div>
            </div>

            <div className="border-t border-line p-6 flex gap-3">
              <button
                onClick={() => setOpenModal(null)}
                className="btn btn-outline w-full"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
