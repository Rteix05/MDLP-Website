/** Constantes des réglages d'affichage, partagées entre le layout (serveur) et le panneau (client) */

export const TEXT_SCALES = [0.9, 1, 1.15, 1.3, 1.5, 1.75, 2] as const;
export const DEFAULT_SCALE_INDEX = 1;
export const DISPLAY_STORAGE_KEY = 'mdlp-affichage';

/** Script exécuté avant l'hydratation : même logique que applyPrefs (DisplayPreferences.tsx) */
export const DISPLAY_BOOT_SCRIPT = `try{var p=JSON.parse(localStorage.getItem('${DISPLAY_STORAGE_KEY}')||'null')||{};var h=document.documentElement;var t=p.theme||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);h.classList.toggle('dark',d);var s=${JSON.stringify(TEXT_SCALES)}[p.scaleIndex];if(s)h.style.setProperty('--text-scale',String(s));h.classList.toggle('a11y-bold-links',!!p.boldLinks);h.classList.toggle('a11y-bold-text',!!p.boldText);h.classList.toggle('a11y-text-large',p.scaleIndex>${DEFAULT_SCALE_INDEX});}catch(e){}`;
