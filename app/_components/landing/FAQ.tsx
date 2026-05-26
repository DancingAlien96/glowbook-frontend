"use client";

import { useState } from "react";

const faqs = [
  {
    q: "¿Necesito tarjeta de crédito para empezar?",
    a: "No. Puedes comenzar tu prueba gratuita de 14 días sin ingresar datos de pago. Solo te pediremos información de cobro si decides continuar.",
  },
  {
    q: "¿Puedo cobrar el anticipo en cualquier moneda?",
    a: "Sí. Glowbook acepta múltiples monedas y métodos: tarjetas internacionales vía Stripe, transferencias locales (con validación de comprobante) y wallets como Yape o Plin.",
  },
  {
    q: "¿Funciona para spas y centros de estética con varios profesionales?",
    a: "Por supuesto. Puedes crear estilistas, asignar servicios específicos y manejar agendas independientes con vista unificada para la dueña.",
  },
  {
    q: "¿Las clientas reciben recordatorios automáticos?",
    a: "Sí. Enviamos confirmaciones inmediatas y recordatorios 24h y 2h antes de la cita por email. WhatsApp está en versión beta.",
  },
  {
    q: "¿Qué pasa si una clienta no asiste?",
    a: "Como cobras anticipo, ya cubriste parte del costo. Además puedes configurar reglas de no-show y bloqueo automático tras 2 ausencias.",
  },
  {
    q: "¿El Plan Lifetime es real? ¿Sin trampas?",
    a: "Real. Un pago único de $660 USD y tendrás Glowbook de por vida con todas las funciones futuras incluidas. Es nuestro programa de fundadoras.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section">
      <div className="container-narrow">
        <div className="text-center max-w-2xl mx-auto">
          <span className="chip chip-lavender">Preguntas frecuentes</span>
          <h2 className="mt-5 font-serif text-4xl sm:text-5xl text-mauve-900 leading-tight text-balance">
            Todo lo que necesitas saber.
          </h2>
        </div>

        <div className="mt-12 divide-y divide-line border-y border-line">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-5 text-left group"
                >
                  <span className="font-serif text-lg sm:text-xl text-mauve-900 group-hover:text-mauve-800 transition-colors">
                    {f.q}
                  </span>
                  <span className={`h-9 w-9 shrink-0 rounded-full grid place-items-center transition-all ${isOpen ? "bg-mauve-900 text-cream rotate-45" : "bg-mauve-900/5 text-mauve-700"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="text-mauve-600 leading-relaxed text-pretty max-w-prose pr-12">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-mauve-600">
          ¿Otra pregunta?{" "}
          <a href="mailto:hola@glowbook.app" className="text-mauve-900 underline-offset-4 hover:underline">
            Escríbenos
          </a>{" "}
          y te respondemos en menos de 24h.
        </p>
      </div>
    </section>
  );
}
