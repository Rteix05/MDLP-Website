<?php

namespace App\Controller;

use App\Entity\Payment;
use Dompdf\Dompdf;
use Dompdf\Options;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/invoice', name: 'api_invoice_')]
class InvoiceController extends AbstractController
{
    #[Route('/{id}', name: 'download', methods: ['GET'])]
    public function download(Payment $payment): Response
    {
        // 1. Configuration de Dompdf
        $pdfOptions = new Options();
        $pdfOptions->set('defaultFont', 'Arial');
        $dompdf = new Dompdf($pdfOptions);

        // 2. Préparation des données
        $user = $payment->getUser();
        $userName = $user ? $user->getFirstname() . ' ' . $user->getLastname() : 'Donateur Anonyme';
        $userEmail = $user ? $user->getEmail() : 'N/A';
        $date = $payment->getDate()->format('d/m/Y à H:i');
        $amount = number_format($payment->getAmount(), 2);

        // 3. HTML de la facture
        $html = "
        <html>
            <head>
                <style>
                    body { font-family: sans-serif; color: #333; }
                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .box { border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; }
                    .total { font-size: 24px; font-weight: bold; color: #27ae60; text-align: right; }
                    .footer { margin-top: 50px; font-size: 12px; text-align: center; color: #777; }
                </style>
            </head>
            <body>
                <div class='header'>
                    <h1>REÇU DE DON</h1>
                    <p>Montagne de la Prière</p>
                </div>

                <div class='box'>
                    <p><strong>Référence :</strong> {$payment->getTransactionId()}</p>
                    <p><strong>Date :</strong> {$date}</p>
                    <p><strong>Donateur :</strong> {$userName}</p>
                    <p><strong>Email :</strong> {$userEmail}</p>
                </div>

                <div class='total'>
                    Montant : {$amount} €
                </div>

                <div class='footer'>
                    <p>Merci pour votre générosité.</p>
                </div>
            </body>
        </html>";

        // 4. Génération
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        // 5. Envoi
        return new Response($dompdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="recu_don_' . $payment->getId() . '.pdf"'
        ]);
    }
}