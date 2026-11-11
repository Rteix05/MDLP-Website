import Link from 'next/link';
import type { Metadata } from 'next';
import { LEGAL_INFO as L } from '@/lib/legalInfo';
import { ContactEmail, LegalArticle, LegalIdentity, LegalList, LegalPage, LegalToc, LegalValue, legalLinkClass } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Conditions des dons – MDLP | Montagne de la Prière',
  description: "Conditions applicables aux dons en ligne faits à l'association Montagne de la Prière Ministries.",
  alternates: { canonical: '/conditions-des-dons' },
};

const ARTICLES = [
  { id: 'objet', title: '1. Objet' },
  { id: 'beneficiaire', title: '2. Bénéficiaire des dons' },
  { id: 'nature', title: '3. Nature du don' },
  { id: 'montant', title: '4. Montant' },
  { id: 'paiement', title: '5. Paiement' },
  { id: 'confirmation', title: '6. Confirmation et reçu' },
  { id: 'remboursement', title: '7. Remboursement' },
  { id: 'affectation', title: '8. Affectation des dons' },
  { id: 'donnees', title: '9. Données personnelles' },
  { id: 'reclamations', title: '10. Réclamations' },
  { id: 'droit', title: '11. Droit applicable' },
];

export default function ConditionsDesDonsPage() {
  return (
    <LegalPage title="Conditions des dons">
      <LegalToc label="Sommaire des conditions des dons" articles={ARTICLES} />

      <LegalArticle id="objet" title="1. Objet">
        <p>
          Les présentes conditions s&apos;appliquent à tout don effectué en ligne sur le site <strong>{L.site}</strong>,
          depuis la page <Link href="/don" className={legalLinkClass}>Faire un don</Link>. Faire un don implique leur
          acceptation.
        </p>
      </LegalArticle>

      <LegalArticle id="beneficiaire" title="2. Bénéficiaire des dons">
        <LegalIdentity rows={[
          { label: 'Dénomination', value: L.structure },
          { label: 'Forme juridique', value: <LegalValue value={L.formeJuridique} label="forme juridique" /> },
          { label: 'N° RNA', value: L.rna },
          { label: 'Siège social', value: <LegalValue value={L.siege} label="adresse complète" /> },
          { label: 'SIREN / SIRET', value: <LegalValue value={L.siren} label="numéro" /> },
          { label: 'Email', value: <ContactEmail /> },
        ]} />
      </LegalArticle>

      <LegalArticle id="nature" title="3. Nature du don">
        <p>
          Un don est un versement volontaire et sans contrepartie au profit de l&apos;association. Il ne constitue ni
          un achat ni le paiement d&apos;une prestation : aucun bien ni service n&apos;est fourni en échange.
        </p>
        <p>Le don peut être fait avec ou sans compte sur le site.</p>
      </LegalArticle>

      <LegalArticle id="montant" title="4. Montant">
        <p>Le donateur choisit librement le montant de son don, entre 1 € et 50 000 € par versement.</p>
        <p>Le montant est exprimé en euros, toutes taxes comprises, et ne comporte aucun frais supplémentaire pour le donateur.</p>
      </LegalArticle>

      <LegalArticle id="paiement" title="5. Paiement">
        <p>Le paiement s&apos;effectue en ligne, de manière sécurisée, par l&apos;intermédiaire de :</p>
        <LegalList items={[
          <><strong>Stripe</strong>, par carte bancaire ;</>,
          <><strong>PayPal</strong>.</>,
        ]} />
        <p>
          Les données bancaires sont saisies directement auprès de ces prestataires : elles ne transitent jamais par les
          serveurs de l&apos;association et ne sont pas conservées par elle.
        </p>
      </LegalArticle>

      <LegalArticle id="confirmation" title="6. Confirmation et reçu">
        <p>
          Une fois le paiement validé, le donateur est redirigé vers une page de remerciement. Pour un don par carte
          bancaire, il reçoit également une confirmation par email accompagnée d&apos;un reçu au format PDF.
        </p>
        <p>
          Le donateur disposant d&apos;un compte retrouve l&apos;historique de ses dons et peut télécharger ses reçus
          depuis son espace personnel.
        </p>
      </LegalArticle>

      <LegalArticle id="remboursement" title="7. Remboursement">
        <p>
          Le don étant un acte volontaire et sans contrepartie, il n&apos;ouvre pas de droit de rétractation.
        </p>
        <p>
          En cas d&apos;erreur manifeste (montant erroné, double paiement), le donateur peut demander le remboursement
          en écrivant à <ContactEmail /> dans un délai de 30 jours, en indiquant la date, le montant et la référence de
          la transaction figurant sur le reçu.
        </p>
      </LegalArticle>

      <LegalArticle id="affectation" title="8. Affectation des dons">
        <p>
          Les dons sont affectés au fonctionnement et aux activités de l&apos;association, conformément à son objet.
        </p>
      </LegalArticle>

      <LegalArticle id="donnees" title="9. Données personnelles">
        <p>
          Les données nécessaires au traitement du don (montant, date, référence de transaction, nom et adresse email)
          sont conservées 10 ans conformément aux obligations comptables. Leur traitement est détaillé dans la{' '}
          <Link href="/politique-de-confidentialite" className={legalLinkClass}>politique de confidentialité</Link>.
        </p>
      </LegalArticle>

      <LegalArticle id="reclamations" title="10. Réclamations">
        <p>Toute question ou réclamation relative à un don peut être adressée à : <ContactEmail /></p>
      </LegalArticle>

      <LegalArticle id="droit" title="11. Droit applicable">
        <p>Les présentes conditions sont soumises au droit français.</p>
      </LegalArticle>
    </LegalPage>
  );
}
