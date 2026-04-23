/* Shared dark-theme form input classes */
export const inputClass =
  'w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 ' +
  'placeholder-slate-500 outline-none transition-all ' +
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30';

export const selectClass =
  'w-full cursor-pointer appearance-none rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 ' +
  'text-sm text-slate-100 outline-none transition-all ' +
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30';

export default function FormField({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
