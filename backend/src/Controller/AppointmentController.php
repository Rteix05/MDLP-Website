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

            try {
                $dateObj = new \DateTimeImmutable((string) $data['date']);
            } catch (\Exception) {
                return $this->json(['message' => 'Date invalide'], 400);
            }
            if ($dateObj < new \DateTimeImmutable()) {
                return $this->json(['message' => 'Impossible de réserver un créneau passé.'], 400);
            }
            $dayOfWeek = (int) $dateObj->format('N'); // 1=Lundi, 2=Mardi, 4=Jeudi
            $hour = (int) $dateObj->format('H');
            $minute = (int) $dateObj->format('i');

            if ($dayOfWeek !== 2 && $dayOfWeek !== 4) {
                return $this->json(['message' => 'Les rendez-vous sont uniquement disponibles le Mardi et le Jeudi.'], 400);
            }
            if ($hour < 14 || $hour >= 18 || ($hour === 17 && $minute > 30) || ($minute !== 0 && $minute !== 30)) {
                return $this->json(['message' => 'Le créneau doit être entre 14h00 et 17h30, par tranche de 30 minutes.'], 400);
            }

            // Créneau déjà confirmé pour quelqu'un d'autre
            if ($em->getRepository(Appointment::class)->findOneBy(['date' => $dateObj, 'status' => 'CONFIRMED'])) {
                return $this->json(['message' => 'Ce créneau est déjà réservé.'], 409);
            }

            $appointment = new Appointment();

            $motif = mb_substr(trim((string) ($data['subject'] ?? '')), 0, 255) ?: 'Entretien Pastoral';
            $appointment->setReason($motif);

            $appointment->setPastor(mb_substr(trim((string) ($data['pastor'] ?? '')), 0, 255) ?: 'Non spécifié');
            $appointment->setMessage(mb_substr((string) ($data['message'] ?? ''), 0, 5000));
            $appointment->setMeetingType('visio');
            $appointment->setStatus('PENDING');
            $appointment->setUser($user);
            $appointment->setDate($dateObj);

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
            // Ne pas renvoyer le détail technique au navigateur
            return $this->json(['error' => 'Erreur serveur, veuillez réessayer plus tard.'], 500);
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