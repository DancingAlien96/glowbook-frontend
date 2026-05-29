"use client";

import { useState } from "react";
import { SUPPORT_MESSAGES, whatsappHref } from "../../_lib/support";

const faqs = [
  {
    q: "¿Cómo cobran mis clientas el anticipo?",
    a: "Por transferencia bancaria. Tú defines los datos de tu cuenta (banco, número, nombre, RUC) en los ajustes del salón. Tu clienta los ve al reservar, transfiere y sube el comprobante. Tú lo apruebas en un toque desde el panel y la cita queda confirmada.",
  },
  {
    q: "¿Y si la clienta sube un comprobante falso?",
    a: "Tú apruebas cada comprobante manualmente antes de que la cita pase a confirmada. La imagen queda guardada en tu historial — si algo no cuadra, rechazas el pago con un motivo y la clienta es notificada.",
  },
  {
    q: "¿Aceptan pagos con tarjeta de crédito?",
    a: "Por ahora no. Trabajamos con transferencia bancaria y wallets locales tipo Yape o Plin (subiendo el comprobante). La integración con pasarela de tarjetas está en nuestro roadmap pero no tiene fecha confirmada — preferimos no prometer lo que aún no ofrecemos.",
  },
  {
    q: "¿Funciona para spas y centros de estética con varios profesionales?",
    a: "Por supuesto. Crea cuentas para cada estilista — ellas inician sesión en su propio portal, ven solo sus citas y las marcan como confirmadas o completadas. Tú monitoreas todo desde tu panel.",
  },
  {
    q: "¿Las clientas reciben confirmaciones y recordatorios?",
    a: "Tu clienta recibe confirmación inmediata al reservar y un email de aprobación cuando validas su comprobante. Recordatorios automáticos por email 24h y 2h antes de la cita. WhatsApp está en versión beta.",
  },
  {
    q: "¿Qué pasa si una clienta no asiste?",
    a: "Como ya cobraste el anticipo por transferencia, parte del costo está cubierto. Puedes marcarla como 'No asistió' desde el panel y queda en su ficha para futuras decisiones de reserva.",
  },
  {
    q: "¿Cómo se paga la suscripción de Ecodama?",
    a: "Mientras integramos pasarela de pagos, la activación se hace por transferencia bancaria coordinada con nosotras. Escríbenos por WhatsApp o email y te enviamos los datos. El plan Lifetime ($660 USD único pago) está disponible bajo el mismo esquema.",
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
          <a
            href={whatsappHref(SUPPORT_MESSAGES.general)}
            target="_blank"
            rel="noreferrer"
            className="text-mauve-900 underline-offset-4 hover:underline"
          >
            Escríbenos por WhatsApp
          </a>{" "}
          y te respondemos al instante.
        </p>
      </div>
    </section>
  );
}
