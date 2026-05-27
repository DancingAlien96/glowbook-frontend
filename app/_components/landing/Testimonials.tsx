const testimonials = [
  {
    quote:
      "Ecodama transformó por completo cómo mis clientas reservan. La interfaz se siente como una experiencia spa: delicada, elegante y sin fricción.",
    name: "Catalina Ríos",
    role: "Fundadora · Maison Rosé",
    avatar: "from-blush-300 to-blush-500",
  },
  {
    quote:
      "Los anticipos automáticos redujeron mis cancelaciones de última hora un 70%. Vale cada peso. Mi equipo lo aprendió en una tarde.",
    name: "Valentina Soto",
    role: "Owner · Studio Nude Nails",
    avatar: "from-lavender-200 to-lavender-400",
  },
  {
    quote:
      "Por fin un sistema que entiende la estética del mundo de la belleza. Calendly y similares se sentían demasiado fríos para mi marca.",
    name: "Camila Restrepo",
    role: "Beauty expert · Aura Spa",
    avatar: "from-gold-300 to-gold-500",
  },
  {
    quote:
      "Mis clientas me dicen ‘qué bonita tu página de reservas’. Eso no me lo decían antes. Ecodama se siente como una extensión de mi salón.",
    name: "Andrea Mendoza",
    role: "Maquilladora profesional",
    avatar: "from-nude-200 to-blush-300",
  },
];

export default function Testimonials() {
  return (
    <section className="section relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-blush opacity-70 -z-10" />
      <div className="container-tight">
        <div className="max-w-2xl">
          <span className="chip chip-blush">Lo que dicen</span>
          <h2 className="mt-5 font-serif text-4xl sm:text-5xl text-mauve-900 leading-tight text-balance">
            Confianza de las dueñas de salones <em className="not-italic text-gold-shimmer">más exigentes</em>.
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {testimonials.map((t) => (
            <figure key={t.name} className="card-elevated p-7 relative overflow-hidden">
              <div className="absolute -top-6 -right-4 font-serif text-[8rem] leading-none text-blush-200/40 select-none">
                &ldquo;
              </div>
              <div className="flex items-center gap-1 text-gold-500 relative">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-current"><path d="M10 1.5l2.6 5.4 5.9.6-4.4 4.1 1.3 5.8L10 14.6l-5.4 2.8 1.3-5.8L1.5 7.5l5.9-.6L10 1.5z"/></svg>
                ))}
              </div>
              <blockquote className="mt-4 font-serif text-xl text-mauve-900 leading-relaxed text-pretty relative">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 relative">
                <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${t.avatar} grid place-items-center text-cream font-serif`}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-mauve-900">{t.name}</div>
                  <div className="text-xs text-mauve-400">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
