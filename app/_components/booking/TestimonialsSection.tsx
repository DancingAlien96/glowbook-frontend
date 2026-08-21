import type { PublicSalon } from "../../_lib/publicSalon";

export default function TestimonialsSection({ salon }: { salon: PublicSalon }) {
  if (salon.testimonials.length === 0) return null;

  return (
    <section id="testimonios" className="py-14 md:py-20">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--brand)" }}>Testimonios</p>
        <h2 className="font-serif text-3xl md:text-4xl text-mauve-900">Lo que dicen nuestras clientas</h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {salon.testimonials.map((t) => (
          <div key={t.id} className="card-surface p-5">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < t.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className={i < t.rating ? "text-gold-500" : "text-mauve-300"}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p className="mt-3 text-sm text-mauve-700 italic leading-relaxed">&ldquo;{t.text}&rdquo;</p>
            <div className="mt-4 pt-3 border-t border-line">
              <div className="text-sm font-medium text-mauve-900">{t.clientName}</div>
              {t.serviceName && <div className="text-xs mt-0.5" style={{ color: "var(--brand)" }}>{t.serviceName}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
