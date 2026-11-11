import Link from 'next/link';
import type { Metadata } from 'next';
import { LEGAL_INFO as L } from '@/lib/legalInfo';
import { ContactEmail, LegalArticle, LegalList, LegalPage, legalLinkClass } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Politique de confidentialité – MDLP | Montagne de la Prière',
  alternates: { canonical: '/politique-de-confidentialite' },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <LegalArticle id="responsable" title="1. Responsable du traitement">
        <p>
          <strong>{L.structure}</strong> est responsable du traitement de vos données personnelles collectées via le site{' '}
          <strong>{L.site}</strong>.<br />
          Contact : <ContactEmail />
        </p>
      </LegalArticle>

      <LegalArticle id="donnees" title="2. Données collectées">
        <p>Dans le cadre de l&apos;utilisation de nos services, nous collectons les données suivantes :</p>
        <LegalList items={[
          <><strong>Données d&apos;inscription :</strong> adresse email, mot de passe (chiffré), prénom, nom et, si vous le renseignez, numéro de téléphone</>,
          <><strong>Demandes de rendez-vous :</strong> date et heure souhaitées, motif, message éventuel</>,
          <><strong>Dons :</strong> montant, date, identifiant de la transaction et, pour un don sans compte, l&apos;adresse email transmise par le prestataire de paiement</>,
          <><strong>Formulaire de contact :</strong> nom, adresse email, sujet et message, transmis par email à l&apos;église</>,
          <><strong>Données de connexion :</strong> jeton d&apos;authentification stocké dans un cookie de votre navigateur</>,
          <><strong>Données techniques :</strong> adresse IP, type de navigateur (via les journaux du serveur)</>,
        ]} />
      </LegalArticle>

      <LegalArticle id="finalites" title="3. Finalités du traitement">
        <LegalList items={[
          'Gestion de votre compte et authentification sécurisée',
          'Organisation des rendez-vous avec le pasteur',
          'Traitement des dons et envoi des reçus',
          "Envoi d'emails liés à ces services (confirmation de rendez-vous, reçu de don, réinitialisation de mot de passe)",
          'Réponse à vos messages',
          'Sécurité du site et prévention des abus',
        ]} />
      </LegalArticle>

      <LegalArticle id="base-legale" title="4. Base légale">
        <p>Le traitement de vos données est fondé sur :</p>
        <LegalList items={[
          <>l&apos;<strong>exécution du service</strong> que vous demandez (compte, rendez-vous, don) ;</>,
          <>le <strong>consentement</strong> (inscription et envoi de messages volontaires) ;</>,
          <>les <strong>obligations légales</strong> (conservation des pièces comptables liées aux dons) ;</>,
          <>l&apos;<strong>intérêt légitime</strong> (sécurité du site, prévention des fraudes).</>,
        ]} />
      </LegalArticle>

      <LegalArticle id="conservation" title="5. Durée de conservation">
        <LegalList items={[
          <><strong>Compte :</strong> pendant toute la durée d&apos;activité du compte, puis 3 ans après la dernière connexion</>,
          <><strong>Rendez-vous :</strong> pendant la durée du compte</>,
          <><strong>Dons :</strong> 10 ans, conformément aux obligations comptables</>,
          <><strong>Liens de réinitialisation du mot de passe :</strong> 1 heure</>,
        ]} />
      </LegalArticle>

      <LegalArticle id="partage" title="6. Partage des données">
        <p>Vos données ne sont jamais vendues. Elles peuvent être transmises uniquement à :</p>
        <LegalList items={[
          <><strong>Stripe</strong> et <strong>PayPal</strong> : prestataires de paiement, pour le traitement des dons</>,
          <><strong>Nos hébergeurs</strong> : pour le fonctionnement technique du site (voir les <Link href="/mentions-legales" className={legalLinkClass}>mentions légales</Link>)</>,
          <><strong>Notre prestataire d&apos;envoi d&apos;emails</strong> : pour les emails liés à vos demandes</>,
        ]} />
        <p>Ces prestataires sont soumis à des obligations de confidentialité conformes au RGPD.</p>
      </LegalArticle>

      <LegalArticle id="securite" title="7. Sécurité des données">
        <LegalList items={[
          'Mots de passe chiffrés',
          'Authentification par jeton à durée limitée',
          'Communications chiffrées en HTTPS',
          'Paiements traités exclusivement par Stripe et PayPal : aucune donnée bancaire ne transite par nos serveurs',
        ]} />
      </LegalArticle>

      <LegalArticle id="droits" title="8. Vos droits">
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <LegalList items={[
          <><strong>Droit d&apos;accès :</strong> obtenir une copie de vos données</>,
          <><strong>Droit de rectification :</strong> corriger vos données (depuis votre <Link href="/profil" className={legalLinkClass}>profil</Link>)</>,
          <><strong>Droit à l&apos;effacement :</strong> demander la suppression de votre compte</>,
          <><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</>,
          <><strong>Droit d&apos;opposition :</strong> vous opposer à certains traitements</>,
        ]} />
        <p>
          Pour exercer ces droits, contactez-nous à : <ContactEmail />. Vous pouvez également introduire une réclamation
          auprès de la{' '}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className={legalLinkClass}>
            CNIL<span className="sr-only"> (nouvelle fenêtre)</span>
          </a>.
        </p>
      </LegalArticle>

      <LegalArticle id="cookies" title="9. Cookies">
        <p>Le site n&apos;utilise aucun cookie publicitaire ni outil de mesure d&apos;audience. Seuls sont enregistrés :</p>
        <LegalList items={[
          "un cookie de connexion, strictement nécessaire, déposé uniquement lorsque vous vous connectez (il expire au bout d'un jour) ;",
          "vos préférences d'affichage (thème clair ou sombre, taille du texte, liens et texte en gras), enregistrées uniquement dans votre navigateur, à votre demande.",
        ]} />
        <p>
          Les liens vers YouTube et Facebook ouvrent ces services dans un nouvel onglet : aucun de leurs contenus
          n&apos;est chargé sur notre site.
        </p>
      </LegalArticle>

      <LegalArticle id="modifications" title="10. Modifications">
        <p>
          Nous pouvons modifier cette politique à tout moment. Toute modification importante sera signalée sur le site.
        </p>
      </LegalArticle>
    </LegalPage>
  );
}
