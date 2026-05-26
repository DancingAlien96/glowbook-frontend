import type { ApiError } from "../../_lib/api";

export function LoadingBlock({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="card-surface p-10 grid place-items-center">
      <div className="flex flex-col items-center gap-3 text-mauve-500">
        <span className="h-7 w-7 rounded-full border-2 border-mauve-900/15 border-t-mauve-900 animate-spin" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

export function ErrorBlock({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  return (
    <div className="card-surface p-8">
      <h3 className="font-serif text-lg text-mauve-900">No pudimos cargar esto</h3>
      <p className="mt-1 text-sm text-mauve-600">{error.message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-ghost h-9 text-sm mt-4">
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-surface p-10 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-blush-100 to-blush-200 grid place-items-center text-mauve-700">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z"/></svg>
      </div>
      <h3 className="mt-4 font-serif text-xl text-mauve-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-mauve-600 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
