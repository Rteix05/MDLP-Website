'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* En-tête de page                                                     */
/* ------------------------------------------------------------------ */

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Carte de statistique                                                */
/* ------------------------------------------------------------------ */

const toneStyles = {
  neutral: 'bg-gray-100 text-gray-700',
  amber: 'bg-amber-100 text-amber-700',
  green: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-sky-100 text-sky-700',
} as const;

export function StatCard({
  label, value, hint, icon, tone = 'neutral', loading,
}: {
  label: string; value: React.ReactNode; hint?: string; icon?: React.ReactNode;
  tone?: keyof typeof toneStyles; loading?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4">
      {icon && <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toneStyles[tone]}`}>{icon}</div>}
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
        {loading
          ? <div className="h-7 w-20 mt-1 rounded bg-gray-100 animate-pulse" />
          : <p className="text-2xl font-black text-gray-900 tabular-nums mt-0.5">{value}</p>}
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* États vides et chargement                                           */
/* ------------------------------------------------------------------ */

export function EmptyState({ icon, title, text }: { icon?: React.ReactNode; title: string; text?: string }) {
  return (
    <div className="text-center py-14 px-6 bg-white rounded-2xl border border-dashed border-gray-200">
      {icon && <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">{icon}</div>}
      <p className="font-bold text-gray-700">{title}</p>
      {text && <p className="text-sm text-gray-400 mt-1">{text}</p>}
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Chargement">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 rounded-2xl bg-white border border-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Boutons                                                             */
/* ------------------------------------------------------------------ */

const buttonVariants = {
  primary: 'bg-black text-white hover:bg-violet-deep',
  secondary: 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:text-gray-900',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  'danger-soft': 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100',
  ghost: 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
} as const;

export function Button({
  variant = 'primary', size = 'md', className = '', ...props
}: React.ComponentProps<'button'> & { variant?: keyof typeof buttonVariants; size?: 'sm' | 'md' | 'icon' }) {
  const sizes = { sm: 'px-3 py-2 text-xs', md: 'px-4 py-2.5 text-sm', icon: 'p-2.5' };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold transition disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${sizes[size]} ${buttonVariants[variant]} ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Notifications (remplacent alert)                                    */
/* ------------------------------------------------------------------ */

type ToastKind = 'success' | 'error' | 'info';
interface Toast { id: number; kind: ToastKind; message: string }

const ToastContext = createContext<(kind: ToastKind, message: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts(list => list.filter(t => t.id !== id)), []);
  const push = useCallback((kind: ToastKind, message: string) => {
    const id = ++nextId.current;
    setToasts(list => [...list, { id, kind, message }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <XCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-sky-500" />,
  };

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:w-96" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="flex items-start gap-3 bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 text-sm text-gray-800">
            {icons[t.kind]}
            <p className="flex-1 font-medium">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-700" aria-label="Fermer"><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Fenêtre de confirmation (remplace confirm)                          */
/* ------------------------------------------------------------------ */

interface ConfirmOptions { title: string; message: string; confirmLabel?: string; danger?: boolean }
type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

const ConfirmContext = createContext<(opts: ConfirmOptions) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmContext);

function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const ask = useCallback((opts: ConfirmOptions) => new Promise<boolean>(resolve => setPending({ ...opts, resolve })), []);
  const close = (ok: boolean) => { pending?.resolve(ok); setPending(null); };

  useEffect(() => {
    if (!pending) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      {pending && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => close(false)} />
          <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${pending.danger ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 id="confirm-title" className="font-black text-lg text-gray-900">{pending.title}</h2>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{pending.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => close(false)}>Annuler</Button>
              <Button ref={confirmRef} variant={pending.danger ? 'danger' : 'primary'} onClick={() => close(true)}>
                {pending.confirmLabel || 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );
}
