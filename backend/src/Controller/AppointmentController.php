<?php

namespace App\Controller;

use App\Entity\Appointment;
use App\Service\EmailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api', name: 'api_')]
class AppointmentController extends AbstractController
{
    // 1. Prendre un RDV
    #[Route('/appointments', name: 'create_appointment', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, EmailService $emailService): JsonResponse
    {
        error_log("🚀 Début de la création de RDV...");

        try {
            $user = $this->getUser();
            if (!$user) {
                return $this->json(['message' => 'Vous devez être connecté'], 401);
            }
            
            $data = json_decode($request->getContent(), true);

            if (empty($data['date'])) {
                return $this->json(['message' => 'Date manquante'], 400);
            }

            $appointment = new Appointment();
            
            // --- CORRECTION : ON FORCE L'ASSIGNATION ---
            $motif = $data['subject'] ?? 'Entretien Pastoral';
            
            // On remplit 'reason' directement. 
            // Si PHP te dit "Method not found", c'est que tu as raté l'Étape 1 !
            $appointment->setReason($motif);
            
            // Si ton entité a aussi 'subject', on le met aussi, sinon tu peux supprimer cette ligne
            if (method_exists($appointment, 'setSubject')) {
                 $appointment->setSubject($motif);
            }
            // ------------------------------------------

            $appointment->setPastor($data['pastor'] ?? 'Non spécifié'); 
            $appointment->setMessage($data['message'] ?? '');
            $appointment->setStatus('PENDING');
            $appointment->setUser($user);
            $appointment->setDate(new \DateTimeImmutable($data['date']));

            $em->persist($appointment);
            $em->flush();
            
            error_log("✅ RDV enregistré avec succès");

            // ENVOI EMAIL
            try {
                $emailContent = "<h1>Nouveau RDV</h1><p>Motif : {$motif}<br>Date : {$data['date']}</p>";
                $emailService->sendEmail($user->getEmail(), 'Confirmation de RDV', $emailContent);
            } catch (\Exception $mailError) {
                error_log("⚠️ Erreur mail : " . $mailError->getMessage());
            }

            return $this->json(['message' => 'Rendez-vous créé !'], 201);

        } catch (\Exception $e) {
            error_log("💥 ERREUR : " . $e->getMessage());
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    // 2. Voir MES rendez-vous
    #[Route('/my-appointments', name: 'my_appointments', methods: ['GET'])]
    public function myAppointments(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) return $this->json(['message' => 'Non autorisé'], 401);

        $appointments = $user->getAppointments();
        $data = [];
        foreach ($appointments as $rdv) {
            $data[] = [
                'id' => $rdv->getId(),
                'subject' => $rdv->getReason(), // On utilise getReason() maintenant
                'date' => $rdv->getDate()->format('Y-m-d H:i'),
                'status' => $rdv->getStatus(),
                'message' => $rdv->getMessage(),
                'pastor' => $rdv->getPastor(),
            ];
        }
        return $this->json($data);
    }

    // 3. (ADMIN) Voir TOUTES les demandes
    #[Route('/admin/appointments', name: 'admin_all_appointments', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getAllAppointments(EntityManagerInterface $em): JsonResponse
    {
        $appointments = $em->getRepository(Appointment::class)->findBy([], ['date' => 'DESC']);
        $data = [];
        
        foreach ($appointments as $rdv) {
            $user = $rdv->getUser();
            $data[] = [
                'id' => $rdv->getId(),
                'subject' => $rdv->getReason(), // Ici aussi
                'date' => $rdv->getDate()->format('Y-m-d H:i'),
                'status' => $rdv->getStatus(),
                'message' => $rdv->getMessage(),
                'pastor' => $rdv->getPastor(),
                'user' => $user ? ['email' => $user->getEmail(), 'firstname' => $user->getFirstname(), 'lastname' => $user->getLastname()] : null
            ];
        }
        return $this->json($data);
    }

    // 4. (ADMIN) Changer statut
    #[Route('/admin/appointments/{id}/status', name: 'admin_update_status', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateStatus(Appointment $appointment, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (empty($data['status'])) return $this->json(['message' => 'Statut manquant'], 400);

        $appointment->setStatus($data['status']);
        $em->flush();
        return $this->json(['message' => 'Statut mis à jour']);
    }

    // 5. Supprimer
    #[Route('/appointments/{id}', name: 'delete_appointment', methods: ['DELETE'])]
    public function delete(Appointment $appointment, EntityManagerInterface $em): JsonResponse
    {
        if ($appointment->getUser() !== $this->getUser() && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['message' => 'Interdit'], 403);
        }
        $em->remove($appointment);
        $em->flush();
        return $this->json(['message' => 'Supprimé']);
    }
}