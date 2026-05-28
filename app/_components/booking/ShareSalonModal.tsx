"use client";

// Share-my-salon panel. Generates a QR pointing at the salon's public
// booking page and exposes the URL via the native share sheet, WhatsApp,
// clipboard, and a downloadable PNG.

import { useEffect, useState } from "react";

export default function ShareSalonModal({
  url,
  salonName,
  onClose,
}: {
  url: string;
  salonName: string;
  onClose: () => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  // Generate the QR once when the modal opens (or url changes).
  // - Dynamic import keeps the ~50KB qrcode lib out of the booking-page
  //   bundle; it only loads the first time the user opens this modal.
  // - Width 320 displays at 256 and still prints fine at 96dpi; rendering
  //   is ~3× faster than the previous 512 on low-end phones.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: QRCode } = await import("qrcode");
        const data = await QRCode.toDataURL(url, {
          width: 320,
          margin: 2,
          color: { dark: "#1F0F15", light: "#FBF8F3" }, // mauve-900 on cream
          errorCorrectionLevel: "M",
        });
        if (!cancelled) setQrDataUrl(data);
      } catch {
        /* if QR generation fails, the rest of the share options still work */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  const shareText = `Reserva tu cita en ${salonName} ✨\n${url}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard API can fail on insecure contexts — ignore */
    }
  };

  // Native share sheet on mobile (iOS / Android). Falls back to copy on desktop
  // browsers without navigator.share. We check inside the click so the API
  // still counts as "user-initiated" (Safari requirement).
  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      setBusy(true);
      try {
        await navigator.share({
          title: salonName,
          text: shareText,
          url,
        });
      } catch {
        /* user dismissed — no-op */
      } finally {
        setBusy(false);
      }
    } else {
      copy();
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const downloadName = `ecodama-${salonName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-qr.png`;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-3 sm:p-4 bg-mauve-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card-elevated w-full sm:max-w-md p-6 sm:p-7 rounded-3xl max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-mauve-400">Compartir</div>
            <h2 className="font-serif text-2xl text-mauve-900 leading-tight truncate">{salonName}</h2>
            <p className="text-xs text-mauve-500 mt-1">
              Manda este link o el QR a tus clientas para que reserven solas.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10 shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* QR — frames it on cream so a light scanner has good contrast */}
        <div className="mt-5 rounded-2xl bg-cream-soft border border-line p-4 flex flex-col items-center">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={`Código QR de ${salonName}`}
              className="h-56 w-56 sm:h-64 sm:w-64 anim-fade-in"
              width={256}
              height={256}
            />
          ) : (
            // Pulsing skeleton + spinner — clear "loading" affordance while
            // the qrcode lib finishes downloading + encoding on slow phones.
            <div className="h-56 w-56 sm:h-64 sm:w-64 rounded-xl bg-mauve-900/[0.05] animate-pulse grid place-items-center">
              <div className="flex flex-col items-center gap-2 text-mauve-500">
                <span className="h-7 w-7 rounded-full border-2 border-mauve-900/15 border-t-mauve-900 animate-spin" />
                <span className="text-[11px] uppercase tracking-wider">Generando QR</span>
              </div>
            </div>
          )}
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={downloadName}
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-mauve-700 hover:text-mauve-900 underline-offset-2 hover:underline"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 21h16"/></svg>
              Descargar QR (para imprimir)
            </a>
          )}
        </div>

        {/* URL + copy */}
        <div className="mt-4">
          <label className="text-[11px] uppercase tracking-wider text-mauve-400">Tu link</label>
          <div className="mt-1.5 flex items-stretch rounded-xl border border-line bg-cream-soft overflow-hidden">
            <span className="flex-1 min-w-0 px-3 py-2.5 text-xs text-mauve-900 font-mono break-all">{url}</span>
            <button
              type="button"
              onClick={copy}
              className="shrink-0 px-3 bg-mauve-900 text-cream text-xs font-medium hover:bg-mauve-800 transition flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>
                  ¡Listo!
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action row — native share, WhatsApp, open in new tab */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={nativeShare}
            disabled={busy}
            className="btn btn-primary h-11 text-xs disabled:opacity-60"
            title="Compartir"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
            Compartir
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost h-11 text-xs"
            title="Enviar por WhatsApp"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.1-.3 0-.5l-.7-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.7 2.6 4.1 3.6 2 .9 2 .6 2.4.6.4 0 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1z"/></svg>
            WhatsApp
          </a>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost h-11 text-xs"
            title="Abrir página pública"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M14 10l7-7M10 21H4a1 1 0 01-1-1v-6"/></svg>
            Abrir
          </a>
        </div>
      </div>
    </div>
  );
}
