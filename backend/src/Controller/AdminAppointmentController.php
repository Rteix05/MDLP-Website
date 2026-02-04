<?php

namespace App\Controller;

use App\Entity\Appointment;
use App\Repository\AppointmentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/appointments', name: 'api_admin_appointments_')]
// 👇 Sécurité : Seuls les admins peuvent toucher à ce contrôleur
#[IsGranted('ROLE_ADMIN', message: 'Accès réservé aux administrateurs')]
class AdminAppointmentController extends AbstractController
{
    // 1. LISTE DE TOUS LES RDV (GET)
    #[Route('', name: 'list', methods: ['GET'])]
    public function index(AppointmentRepository $repo): JsonResponse
    {
        // On récupère tout, trié par date (du plus récent au plus vieux)
        $appointments = $repo->findBy([], ['date' => 'DESC']);

        $data = [];
        foreach ($appointments as $rdv) {
            // On formate manuellement pour être sûr que React reçoive ce qu'il attend
            $data[] = [
                'id' => $rdv->getId(),
                'subject' => $rdv->getReason(), // 'reason' dans la BDD = 'subject' dans ton React
                'date' => $rdv->getDate()->format('d/m/Y H:i'),
                'status' => $rdv->getStatus(),
                'message' => $rdv->getReason(), // J'ai mis reason ici aussi, adapte si tu as un autre champ
                'pastor' => $rdv->getPastorName(), // Le champ qu'on a ajouté
                'user' => [
                    'firstname' => $rdv->getUser()->getFirstname(),
                    'lastname' => $rdv->getUser()->getLastname(),
                    'email' => $rdv->getUser()->getEmail(),
                    'phone' => $rdv->getUser()->getPhone(),
                ]
            ];
        }

        return $this->json($data);
    }

    // 2. CHANGER LE STATUT (PATCH)
    #[Route('/{id}/status', name: 'update_status', methods: ['PATCH'])]
    public function updateStatus(Appointment $appointment, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $newStatus = $data['status'] ?? null;

        // Validation basique
        if (!in_array($newStatus, ['CONFIRMED', 'CANCELLED', 'PENDING'])) {
            return $this->json(['message' => 'Statut invalide'], 400);
        }

        $appointment->setStatus($newStatus);
        $em->flush();

        // (Optionnel) Ici, on pourrait envoyer un email au user pour le prévenir ! 📧

        return $this->json(['message' => 'Statut mis à jour', 'status' => $newStatus]);
    }
}