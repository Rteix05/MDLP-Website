<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Entity\User;
use App\Repository\PaymentRepository;
use App\Service\InvoicePdfService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/invoice', name: 'api_invoice_')]
class InvoiceController extends AbstractController
{
    // requirements : sans ça, « /by-session » était capturé par cette route et renvoyait 404
    #[Route('/{id}', name: 'download', methods: ['GET'], requirements: ['id' => '\d+'])]
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

    /**
     * Endpoint public : génère le reçu PDF à partir du session_id Stripe.
     * Accessible sans compte — le session_id suffit comme preuve de paiement.
     */
    #[Route('/by-session', name: 'download_by_session', methods: ['GET'])]
    public function downloadBySession(Request $request, PaymentRepository $paymentRepository, InvoicePdfService $pdfService): Response
    {
        $sessionId = $request->query->get('session_id');
        if (!$sessionId) {
            return new Response('session_id manquant', 400);
        }

        $payment = $paymentRepository->findOneBy(['transactionId' => $sessionId]);
        if (!$payment) {
            return new Response('Paiement non trouvé', 404);
        }

        $pdfContent = $pdfService->generatePdfContent($payment);
        $receiptNumber = $pdfService->getReceiptNumber($payment);

        return new Response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $receiptNumber . '.pdf"'
        ]);
    }
}