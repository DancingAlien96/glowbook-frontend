const brands = [
  "MAISON ROSÉ",
  "AURA · spa",
  "Bella & Lirio",
  "STUDIO NUDE",
  "LUNA NAILS",
  "PETALA",
  "Casa Glow",
  "Mariposa Studio",
];

export default function SocialProof() {
  return (
    <section className="relative py-14 border-y border-line bg-ivory/50">
      <div className="container-tight">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-mauve-400">
          Salones premium que confían en Ecodama
        </p>
        <div className="mt-6 overflow-hidden mask-fade">
          <div className="flex gap-12 anim-marquee whitespace-nowrap" style={{ width: "max-content" }}>
            {[...brands, ...brands].map((b, i) => (
              <span
                key={i}
                className="font-serif text-xl text-mauve-600/70 hover:text-mauve-900 transition-colors tracking-wide"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .mask-fade {
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
        }
      `}</style>
    </section>
  );
}
