<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Entity\User;
use App\Repository\PaymentRepository;
use App\Service\InvoicePdfService;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/api/payment', name: 'api_payment_')]
class PaymentController extends AbstractController
{
    private string $frontendUrl;
    private string $stripeSecretKey;
    private string $stripeWebhookSecret;
    private string $paypalClientId;
    private string $paypalClientSecret;
    private string $paypalApiBase;

    public function __construct(
        string $frontendUrl,
        string $stripeSecretKey,
        string $stripeWebhookSecret,
        string $paypalClientId,
        string $paypalClientSecret,
        string $paypalMode,
        private HttpClientInterface $httpClient,
    ) {
        $this->frontendUrl = $frontendUrl;
        $this->stripeSecretKey = $stripeSecretKey;
        $this->stripeWebhookSecret = $stripeWebhookSecret;
        $this->paypalClientId = $paypalClientId;
        $this->paypalClientSecret = $paypalClientSecret;
        $this->paypalApiBase = $paypalMode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }
    // --- 1. STRIPE : CRÉER UNE SESSION DE PAIEMENT ---
    #[Route('/stripe-session', name: 'create_stripe_session', methods: ['POST'])]
    public function createStripeSession(Request $request, LoggerInterface $logger): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $rawAmount = $data['amount'] ?? 10;

        // Montant en euros, entre 1 € et 50 000 €, arrondi au centime
        if (!is_numeric($rawAmount)) {
            return $this->json(['error' => 'Montant invalide'], 400);
        }
        $amountCents = (int) round(((float) $rawAmount) * 100);
        if ($amountCents < 100 || $amountCents > 5000000) {
            return $this->json(['error' => 'Le montant doit être compris entre 1 € et 50 000 €'], 400);
        }

        // On initialise Stripe avec la clé secrète du .env
        Stripe::setApiKey($this->stripeSecretKey);

        // Récupérer l'ID utilisateur si connecté
        $user = $this->getUser();
        $metadata = [];
        if ($user) {
            $metadata['user_id'] = $user->getId();
        }



        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => 'Don au Ministère',
                        ],
                        'unit_amount' => $amountCents, // Stripe compte en centimes
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'metadata' => $metadata,
                'success_url' => $this->frontendUrl . '/don/merci?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $this->frontendUrl . '/don',
            ]);

            return $this->json(['url' => $session->url]);

        } catch (\Exception $e) {
            $logger->error('Erreur Stripe Session: ' . $e->getMessage(), ['exception' => $e]);
            return $this->json(['error' => 'Erreur serveur, veuillez réessayer plus tard.'], 500);
        }
    }

    // --- 2. STRIPE WEBHOOK : ENREGISTRER LE PAIEMENT APRÈS SUCCÈS ---
    #[Route('/stripe-webhook', name: 'stripe_webhook', methods: ['POST'])]
    public function stripeWebhook(Request $request, EntityManagerInterface $em, MailerInterface $mailer, InvoicePdfService $pdfService, LoggerInterface $logger): Response
    {
        Stripe::setApiKey($this->stripeSecretKey);

        $payload = $request->getContent();
        $sigHeader = $request->headers->get('Stripe-Signature');
        $endpointSecret = $this->stripeWebhookSecret;

        if (!$endpointSecret) {
            return new Response('Webhook secret not configured', 500);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
            $eventType = $event->type;
            $sessionData = $event->data->object;
        } catch (\Exception $e) {
            $logger->error('Erreur Stripe Webhook signature: ' . $e->getMessage(), ['exception' => $e]);
            return new Response('Invalid signature', 400);
        }

        if ($eventType === 'checkout.session.completed') {
            // Accéder aux données de la session (peut être un objet Stripe ou un array)
            if (is_array($sessionData)) {
                $amountTotal = ($sessionData['amount_total'] ?? 0) / 100;
                $stripeSessionId = $sessionData['id'] ?? null;
                $meta = $sessionData['metadata'] ?? [];
            } else {
                $amountTotal = ($sessionData->amount_total ?? 0) / 100;
                $stripeSessionId = $sessionData->id ?? null;
                $meta = $sessionData->metadata ?? [];
            }
            $meta = is_array($meta) ? $meta : (method_exists($meta, 'toArray') ? $meta->toArray() : (array) $meta);
            $userId = $meta['user_id'] ?? null;

            // Récupérer l'email du client Stripe (pour les dons anonymes)
            $customerEmail = null;
            if (is_array($sessionData)) {
                $customerDetails = $sessionData['customer_details'] ?? [];
                $customerEmail = is_array($customerDetails) ? ($customerDetails['email'] ?? null) : ($customerDetails->email ?? null);
            } else {
                $customerEmail = $sessionData->customer_details->email ?? null;
            }

            // Vérifier qu'on n'a pas déjà enregistré ce paiement
            $existing = $em->getRepository(Payment::class)->findOneBy(['transactionId' => $stripeSessionId]);
            if (!$existing && $amountTotal > 0) {
                $payment = new Payment();
                $payment->setAmount($amountTotal);
                $payment->setTransactionId($stripeSessionId);
                $payment->setStatus('COMPLETED');
                $payment->setDate(new \DateTimeImmutable());

                $user = null;
                if ($userId) {
                    $user = $em->getRepository(User::class)->find($userId);
                    if ($user) {
                        $payment->setUser($user);
                    }
                }

                $em->persist($payment);
                $em->flush();

                // Envoyer l'email de confirmation avec le PDF en pièce jointe
                if ($user) {
                    try {
                        $pdfContent = $pdfService->generatePdfContent($payment);
                        $receiptNumber = $pdfService->getReceiptNumber($payment);
                        $frontendUrl = $this->frontendUrl;

                        $email = (new TemplatedEmail())
                            ->from('contact@mdlp.fr')
                            ->to($user->getEmail())
                            ->subject('Confirmation de don - ' . $receiptNumber . ' - MDLP')
                            ->htmlTemplate('emails/donation_confirmation.html.twig')
                            ->context([
                                'userName' => $user->getFirstname(),
                                'amount' => number_format($payment->getAmount(), 2, ',', ' '),
                                'date' => $payment->getDate()->format('d/m/Y'),
                                'transactionId' => $payment->getTransactionId(),
                                'receiptNumber' => $receiptNumber,
                                'dashboardUrl' => $frontendUrl . '/dashboard',
                            ])
                            ->attach($pdfContent, $receiptNumber . '.pdf', 'application/pdf');

                        $mailer->send($email);
                    } catch (\Exception $e) {
                        $logger->error('Erreur envoi email confirmation don: ' . $e->getMessage(), ['exception' => $e]);
                        // Log l'erreur mais ne pas bloquer le webhook
                    }
                    
                    // Envoyer un mail à l'admin pour notifier le don
                    try {
                        $adminEmail = $_ENV['CONTACT_EMAIL'] ?? 'contact@mdlp.fr';
                        $adminMail = (new TemplatedEmail())
                            ->from('contact@mdlp.fr')
                            ->to($adminEmail)
                            ->subject('Nouveau don effectué')
                            ->htmlTemplate('emails/donation_admin_notification.html.twig')
                            ->context([
                                'userName' => $user->getFirstname(),
                                'userEmail' => $user->getEmail(),
                                'amount' => number_format($payment->getAmount(), 2, ',', ' '),
                                'date' => $payment->getDate()->format('d/m/Y'),
                                'transactionId' => $payment->getTransactionId(),
                                'receiptNumber' => $receiptNumber,
                            ]);
                        $mailer->send($adminMail);
                    } catch (\Exception $e) {
                        $logger->error('Erreur envoi email admin don: ' . $e->getMessage(), ['exception' => $e]);
                    }
                } elseif ($customerEmail) {
                    // Don anonyme : envoyer confirmation à l'email Stripe
                    try {
                        $pdfContent = $pdfService->generatePdfContent($payment);
                        $receiptNumber = $pdfService->getReceiptNumber($payment);

                        $email = (new TemplatedEmail())
                            ->from('contact@mdlp.fr')
                            ->to($customerEmail)
                            ->subject('Confirmation de don - ' . $receiptNumber . ' - MDLP')
                            ->htmlTemplate('emails/donation_confirmation.html.twig')
                            ->context([
                                'userName' => 'Donateur',
                                'amount' => number_format($payment->getAmount(), 2, ',', ' '),
                                'date' => $payment->getDate()->format('d/m/Y'),
                                'transactionId' => $payment->getTransactionId(),
                                'receiptNumber' => $receiptNumber,
                                'dashboardUrl' => $this->frontendUrl,
                            ])
                            ->attach($pdfContent, $receiptNumber . '.pdf', 'application/pdf');

                        $mailer->send($email);
                    } catch (\Exception $e) {
                        $logger->error('Erreur envoi email confirmation don anonyme: ' . $e->getMessage(), ['exception' => $e]);
                    }

                    // Notifier l'admin
                    try {
                        $adminEmail = $_ENV['CONTACT_EMAIL'] ?? 'contact@mdlp.fr';
                        $adminMail = (new TemplatedEmail())
                            ->from('contact@mdlp.fr')
                            ->to($adminEmail)
                            ->subject('Nouveau don effectué (anonyme)')
                            ->htmlTemplate('emails/donation_admin_notification.html.twig')
                            ->context([
                                'userName' => 'Donateur anonyme',
                                'userEmail' => $customerEmail,
                                'amount' => number_format($payment->getAmount(), 2, ',', ' '),
                                'date' => $payment->getDate()->format('d/m/Y'),
                                'transactionId' => $payment->getTransactionId(),
                                'receiptNumber' => $pdfService->getReceiptNumber($payment),
                            ]);
                        $mailer->send($adminMail);
                    } catch (\Exception $e) {
                        $logger->error('Erreur envoi email admin don anonyme: ' . $e->getMessage(), ['exception' => $e]);
                    }
                }
            }
        }

        return new Response('OK', 200);
    }

    // --- 3. RÉCUPÉRER LE PAYMENT ID PAR SESSION STRIPE ---
    #[Route('/by-session', name: 'payment_by_session', methods: ['GET'])]
    public function getPaymentBySession(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }
        $sessionId = $request->query->get('session_id');
        if (!$sessionId) {
            return $this->json(['error' => 'session_id manquant'], 400);
        }
        $payment = $em->getRepository(Payment::class)->findOneBy(['transactionId' => $sessionId]);
        if (!$payment) {
            return $this->json(['error' => 'Paiement non trouvé'], 404);
        }
        // Vérifie que le paiement appartient à l'utilisateur ou admin
        if ($payment->getUser() && $payment->getUser()->getId() !== $user->getId() && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Accès interdit'], 403);
        }
        return $this->json([
            'id' => $payment->getId(),
            'amount' => $payment->getAmount(),
        ]);
    }

    // --- 4. PAYPAL : ENREGISTRER LE PAIEMENT ---
    #[Route('/record', name: 'record_payment', methods: ['POST'])]
    public function recordPayment(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Authentification obligatoire
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Authentification requise'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['amount']) || empty($data['transactionId'])) {
            return $this->json(['message' => 'Données manquantes'], 400);
        }

        $amount = (float)$data['amount'];
        if ($amount <= 0 || $amount > 50000) {
            return $this->json(['message' => 'Montant invalide'], 400);
        }

        // Vérification serveur PayPal
        $paypalVerification = $this->verifyPaypalTransaction($data['transactionId'], $amount);
        if (!$paypalVerification['valid']) {
            return $this->json(['message' => 'Transaction PayPal non valide'], 400);
        }

        // Vérifier que ce transactionId n'existe pas déjà (anti-replay)
        $existing = $em->getRepository(Payment::class)->findOneBy(['transactionId' => $data['transactionId']]);
        if ($existing) {
            return $this->json(['message' => 'Ce paiement a déjà été enregistré'], 409);
        }

        $payment = new Payment();
        $payment->setAmount($amount);
        $payment->setTransactionId($data['transactionId']);
        $payment->setStatus('COMPLETED');
        $payment->setDate(new \DateTimeImmutable());
        $payment->setUser($user);

        $em->persist($payment);
        $em->flush();

        return $this->json(['message' => 'Paiement enregistré avec succès !'], 201);
    }

    // Vérification PayPal côté serveur via l'API Orders v2
    private function verifyPaypalTransaction(string $transactionId, float $amount): array
    {
        try {
            // 1. Obtenir un access token
            $tokenResponse = $this->httpClient->request('POST', $this->paypalApiBase . '/v1/oauth2/token', [
                'auth_basic' => [$this->paypalClientId, $this->paypalClientSecret],
                'body' => 'grant_type=client_credentials',
                'headers' => ['Content-Type' => 'application/x-www-form-urlencoded'],
            ]);
            $tokenData = $tokenResponse->toArray();
            $accessToken = $tokenData['access_token'] ?? null;

            if (!$accessToken) {
                return ['valid' => false, 'reason' => 'Impossible d\'obtenir le token PayPal'];
            }

            // 2. Récupérer l'ordre PayPal
            $orderResponse = $this->httpClient->request('GET', $this->paypalApiBase . '/v2/checkout/orders/' . $transactionId, [
                'auth_bearer' => $accessToken,
            ]);
            $order = $orderResponse->toArray();

            // 3. Vérifier le statut COMPLETED
            if (($order['status'] ?? '') !== 'COMPLETED') {
                return ['valid' => false, 'reason' => 'Statut PayPal: ' . ($order['status'] ?? 'inconnu')];
            }

            // 4. Vérifier le montant (tolérance de 0.01€ pour les arrondis)
            $paidAmount = (float)($order['purchase_units'][0]['amount']['value'] ?? 0);
            if (abs($paidAmount - $amount) > 0.01) {
                return ['valid' => false, 'reason' => 'Montant PayPal ne correspond pas'];
            }

            return ['valid' => true];

        } catch (\Exception $e) {
            return ['valid' => false, 'reason' => 'Erreur vérification PayPal: ' . $e->getMessage()];
        }
    }

    // --- 5. DASHBOARD : TOTAL DES DONS (Widget) ---
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

    // --- 6. DASHBOARD : LISTE DES DONS (Historique) ---
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

    // --- 7. ADMIN : LISTE DE TOUS LES PAIEMENTS ---
    #[Route('/admin/all', name: 'admin_all_payments', methods: ['GET'])]
    public function adminAllPayments(PaymentRepository $repo, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $page = max(1, (int)$request->query->get('page', 1));
        $limit = min(100, max(1, (int)$request->query->get('limit', 50)));
        $offset = ($page - 1) * $limit;
        $month = $request->query->get('month'); // 1-12
        $year = $request->query->get('year');   // ex: 2026

        $qb = $em->createQueryBuilder()
            ->select('p')
            ->from(Payment::class, 'p')
            ->where('p.status = :status')
            ->setParameter('status', 'COMPLETED')
            ->orderBy('p.date', 'DESC');

        $countQb = $em->createQueryBuilder()
            ->select('COUNT(p.id)')
            ->from(Payment::class, 'p')
            ->where('p.status = :status')
            ->setParameter('status', 'COMPLETED');

        $statsQb = $em->createQueryBuilder()
            ->select('SUM(p.amount) as totalAmount')
            ->from(Payment::class, 'p')
            ->where('p.status = :status')
            ->setParameter('status', 'COMPLETED');

        if ($year && $month) {
            $start = new \DateTimeImmutable("$year-$month-01");
            $end = $start->modify('first day of next month');
            foreach ([$qb, $countQb, $statsQb] as $builder) {
                $builder->andWhere('p.date >= :filterStart AND p.date < :filterEnd')
                    ->setParameter('filterStart', $start)
                    ->setParameter('filterEnd', $end);
            }
        } elseif ($year) {
            $start = new \DateTimeImmutable("$year-01-01");
            $end = $start->modify('+1 year');
            foreach ([$qb, $countQb, $statsQb] as $builder) {
                $builder->andWhere('p.date >= :filterStart AND p.date < :filterEnd')
                    ->setParameter('filterStart', $start)
                    ->setParameter('filterEnd', $end);
            }
        } elseif ($month) {
            // Mois sans année = mois de l'année courante
            $currentYear = (int)date('Y');
            $start = new \DateTimeImmutable("$currentYear-$month-01");
            $end = $start->modify('first day of next month');
            foreach ([$qb, $countQb, $statsQb] as $builder) {
                $builder->andWhere('p.date >= :filterStart AND p.date < :filterEnd')
                    ->setParameter('filterStart', $start)
                    ->setParameter('filterEnd', $end);
            }
        }

        $total = (int)$countQb->getQuery()->getSingleScalarResult();
        $filteredTotal = (float)($statsQb->getQuery()->getSingleScalarResult() ?? 0);

        $payments = $qb->setFirstResult($offset)->setMaxResults($limit)->getQuery()->getResult();

        // Stats par période (sur tous les paiements, sans filtre mois/année)
        $now = new \DateTimeImmutable();

        $weekStart = $now->modify('monday this week')->setTime(0, 0);
        $weekTotal = (float)($em->createQueryBuilder()
            ->select('SUM(p.amount)')
            ->from(Payment::class, 'p')
            ->where('p.status = :s')->setParameter('s', 'COMPLETED')
            ->andWhere('p.date >= :ws')->setParameter('ws', $weekStart)
            ->getQuery()->getSingleScalarResult() ?? 0);
        $weekCount = (int)($em->createQueryBuilder()
            ->select('COUNT(p.id)')
            ->from(Payment::class, 'p')
            ->where('p.status = :s')->setParameter('s', 'COMPLETED')
            ->andWhere('p.date >= :ws')->setParameter('ws', $weekStart)
            ->getQuery()->getSingleScalarResult());

        $monthStart = $now->modify('first day of this month')->setTime(0, 0);
        $monthTotal = (float)($em->createQueryBuilder()
            ->select('SUM(p.amount)')
            ->from(Payment::class, 'p')
            ->where('p.status = :s')->setParameter('s', 'COMPLETED')
            ->andWhere('p.date >= :ms')->setParameter('ms', $monthStart)
            ->getQuery()->getSingleScalarResult() ?? 0);
        $monthCount = (int)($em->createQueryBuilder()
            ->select('COUNT(p.id)')
            ->from(Payment::class, 'p')
            ->where('p.status = :s')->setParameter('s', 'COMPLETED')
            ->andWhere('p.date >= :ms')->setParameter('ms', $monthStart)
            ->getQuery()->getSingleScalarResult());

        $yearStart = $now->modify('first day of january this year')->setTime(0, 0);
        $yearTotal = (float)($em->createQueryBuilder()
            ->select('SUM(p.amount)')
            ->from(Payment::class, 'p')
            ->where('p.status = :s')->setParameter('s', 'COMPLETED')
            ->andWhere('p.date >= :ys')->setParameter('ys', $yearStart)
            ->getQuery()->getSingleScalarResult() ?? 0);
        $yearCount = (int)($em->createQueryBuilder()
            ->select('COUNT(p.id)')
            ->from(Payment::class, 'p')
            ->where('p.status = :s')->setParameter('s', 'COMPLETED')
            ->andWhere('p.date >= :ys')->setParameter('ys', $yearStart)
            ->getQuery()->getSingleScalarResult());

        $data = [];
        foreach ($payments as $p) {
            $user = $p->getUser();
            $data[] = [
                'id' => $p->getId(),
                'amount' => $p->getAmount(),
                'date' => $p->getDate()->format('c'),
                'transactionId' => $p->getTransactionId(),
                'user' => $user ? [
                    'id' => $user->getId(),
                    'firstname' => $user->getFirstname(),
                    'lastname' => $user->getLastname(),
                    'email' => $user->getEmail(),
                ] : null,
            ];
        }

        return $this->json([
            'payments' => $data,
            'total' => $total,
            'filteredRevenue' => $filteredTotal,
            'page' => $page,
            'limit' => $limit,
            'stats' => [
                'week' => ['total' => $weekTotal, 'count' => $weekCount, 'avg' => $weekCount > 0 ? round($weekTotal / $weekCount, 2) : 0],
                'month' => ['total' => $monthTotal, 'count' => $monthCount, 'avg' => $monthCount > 0 ? round($monthTotal / $monthCount, 2) : 0],
                'year' => ['total' => $yearTotal, 'count' => $yearCount, 'avg' => $yearCount > 0 ? round($yearTotal / $yearCount, 2) : 0],
            ],
        ]);
    }
}