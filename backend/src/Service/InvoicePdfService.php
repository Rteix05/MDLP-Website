<?php

namespace App\Service;

use App\Entity\Payment;
use Dompdf\Dompdf;
use Dompdf\Options;

class InvoicePdfService
{
    public function generatePdfContent(Payment $payment): string
    {
        $pdfOptions = new Options();
        $pdfOptions->set('defaultFont', 'Helvetica');
        $pdfOptions->set('isHtml5ParserEnabled', true);
        $dompdf = new Dompdf($pdfOptions);

        $user = $payment->getUser();
        $userName = $user ? strtoupper($user->getFirstname() . ' ' . $user->getLastname()) : 'DONATEUR ANONYME';
        $userEmail = $user ? $user->getEmail() : 'Non renseigné';

        $dateObj = $payment->getDate();
        $dateFacture = $dateObj->format('d/m/Y');
        $annee = $dateObj->format('Y');

        $numeroRecu = 'DON-' . $annee . '-' . str_pad($payment->getId(), 5, '0', STR_PAD_LEFT);
        $amount = number_format($payment->getAmount(), 2, ',', ' ');
        $transactionId = $payment->getTransactionId();

        $html = "
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset='utf-8'>
                <style>
                    body { 
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                        color: #111827; 
                        font-size: 12px; 
                        line-height: 1.5;
                        margin: 20px;
                    }
                    table { width: 100%; border-collapse: collapse; }
                    td { vertical-align: top; }
                    .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; margin: 0; }
                    .doc-title { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
                    .doc-number { font-size: 20px; font-weight: bold; margin: 0; }
                    .section-title { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
                    .info-box { border: 2px solid #111827; padding: 15px; margin-bottom: 30px; }
                    .info-text { font-size: 13px; font-weight: bold; margin: 0 0 4px 0; }
                    .info-subtext { font-size: 11px; color: #4b5563; margin: 0; }
                    .table-items { margin-top: 30px; border-top: 2px solid #111827; }
                    .table-items th { padding: 12px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #111827; text-align: left; }
                    .table-items td { padding: 15px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
                    .text-right { text-align: right !important; }
                    .total-box { margin-top: 20px; width: 100%; }
                    .total-amount { font-size: 24px; font-weight: 900; }
                    .footer { position: absolute; bottom: 30px; width: 100%; text-align: center; font-size: 9px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        <td style='width: 50%;'>
                            <h1 class='logo'>MDLP.</h1>
                            <p class='info-subtext'>Montagne de la Prière</p>
                        </td>
                        <td style='width: 50%; text-align: right;'>
                            <p class='doc-title'>REÇU DE DON</p>
                            <p class='doc-number'>N° {$numeroRecu}</p>
                            <p class='info-subtext' style='margin-top: 5px;'>Émis le {$dateFacture}</p>
                        </td>
                    </tr>
                </table>

                <div style='height: 40px;'></div>

                <table>
                    <tr>
                        <td style='width: 48%; padding-right: 2%;'>
                            <div class='section-title'>Organisme bénéficiaire</div>
                            <div class='info-box'>
                                <p class='info-text'>ASSOCIATION MDLP</p>
                                <p class='info-subtext'>5 Allée Bienvenue</p>
                                <p class='info-subtext'>93130 Noisy-Le-Grand</p>
                                <p class='info-subtext'>France</p>
                                <p class='info-subtext' style='margin-top: 8px;'>Email: contact@mdlp.fr</p>
                            </div>
                        </td>
                        <td style='width: 48%; padding-left: 2%;'>
                            <div class='section-title'>Donateur</div>
                            <div class='info-box' style='background-color: #f9fafb; border-color: #e5e7eb;'>
                                <p class='info-text'>{$userName}</p>
                                <p class='info-subtext'>{$userEmail}</p>
                                <p class='info-subtext' style='margin-top: 15px; color: #9ca3af; font-style: italic;'>
                                    Reçu délivré conformément à l'enregistrement<br>du don sur notre plateforme en ligne.
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>

                <table class='table-items'>
                    <thead>
                        <tr>
                            <th style='width: 40%;'>Description</th>
                            <th style='width: 30%;'>Réf. Transaction</th>
                            <th style='width: 30%;' class='text-right'>Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Don libre</strong><br><span style='font-size: 10px; color: #6b7280;'>Soutien aux activités de l'église</span></td>
                            <td style='font-family: monospace; font-size: 11px; color: #4b5563;'>{$transactionId}</td>
                            <td class='text-right' style='font-weight: bold;'>{$amount} €</td>
                        </tr>
                    </tbody>
                </table>

                <table class='total-box'>
                    <tr>
                        <td style='width: 60%;'></td>
                        <td style='width: 40%; text-align: right; padding-top: 20px;'>
                            <span class='section-title'>Total du don</span><br>
                            <span class='total-amount'>{$amount} €</span>
                        </td>
                    </tr>
                </table>

                <div style='margin-top: 50px; padding: 20px; background-color: #f9fafb; border-left: 4px solid #111827; font-size: 11px; color: #4b5563;'>
                    <strong>Attestation :</strong><br>
                    L'association MDLP reconnaît avoir reçu à titre de don la somme de {$amount} euros.<br>
                    Nous vous remercions chaleureusement pour votre générosité qui permet de faire avancer l'œuvre.
                </div>

                <div class='footer'>
                    ASSOCIATION MDLP - Association loi 1901 - 5 Allée Bienvenue, 93130 Noisy-Le-Grand<br>
                    Document généré électroniquement, tenant lieu de reçu. À conserver dans vos archives.
                </div>

            </body>
        </html>";

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }

    public function getReceiptNumber(Payment $payment): string
    {
        $annee = $payment->getDate()->format('Y');
        return 'DON-' . $annee . '-' . str_pad($payment->getId(), 5, '0', STR_PAD_LEFT);
    }
}
