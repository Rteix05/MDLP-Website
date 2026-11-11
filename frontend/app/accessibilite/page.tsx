import type { Metadata } from 'next';
import { LEGAL_INFO as L } from '@/lib/legalInfo';
import { ContactEmail, LegalArticle, LegalList, LegalPage, legalLinkClass } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Accessibilité – MDLP | Montagne de la Prière',
  description: "Déclaration d'accessibilité du site de La Montagne de la Prière (RGAA 4.1).",
  alternates: { canonical: '/accessibilite' },
};

export default function AccessibilitePage() {
  return (
    <LegalPage title="Déclaration d'accessibilité">
      <section>
        <p>
          {L.structure} s&apos;engage à rendre son site internet accessible, conformément au Référentiel général
          d&apos;amélioration de l&apos;accessibilité (RGAA) version 4.1. Cette déclaration s&apos;applique au site{' '}
          <strong>{L.site}</strong>.
        </p>
      </section>

      <LegalArticle id="conformite" title="État de conformité">
        <p>
          Le site <strong>{L.site}</strong> est <strong>non conforme</strong> avec le RGAA 4.1 : aucun audit de
          conformité n&apos;a encore été réalisé.
        </p>
      </LegalArticle>

      <LegalArticle id="mesures" title="Mesures mises en œuvre">
        <LegalList items={[
          <>
            Réglages d&apos;affichage, accessibles depuis le bouton rond en bas à gauche de chaque page : thème clair ou
            sombre, taille du texte de 90 % à 200 %, liens en gras, texte en gras. Ces choix sont mémorisés dans votre
            navigateur.
          </>,
          'Navigation au clavier et focus visible sur les éléments interactifs.',
          'Images porteuses d’information accompagnées d’une alternative textuelle.',
          'Formulaires : étiquettes associées aux champs et messages d’erreur restitués.',
          'Mise en page adaptée du mobile au bureau.',
        ]} />
      </LegalArticle>

      <LegalArticle id="non-accessibles" title="Contenus non accessibles">
        <LegalList items={[
          'Les cultes en direct et les replays sont diffusés sur YouTube et Facebook : leurs lecteurs et l’éventuelle absence de sous-titres relèvent de ces services.',
          'Les reçus de don au format PDF peuvent ne pas être balisés pour l’accessibilité.',
        ]} />
      </LegalArticle>

      <LegalArticle id="technologies" title="Technologies utilisées">
        <p>HTML5, CSS, JavaScript (React / Next.js), WAI-ARIA.</p>
      </LegalArticle>

      <LegalArticle id="contact" title="Retour d'information et contact">
        <p>
          Si vous n&apos;arrivez pas à accéder à un contenu ou à un service, contactez-nous pour être orienté vers une
          alternative accessible : <ContactEmail />.
        </p>
      </LegalArticle>

      <LegalArticle id="recours" title="Voies de recours">
        <p>
          Si vous avez signalé un défaut d&apos;accessibilité sans obtenir de réponse satisfaisante, vous pouvez :
        </p>
        <LegalList items={[
          <>
            écrire au{' '}
            <a href="https://formulaire.defenseurdesdroits.fr/" target="_blank" rel="noopener noreferrer" className={legalLinkClass}>
              Défenseur des droits<span className="sr-only"> (nouvelle fenêtre)</span>
            </a> ;
          </>,
          'contacter le délégué du Défenseur des droits de votre région ;',
          'envoyer un courrier (gratuit, sans affranchissement) : Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07.',
        ]} />
      </LegalArticle>
    </LegalPage>
  );
}
