<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Entity\User;
use App\Service\InvoicePdfService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/invoice', name: 'api_invoice_')]
class InvoiceController extends AbstractController
{
    #[Route('/{id}', name: 'download', methods: ['GET'])]
    public function download(Payment $payment, InvoicePdfService $pdfService): Response
    {
        $user = $this->getUser();

        // Seul le propriétaire du paiement ou un admin peut télécharger le reçu
        if (!$user instanceof User || ($payment->getUser() !== $user && !$this->isGranted('ROLE_ADMIN'))) {
            return new Response('Accès refusé', 403);
        }

        $pdfContent = $pdfService->generatePdfContent($payment);
        $receiptNumber = $pdfService->getReceiptNumber($payment);

        return new Response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $receiptNumber . '.pdf"'
        ]);
    }
}