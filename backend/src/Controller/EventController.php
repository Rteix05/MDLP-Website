<?php

namespace App\Controller;

use App\Entity\Event;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api', name: 'api_')]
class EventController extends AbstractController
{
    // 1. Récupérer les événements
    #[Route('/events', name: 'get_events', methods: ['GET'])]
    public function getEvents(EntityManagerInterface $em, Request $request): JsonResponse
    {
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = min(100, max(1, (int)$request->query->get('limit', 50)));
        $offset = ($page - 1) * $limit;

        $events = $em->getRepository(Event::class)->findBy([], ['date' => 'DESC'], $limit, $offset);
        $data = [];
        
        foreach ($events as $event) {
            $data[] = [
                'id' => $event->getId(),
                'title' => $event->getTitle(),
                'description' => $event->getDescription(),
                'start' => $event->getDate() ? $event->getDate()->format('Y-m-d H:i:s') : null,
                'end' => $event->getEndDate() ? $event->getEndDate()->format('Y-m-d H:i:s') : null,
                'location' => $event->getLocation(),
                'category' => $event->getCategory(), // <--- NOUVEAU : On envoie la catégorie au Frontend
            ];
        }

        return $this->json($data);
    }

    // 2. Créer un événement
    #[Route('/events', name: 'create_event', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function createEvent(Request $request, EntityManagerInterface $em, LoggerInterface $logger): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            // Vérification basique
            if (!isset($data['title']) || !isset($data['start']) || !isset($data['end'])) {
                return $this->json(['message' => 'Données incomplètes (title, start, end requis)'], 400);
            }

            $event = new Event();
            $event->setTitle($data['title']);
            $event->setDescription($data['description'] ?? '');
            $event->setLocation($data['location'] ?? 'Église');

            // <--- NOUVEAU : Gestion de la catégorie (Par défaut 'AUTRE' si vide)
            $event->setCategory($data['category'] ?? 'AUTRE');

            // Conversion des dates
            try {
                $event->setDate(new \DateTimeImmutable($data['start']));
                $event->setEndDate(new \DateTimeImmutable($data['end']));
            } catch (\Exception $e) {
                return $this->json(['message' => 'Format de date invalide. Utilisez YYYY-MM-DD HH:MM'], 400);
            }

            $em->persist($event);
            $em->flush();

            return $this->json(['message' => 'Événement créé avec succès !'], 201);

        } catch (\Exception $e) {
            $logger->error('Erreur création événement: ' . $e->getMessage(), ['exception' => $e]);
            return $this->json([
                'error' => 'Erreur serveur, veuillez réessayer plus tard.'
            ], 500);
        }
    }
}