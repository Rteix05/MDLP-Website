<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Repository\PaymentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/payment', name: 'api_payment_')]
class PaymentController extends AbstractController
{
    // --- 1. STRIPE : CRÉER UNE SESSION DE PAIEMENT ---
    #[Route('/stripe-session', name: 'create_stripe_session', methods: ['POST'])]
    public function createStripeSession(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $amount = $data['amount'] ?? 10;

        // On initialise Stripe avec la clé secrète du .env
        Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => 'Don au Ministère',
                        ],
                        'unit_amount' => $amount * 100, // Stripe compte en centimes
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => 'http://localhost:3000/don/merci',
                'cancel_url' => 'http://localhost:3000/don',
            ]);

            return $this->json(['url' => $session->url]);

        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    // --- 2. PAYPAL : ENREGISTRER LE PAIEMENT ---
    #[Route('/record', name: 'record_payment', methods: ['POST'])]
    public function recordPayment(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['amount']) || empty($data['transactionId'])) {
            return $this->json(['message' => 'Données manquantes'], 400);
        }

        $payment = new Payment();
        $payment->setAmount((float)$data['amount']);
        $payment->setTransactionId($data['transactionId']);
        $payment->setStatus('COMPLETED');
        $payment->setDate(new \DateTimeImmutable());

        // Si l'utilisateur est connecté, on lie le paiement à son compte
        if ($this->getUser()) {
            $payment->setUser($this->getUser());
        }

        $em->persist($payment);
        $em->flush();

        return $this->json(['message' => 'Paiement enregistré avec succès !'], 201);
    }

    // --- 3. DASHBOARD : TOTAL DES DONS (Widget) ---
    #[Route('/my-total', name: 'my_total', methods: ['GET'])]
    public function myTotal(PaymentRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json(['total' => 0]);
        }

        $total = $repo->createQueryBuilder('p')
            ->select('SUM(p.amount)')
            ->where('p.user = :user')
            ->andWhere('p.status = :status')
            ->setParameter('user', $user)
            ->setParameter('status', 'COMPLETED')
            ->getQuery()
            ->getSingleScalarResult();

        return $this->json(['total' => (float)$total]);
    }

    // --- 4. DASHBOARD : LISTE DES DONS (Historique) ---
    // Cette méthode sert à afficher le tableau "Historique" sur le frontend
    #[Route('/my-payments', name: 'my_payments', methods: ['GET'])]
    public function myPayments(PaymentRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json([]);
        }

        // On récupère les paiements de l'utilisateur, triés par date (plus récent en haut)
        $payments = $repo->findBy(
            ['user' => $user, 'status' => 'COMPLETED'], 
            ['date' => 'DESC']
        );

        // On prépare les données propres pour le frontend
        $data = [];
        foreach ($payments as $p) {
            $data[] = [
                'id' => $p->getId(),
                'amount' => $p->getAmount(),
                'date' => $p->getDate()->format('d/m/Y'), // Format français
                'transactionId' => $p->getTransactionId(),
            ];
        }

        return $this->json($data);
    }
}