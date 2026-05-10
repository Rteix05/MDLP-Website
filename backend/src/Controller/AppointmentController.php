<?php

namespace App\Controller;

use App\Entity\Appointment;
use App\Entity\User;
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
            if (!$user instanceof User) {
                return $this->json(['message' => 'Vous devez être connecté'], 401);
            }
            
            $data = json_decode($request->getContent(), true);

            if (empty($data['date'])) {
                return $this->json(['message' => 'Date manquante'], 400);
            }

            $appointment = new Appointment();
            
            $motif = $data['subject'] ?? 'Entretien Pastoral';
            $appointment->setReason($motif);

            $appointment->setPastor($data['pastor'] ?? 'Non spécifié'); 
            $appointment->setMessage($data['message'] ?? '');
            $appointment->setMeetingType($data['meetingType'] ?? 'presentiel');
            $appointment->setStatus('PENDING');
            $appointment->setUser($user);
            $appointment->setDate(new \DateTimeImmutable($data['date']));

            $em->persist($appointment);
            $em->flush();
            
            error_log("✅ RDV enregistré avec succès");

            // ENVOI EMAIL UTILISATEUR
            try {
                $emailService->sendTemplatedEmail(
                    $user->getEmail(),
                    'Confirmation de rendez-vous',
                    'emails/appointment_confirmation.html.twig',
                    [
                        'firstname' => $user->getFirstname(),
                        'lastname' => $user->getLastname(),
                        'motif' => $motif,
                        'date' => $data['date'],
                        'hour' => $data['hour'] ?? null
                    ]
                );
            } catch (\Exception $mailError) {
                error_log("⚠️ Erreur mail : " . $mailError->getMessage());
            }

            // ENVOI EMAIL ADMIN
            try {
                $adminEmail = $_ENV['CONTACT_EMAIL'] ?? 'contact@mdlp.fr';
                $emailService->sendTemplatedEmail(
                    $adminEmail,
                    'Nouvelle demande de rendez-vous en attente',
                    'emails/appointment_admin_notification.html.twig',
                    [
                        'firstname' => $user->getFirstname(),
                        'lastname' => $user->getLastname(),
                        'motif' => $motif,
                        'date' => $data['date'],
                        'hour' => $data['hour'] ?? null,
                        'userEmail' => $user->getEmail()
                    ]
                );
            } catch (\Exception $mailError) {
                error_log("⚠️ Erreur mail admin : " . $mailError->getMessage());
            }

            return $this->json(['message' => 'Rendez-vous créé !'], 201);

        } catch (\Exception $e) {
            error_log("💥 ERREUR : " . $e->getMessage());
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    // 2. Créneaux confirmés (public, pour bloquer dans le calendrier)
    #[Route('/appointments/blocked-slots', name: 'blocked_slots', methods: ['GET'])]
    public function blockedSlots(EntityManagerInterface $em): JsonResponse
    {
        $appointments = $em->getRepository(Appointment::class)->findBy(['status' => 'CONFIRMED']);
        $slots = [];
        foreach ($appointments as $rdv) {
            $slots[] = $rdv->getDate()->format('Y-m-d H:i');
        }
        return $this->json($slots);
    }

    // 3. Voir MES rendez-vous
    #[Route('/my-appointments', name: 'my_appointments', methods: ['GET'])]
    public function myAppointments(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) return $this->json(['message' => 'Non autorisé'], 401);

        $appointments = $user->getAppointments();
        $data = [];
        foreach ($appointments as $rdv) {
            $data[] = [
                'id' => $rdv->getId(),
                'subject' => $rdv->getReason(),
                'date' => $rdv->getDate()->format('Y-m-d\TH:i:sP'),
                'status' => $rdv->getStatus(),
                'message' => $rdv->getMessage(),
                'pastor' => $rdv->getPastor(),
                'meetingType' => $rdv->getMeetingType(),
            ];
        }
        return $this->json($data);
    }

    // 3. Supprimer
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