'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * Mesure d'audience interne (page « Statistiques » du back-office) : signale chaque page affichée.
 *
 * Aucun cookie, aucune donnée personnelle : seuls le chemin de la page et, à l'arrivée sur le site,
 * la page d'origine sont envoyés. Requête « simple » (text/plain, sans cookie) : pas de pré-vérification CORS.
 * Les pages du back-office ne sont pas comptées.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Même chemin (double exécution en développement) ou back-office : rien à compter
    if (!pathname || lastPath.current === pathname || pathname.startsWith('/admin')) return;

    const entry = lastPath.current === null;
    lastPath.current = pathname;

    fetch(`${API_URL}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ path: pathname, referrer: entry ? document.referrer || null : null, entry }),
      credentials: 'omit',
      keepalive: true,
    }).catch(() => {
      // Statistiques indisponibles : sans incidence pour le visiteur
    });
  }, [pathname]);

  return null;
}
