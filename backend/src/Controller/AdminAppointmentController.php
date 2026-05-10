<?php

namespace App\Controller;

use App\Entity\Appointment;
use App\Repository\AppointmentRepository;
use App\Service\AuditLogger;
use App\Service\EmailService;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/appointments', name: 'api_admin_appointments_')]
#[IsGranted('ROLE_ADMIN', message: 'Acc\u00e8s r\u00e9serv\u00e9 aux administrateurs')]
class AdminAppointmentController extends AbstractController
{
    private AuditLogger $audit;
    private string $frontendUrl;
    private LoggerInterface $logger;
    public function __construct(AuditLogger $audit, string $frontendUrl, LoggerInterface $logger) {
        $this->audit = $audit;
        $this->frontendUrl = $frontendUrl;
        $this->logger = $logger;
    }
    // 1. LISTE DE TOUS LES RDV (GET)
    #[Route('', name: 'list', methods: ['GET'])]
    public function index(AppointmentRepository $repo, Request $request): JsonResponse
    {
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = min(100, max(1, (int)$request->query->get('limit', 50)));
        $offset = ($page - 1) * $limit;

        $appointments = $repo->findBy([], ['date' => 'DESC'], $limit, $offset);

        $data = [];
        foreach ($appointments as $rdv) {
            // On formate manuellement pour être sûr que React reçoive ce qu'il attend
            $data[] = [
                'id' => $rdv->getId(),
                'subject' => $rdv->getReason(),
                'date' => $rdv->getDate()->format('Y-m-d\TH:i:sP'),
                'status' => $rdv->getStatus(),
                'message' => $rdv->getMessage(),
                'pastor' => $rdv->getPastor(),
                'meetingType' => $rdv->getMeetingType(),
                'user' => $rdv->getUser() ? [
                    'firstname' => $rdv->getUser()->getFirstname(),
                    'lastname' => $rdv->getUser()->getLastname(),
                    'email' => $rdv->getUser()->getEmail(),
                    'phone' => $rdv->getUser()->getPhone(),
                ] : null
            ];
        }

        return $this->json($data);
    }

    // 2. CHANGER LE STATUT (PATCH)
    #[Route('/{id}/status', name: 'update_status', methods: ['PATCH'])]
    public function updateStatus(Appointment $appointment, Request $request, EntityManagerInterface $em, EmailService $emailService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $newStatus = $data['status'] ?? null;

        // Validation basique
        if (!in_array($newStatus, ['CONFIRMED', 'CANCELLED', 'PENDING'])) {
            return $this->json(['message' => 'Statut invalide'], 400);
        }

        $appointment->setStatus($newStatus);
        $em->flush();

        $this->audit->log('APPOINTMENT_STATUS_CHANGED', [
            'appointment_id' => $appointment->getId(),
            'new_status' => $newStatus,
            'user_email' => $appointment->getUser()?->getEmail(),
        ]);

        // Envoyer un email au fidèle pour le prévenir
        if (in_array($newStatus, ['CONFIRMED', 'CANCELLED'])) {
            $user = $appointment->getUser();
            try {
                $emailService->sendTemplatedEmail(
                    $user->getEmail(),
                    $newStatus === 'CONFIRMED'
                        ? '✅ Votre rendez-vous est confirmé — MDLP'
                        : '❌ Votre rendez-vous a été refusé — MDLP',
                    'emails/appointment_status.html.twig',
                    [
                        'userName' => $user->getFirstname(),
                        'subject' => $appointment->getReason(),
                        'date' => $appointment->getDate()->format('d/m/Y à H\hi'),
                        'pastor' => $appointment->getPastor(),
                        'status' => $newStatus,
                        'statusLabel' => $newStatus === 'CONFIRMED' ? 'confirmée' : 'refusée',
                        'dashboardUrl' => $this->frontendUrl . '/dashboard',
                    ]
                );
            } catch (\Exception $e) {
                // Log l'erreur mais ne bloque pas la réponse
                $this->logger->error('Erreur envoi email RDV: ' . $e->getMessage(), ['exception' => $e]);
            }
        }

        return $this->json(['message' => 'Statut mis à jour', 'status' => $newStatus]);
    }
}