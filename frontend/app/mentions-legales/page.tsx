import Link from 'next/link';
import type { Metadata } from 'next';
import { LEGAL_INFO as L } from '@/lib/legalInfo';
import { ContactEmail, LegalArticle, LegalIdentity, LegalPage, LegalValue, legalLinkClass } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Mentions légales – MDLP | Montagne de la Prière',
  alternates: { canonical: '/mentions-legales' },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales">
      <LegalArticle id="editeur" title="1. Éditeur du site">
        <p>Le site <strong>{L.site}</strong> est édité par :</p>
        <LegalIdentity rows={[
          { label: 'Dénomination', value: L.structure },
          { label: 'Forme juridique', value: <LegalValue value={L.formeJuridique} label="forme juridique" /> },
          { label: 'N° RNA', value: L.rna },
          { label: 'Siège social', value: <LegalValue value={L.siege} label="adresse complète" /> },
          { label: 'SIREN / SIRET', value: <LegalValue value={L.siren} label="numéro" /> },
          { label: 'Téléphone', value: <LegalValue value={L.telephone} label="numéro" /> },
          { label: 'Email', value: <ContactEmail /> },
          { label: 'Directeur de la publication', value: <LegalValue value={L.directeurPublication} label="nom" /> },
        ]} />
      </LegalArticle>

      <LegalArticle id="hebergement" title="2. Hébergement">
        <ul className="list-disc space-y-2 pl-5">
          {L.hebergeurs.map((h) => (
            <li key={h.nom}>
              <strong>{h.role}</strong> : {h.nom}, <LegalValue value={h.adresse} label="adresse de l'hébergeur" /> —{' '}
              <a href={h.url} target="_blank" rel="noopener noreferrer" className={legalLinkClass}>
                {h.url.replace('https://', '')}<span className="sr-only"> (nouvelle fenêtre)</span>
              </a>
            </li>
          ))}
        </ul>
      </LegalArticle>

      <LegalArticle id="propriete" title="3. Propriété intellectuelle">
        <p>
          L&apos;ensemble des contenus présents sur ce site (textes, photographies, vidéos, logos, enseignements)
          est la propriété exclusive de {L.structure} ou de ses partenaires, et est protégé par les lois
          françaises et internationales relatives à la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle,
          de ces différents éléments est strictement interdite sans l&apos;accord exprès et écrit de {L.structure}.
        </p>
      </LegalArticle>

      <LegalArticle id="donnees" title="4. Données personnelles">
        <p>
          {L.structure} collecte et traite des données à caractère personnel dans le cadre de la gestion des comptes,
          des demandes de rendez-vous et des dons. Conformément au Règlement Général sur la Protection des Données (RGPD)
          et à la loi Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification, de
          suppression et de portabilité de vos données.
        </p>
        <p>
          Pour exercer ces droits, contactez-nous à : <ContactEmail />. Consultez notre{' '}
          <Link href="/politique-de-confidentialite" className={legalLinkClass}>politique de confidentialité</Link>{' '}
          pour plus d&apos;informations.
        </p>
      </LegalArticle>

      <LegalArticle id="cookies" title="5. Cookies">
        <p>
          Ce site utilise uniquement un cookie technique nécessaire à la connexion au compte. Aucun cookie publicitaire
          ni de mesure d&apos;audience n&apos;est utilisé. Voir la{' '}
          <Link href="/politique-de-confidentialite#cookies" className={legalLinkClass}>politique de confidentialité</Link>.
        </p>
      </LegalArticle>

      <LegalArticle id="responsabilite" title="6. Limitation de responsabilité">
        <p>
          {L.structure} s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur
          ce site. Toutefois, elle ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des
          informations mises à disposition, et décline toute responsabilité pour toute imprécision, inexactitude ou
          omission portant sur des informations disponibles sur ce site.
        </p>
      </LegalArticle>

      <LegalArticle id="droit" title="7. Droit applicable">
        <p>
          Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français
          seront seuls compétents.
        </p>
      </LegalArticle>
    </LegalPage>
  );
}
