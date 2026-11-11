/**
 * Informations légales de MDLP, utilisées par les mentions légales, les CGU, les conditions des dons
 * et la politique de confidentialité. Même structure juridique que l'Académie E.S.I.C.
 *
 * Une valeur `null` n'est pas encore connue : elle s'affiche sur le site comme un repère
 * « À compléter » bien visible (jamais une valeur inventée). À renseigner avant la mise en production.
 */
export const LEGAL_INFO = {
  nom: 'La Montagne de la Prière',
  structure: 'Montagne de la Prière Ministries (MDLP)',
  formeJuridique: 'Association déclarée (loi du 1er juillet 1901)' as string | null,
  rna: 'W911002465',
  siege: '10 rue du 11 Novembre 1918, 91580 Étrechy' as string | null,
  siren: 'SIREN 845 359 298 — SIRET 845 359 298 00013' as string | null,
  telephone: '07 49 93 95 20' as string | null,
  email: 'contact.lamontagnedelapriere@gmail.com',
  directeurPublication: 'Samuel Panzu, président' as string | null,
  site: 'samuelpanzutv.com',
  /** Hébergeurs (mentions légales, art. 6 LCEN) */
  hebergeurs: [
    { role: 'Site (frontend)', nom: 'Vercel Inc.', adresse: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis' as string | null, url: 'https://vercel.com' },
    { role: 'API, back-office et fichiers', nom: 'Cloudways, LLC (groupe DigitalOcean)', adresse: '105 Edgeview Drive, Suite 425, Broomfield, CO 80021, États-Unis' as string | null, url: 'https://www.cloudways.com' },
  ],
  miseAJour: 'novembre 2026',
};
