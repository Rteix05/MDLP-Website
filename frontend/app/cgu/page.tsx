import Link from 'next/link';
import type { Metadata } from 'next';
import { LEGAL_INFO as L } from '@/lib/legalInfo';
import { ContactEmail, LegalArticle, LegalIdentity, LegalList, LegalPage, LegalToc, LegalValue, legalLinkClass } from '@/components/legal';

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation – MDLP | Montagne de la Prière",
  alternates: { canonical: '/cgu' },
};

const ARTICLES = [
  { id: 'objet', title: '1. Objet et acceptation' },
  { id: 'editeur', title: '2. Éditeur du site' },
  { id: 'acces', title: '3. Accès au site et création de compte' },
  { id: 'securite', title: '4. Identifiants et sécurité' },
  { id: 'services', title: '5. Services proposés' },
  { id: 'rendez-vous', title: '6. Rendez-vous' },
  { id: 'propriete', title: '7. Propriété intellectuelle' },
  { id: 'obligations', title: "8. Obligations de l'utilisateur" },
  { id: 'suspension', title: "9. Suspension ou suppression d'un compte" },
  { id: 'disponibilite', title: '10. Disponibilité du site' },
  { id: 'responsabilite', title: '11. Responsabilité' },
  { id: 'donnees', title: '12. Données personnelles et cookies' },
  { id: 'tiers', title: '13. Services tiers et liens externes' },
  { id: 'modification', title: '14. Modification des CGU' },
  { id: 'droit', title: '15. Droit applicable' },
];

export default function CguPage() {
  const politique = <Link href="/politique-de-confidentialite" className={legalLinkClass}>politique de confidentialité</Link>;
  const dons = <Link href="/conditions-des-dons" className={legalLinkClass}>conditions des dons</Link>;

  return (
    <LegalPage title="Conditions générales d'utilisation">
      <LegalToc label="Sommaire des conditions générales d'utilisation" articles={ARTICLES} />

      <LegalArticle id="objet" title="1. Objet et acceptation">
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (« CGU ») définissent les conditions d&apos;accès et
          d&apos;utilisation du site <strong>{L.site}</strong> et des services proposés par {L.structure} (« MDLP »).
        </p>
        <p>
          Le site permet notamment de découvrir l&apos;église, de suivre les cultes en direct, de consulter le
          calendrier, de créer un compte, de demander un rendez-vous avec le pasteur et de faire un don.
        </p>
        <p>La navigation sur le site implique l&apos;acceptation des présentes CGU.</p>
        <p>Les dons sont également soumis aux {dons}.</p>
      </LegalArticle>

      <LegalArticle id="editeur" title="2. Éditeur du site">
        <LegalIdentity rows={[
          { label: 'Dénomination', value: L.structure },
          { label: 'Forme juridique', value: <LegalValue value={L.formeJuridique} label="forme juridique" /> },
          { label: 'N° RNA', value: L.rna },
          { label: 'Siège social', value: <LegalValue value={L.siege} label="adresse complète" /> },
          { label: 'SIREN / SIRET', value: <LegalValue value={L.siren} label="numéro" /> },
          { label: 'Email', value: <ContactEmail /> },
          { label: 'Téléphone', value: <LegalValue value={L.telephone} label="numéro" /> },
          { label: 'Directeur de la publication', value: <LegalValue value={L.directeurPublication} label="nom" /> },
        ]} />
        <p>
          Les informations relatives à l&apos;hébergement sont disponibles dans les{' '}
          <Link href="/mentions-legales" className={legalLinkClass}>mentions légales</Link>.
        </p>
      </LegalArticle>

      <LegalArticle id="acces" title="3. Accès au site et création de compte">
        <p>Le site est accessible gratuitement à toute personne disposant d&apos;un accès à Internet.</p>
        <p>Les frais de connexion et d&apos;équipement nécessaires à l&apos;accès au site sont à la charge de l&apos;utilisateur.</p>
        <p>Certaines fonctionnalités, comme la prise de rendez-vous et l&apos;historique des dons, nécessitent la création d&apos;un compte.</p>
        <p>L&apos;utilisateur s&apos;engage à fournir des informations exactes, complètes et à jour, qu&apos;il peut modifier depuis son profil.</p>
        <p>Un compte est strictement personnel : il ne peut être cédé, prêté ou utilisé par plusieurs personnes.</p>
        <p>Un utilisateur mineur doit disposer de l&apos;autorisation de son représentant légal.</p>
      </LegalArticle>

      <LegalArticle id="securite" title="4. Identifiants et sécurité">
        <p>L&apos;utilisateur est responsable de la confidentialité de ses identifiants. Il s&apos;engage à :</p>
        <LegalList items={[
          'choisir un mot de passe suffisamment robuste ;',
          'conserver ses identifiants confidentiels ;',
          'ne pas communiquer son compte à un tiers ;',
          "informer MDLP dans les meilleurs délais en cas d'utilisation non autorisée de son compte.",
        ]} />
        <p>En cas d&apos;oubli, l&apos;utilisateur peut utiliser la fonctionnalité « Mot de passe oublié ».</p>
        <p>
          Pour préserver la sécurité du service, MDLP peut bloquer temporairement des tentatives de connexion répétées.
        </p>
      </LegalArticle>

      <LegalArticle id="services" title="5. Services proposés">
        <LegalList items={[
          'la présentation de l’église, de son histoire et de son équipe pastorale ;',
          'des liens vers les cultes en direct et les replays sur YouTube et Facebook ;',
          'un calendrier des événements ;',
          'la prise de rendez-vous avec le pasteur ;',
          'la possibilité de faire un don en ligne et de retrouver ses reçus ;',
          'un formulaire de contact.',
        ]} />
      </LegalArticle>

      <LegalArticle id="rendez-vous" title="6. Rendez-vous">
        <p>
          Les demandes de rendez-vous sont soumises à la validation de l&apos;église. L&apos;utilisateur est informé par
          email de la confirmation ou du refus de sa demande.
        </p>
        <p>L&apos;utilisateur peut annuler un rendez-vous depuis son espace personnel.</p>
      </LegalArticle>

      <LegalArticle id="propriete" title="7. Propriété intellectuelle">
        <p>
          Les éléments composant le site, notamment les textes, vidéos, photographies, logos et enseignements, sont
          protégés par le droit de la propriété intellectuelle et appartiennent à MDLP ou aux titulaires de droits
          concernés.
        </p>
        <p>Toute reproduction, représentation ou exploitation non autorisée est susceptible de constituer une contrefaçon.</p>
      </LegalArticle>

      <LegalArticle id="obligations" title="8. Obligations de l'utilisateur">
        <p>L&apos;utilisateur s&apos;engage à utiliser le site de manière loyale et conforme aux lois. Il lui est notamment interdit :</p>
        <LegalList items={[
          "de tenter d'accéder sans autorisation aux systèmes informatiques du site ;",
          'de contourner les dispositifs de sécurité ou de perturber le fonctionnement du site ;',
          "d'utiliser des robots pour extraire les contenus ou données ;",
          "d'usurper l'identité d'une autre personne ou de fournir de fausses informations ;",
          'de diffuser des contenus illicites, haineux, discriminatoires, injurieux ou menaçants ;',
          'de porter atteinte aux droits de MDLP ou de tiers.',
        ]} />
      </LegalArticle>

      <LegalArticle id="suspension" title="9. Suspension ou suppression d'un compte">
        <p>L&apos;utilisateur peut demander la suppression de son compte à l&apos;adresse : <ContactEmail /></p>
        <p>
          MDLP peut suspendre ou supprimer un compte en cas de violation des présentes CGU. L&apos;utilisateur en est
          informé par email.
        </p>
      </LegalArticle>

      <LegalArticle id="disponibilite" title="10. Disponibilité du site">
        <p>
          MDLP met en œuvre des moyens raisonnables pour assurer le bon fonctionnement du site, qui peut toutefois être
          temporairement inaccessible (maintenance, incident technique, défaillance d&apos;un prestataire, force majeure).
        </p>
      </LegalArticle>

      <LegalArticle id="responsabilite" title="11. Responsabilité">
        <p>
          MDLP ne saurait être responsable des dommages résultant d&apos;une utilisation du site non conforme aux
          présentes CGU, d&apos;une indisponibilité temporaire indépendante de sa volonté ou d&apos;une défaillance de
          l&apos;équipement de l&apos;utilisateur.
        </p>
        <p>
          Les contenus du site ont une vocation spirituelle et ne constituent pas un conseil professionnel, juridique,
          médical ou financier.
        </p>
        <p>
          Aucune stipulation des présentes CGU ne saurait limiter une responsabilité qui ne peut légalement être exclue.
        </p>
      </LegalArticle>

      <LegalArticle id="donnees" title="12. Données personnelles et cookies">
        <p>
          Les modalités de traitement des données personnelles et l&apos;usage des cookies sont détaillés dans la {politique}.
        </p>
      </LegalArticle>

      <LegalArticle id="tiers" title="13. Services tiers et liens externes">
        <p>
          Le site utilise des prestataires tiers (Stripe et PayPal pour les dons, YouTube et Facebook pour les directs,
          hébergeurs). Leur utilisation peut être soumise à leurs propres conditions. MDLP ne peut être tenue responsable
          du contenu des sites externes vers lesquels renvoient des liens.
        </p>
      </LegalArticle>

      <LegalArticle id="modification" title="14. Modification des CGU">
        <p>
          MDLP peut modifier les présentes CGU, notamment pour tenir compte de l&apos;évolution du site ou de la
          réglementation. La version applicable est celle publiée sur le site au moment de son utilisation.
        </p>
      </LegalArticle>

      <LegalArticle id="droit" title="15. Droit applicable">
        <p>Les présentes CGU sont soumises au droit français.</p>
        <p>En cas de difficulté, l&apos;utilisateur est invité à contacter d&apos;abord MDLP : <ContactEmail /></p>
      </LegalArticle>
    </LegalPage>
  );
}
