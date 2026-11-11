'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Accessibility, Minus, Monitor, Moon, Plus, RotateCcw, Sun, X } from 'lucide-react';
import { DEFAULT_SCALE_INDEX, DISPLAY_STORAGE_KEY, TEXT_SCALES } from '@/lib/displayPrefs';

/**
 * Réglages d'affichage (même principe que l'Académie E.S.I.C.) : thème clair/sombre, taille du texte,
 * liens en gras, texte en gras. Mémorisés dans le navigateur du visiteur et appliqués sur <html> :
 *   classe « dark », variable --text-scale, classes a11y-bold-links / a11y-bold-text / a11y-text-large.
 * DISPLAY_BOOT_SCRIPT les applique avant l'affichage pour éviter un flash au chargement.
 */

const DEFAULT_INDEX = DEFAULT_SCALE_INDEX;
const STORAGE_KEY = DISPLAY_STORAGE_KEY;

type ThemeChoice = 'system' | 'light' | 'dark';

interface Prefs {
  theme: ThemeChoice;
  scaleIndex: number;
  boldLinks: boolean;
  boldText: boolean;
}

const DEFAULT_PREFS: Prefs = { theme: 'system', scaleIndex: DEFAULT_INDEX, boldLinks: false, boldText: false };

function isDark(theme: ThemeChoice) {
  return theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

function applyPrefs(prefs: Prefs) {
  const html = document.documentElement;
  html.classList.toggle('dark', isDark(prefs.theme));
  html.style.setProperty('--text-scale', String(TEXT_SCALES[prefs.scaleIndex] ?? 1));
  html.classList.toggle('a11y-bold-links', prefs.boldLinks);
  html.classList.toggle('a11y-bold-text', prefs.boldText);
  html.classList.toggle('a11y-text-large', prefs.scaleIndex > DEFAULT_INDEX);
}

function readPrefs(): Prefs {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<Prefs> | null;
    if (!stored) return DEFAULT_PREFS;
    const scaleIndex = Number.isInteger(stored.scaleIndex) && stored.scaleIndex! >= 0 && stored.scaleIndex! < TEXT_SCALES.length
      ? stored.scaleIndex!
      : DEFAULT_INDEX;
    const theme: ThemeChoice = stored.theme === 'light' || stored.theme === 'dark' ? stored.theme : 'system';
    return { theme, scaleIndex, boldLinks: !!stored.boldLinks, boldText: !!stored.boldText };
  } catch {
    return DEFAULT_PREFS;
  }
}

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="dp-row flex min-h-11 w-full items-center justify-between gap-4 rounded-xl px-3 py-2 text-left text-sm font-semibold transition"
    >
      {label}
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors ${
          checked ? 'border-[#800080] bg-[#800080]' : 'dp-switch-off'
        }`}
      >
        <span className={`h-4 w-4 rounded-full shadow transition-transform ${checked ? 'translate-x-[22px] bg-[#FFD700]' : 'translate-x-0.5 dp-knob-off'}`} />
      </span>
    </button>
  );
}

/**
 * Bouton « Réglages d'affichage » à placer dans une barre de navigation ou un en-tête.
 * - buttonClassName : couleurs du bouton, adaptées à la barre qui l'accueille
 * - panel : « below » ouvre le panneau sous le bouton (aligné à droite), « above » au-dessus (aligné à gauche)
 */
export default function DisplayPreferences({
  buttonClassName = 'text-black hover:bg-gray-100',
  panel = 'below',
}: { buttonClassName?: string; panel?: 'below' | 'above' }) {
  // Le panneau est fermé au premier rendu : lire les préférences ici ne crée pas d'écart d'hydratation
  const [prefs, setPrefs] = useState<Prefs>(() => (typeof window === 'undefined' ? DEFAULT_PREFS : readPrefs()));
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const sizeLabelId = useId();
  const themeLabelId = useId();

  // Suit le thème du système quand le choix est « Système »
  useEffect(() => {
    if (prefs.theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyPrefs(prefs);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [prefs]);

  useEffect(() => {
    if (!open) return;
    const outside = (e: Event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); }
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    applyPrefs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Stockage indisponible (navigation privée…) : préférence valable pour la page en cours
    }
  };

  const percent = Math.round(TEXT_SCALES[prefs.scaleIndex] * 100);
  const isDefault = prefs.theme === 'system' && prefs.scaleIndex === DEFAULT_INDEX && !prefs.boldLinks && !prefs.boldText;

  const themes: { key: ThemeChoice; label: string; icon: typeof Sun }[] = [
    { key: 'light', label: 'Clair', icon: Sun },
    { key: 'dark', label: 'Sombre', icon: Moon },
    { key: 'system', label: 'Système', icon: Monitor },
  ];

  const sizeButton = 'dp-size flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div ref={wrapperRef} className="display-prefs relative">
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Réglages d'affichage"
          className={`dp-panel absolute z-[90] w-80 max-w-[calc(100vw-2rem)] rounded-2xl p-5 shadow-2xl text-left normal-case tracking-normal ${
            panel === 'below' ? 'right-0 top-full mt-3' : 'left-0 bottom-full mb-3'
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base font-black uppercase tracking-tight">Réglages d&apos;affichage</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer les réglages" className="dp-muted p-1 transition hover:opacity-70">
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-5">
            <div role="radiogroup" aria-labelledby={themeLabelId}>
              <p id={themeLabelId} className="text-sm font-bold">Thème</p>
              <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl p-1 dp-segment">
                {themes.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={prefs.theme === key}
                    onClick={() => update({ theme: key })}
                    className={`flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-bold transition ${
                      prefs.theme === key ? 'bg-[#800080] text-[#FFD700]' : 'dp-muted hover:opacity-80'
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div role="group" aria-labelledby={sizeLabelId}>
              <p id={sizeLabelId} className="text-sm font-bold">Taille du texte</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <button type="button" onClick={() => update({ scaleIndex: prefs.scaleIndex - 1 })} disabled={prefs.scaleIndex === 0}
                  aria-label="Réduire la taille du texte" className={sizeButton}>
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <output aria-live="polite" className="text-base font-black">
                  <span className="sr-only">Taille du texte : </span>{percent} %
                </output>
                <button type="button" onClick={() => update({ scaleIndex: prefs.scaleIndex + 1 })} disabled={prefs.scaleIndex === TEXT_SCALES.length - 1}
                  aria-label="Agrandir la taille du texte" className={sizeButton}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Switch label="Liens en gras" checked={prefs.boldLinks} onChange={(v) => update({ boldLinks: v })} />
              <Switch label="Texte en gras" checked={prefs.boldText} onChange={(v) => update({ boldText: v })} />
            </div>

            <button
              type="button"
              onClick={() => update(DEFAULT_PREFS)}
              disabled={isDefault}
              className="dp-reset flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Réinitialiser l&apos;affichage
            </button>
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Réglages d'affichage : thème, taille du texte, gras"
        title="Réglages d'affichage"
        className={`flex h-10 w-10 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD700] ${buttonClassName}`}
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
