import { initials } from "../../_lib/format";
import type { PublicSalon } from "../../_lib/publicSalon";

const TONES = ["from-blush-300 to-blush-500", "from-lavender-200 to-lavender-400", "from-gold-300 to-gold-500", "from-nude-200 to-nude-300"];

// Only rendered when the salon has at least one active stylist — same
// "nothing shows if the field isn't filled in" rule as the rest of the
// landing content, extended here to "at least one team member exists".
export default function TeamSection({ salon }: { salon: PublicSalon }) {
  if (salon.stylists.length === 0) return null;

  return (
    <section id="equipo" className="py-14 md:py-20">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--brand)" }}>Nuestro equipo</p>
        <h2 className="font-serif text-3xl md:text-4xl text-mauve-900">Profesionales de excelencia</h2>
        <p className="mt-2 text-mauve-600">Conoce a quienes harán realidad tu look.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
        {salon.stylists.map((s, i) => (
          <div key={s.id} className="text-center">
            <div className="relative mb-3 rounded-2xl overflow-hidden aspect-square">
              {s.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.photoUrl} alt={s.name} className="h-full w-full object-cover" />
              ) : (
                <div className={`h-full w-full bg-gradient-to-br ${TONES[i % TONES.length]} grid place-items-center text-cream font-serif text-2xl`}>
                  {initials(s.name)}
                </div>
              )}
            </div>
            <div className="font-serif text-base text-mauve-900 leading-tight">{s.name}</div>
            {s.role && <div className="text-xs text-mauve-500 mt-0.5">{s.role}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
