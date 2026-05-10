<?php

namespace App\Controller;

use App\Entity\News;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Psr\Log\LoggerInterface;

#[Route('/api', name: 'api_news_')]
class NewsController extends AbstractController
{
    private LoggerInterface $logger;
    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }
    // 1. Lire toutes les news (Public)
    #[Route('/news', name: 'list', methods: ['GET'])]
    public function list(EntityManagerInterface $em, Request $request): JsonResponse
    {
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = min(100, max(1, (int)$request->query->get('limit', 50)));
        $offset = ($page - 1) * $limit;

        $newsList = $em->getRepository(News::class)->findBy(
            ['isPublished' => true], 
            ['createdAt' => 'DESC'],
            $limit,
            $offset
        );

        $data = [];
        foreach ($newsList as $news) {
            $data[] = [
                'id' => $news->getId(),
                'title' => $news->getTitle(),
                'content' => $news->getContent(),
                'imageUrl' => $news->getImageUrl(),
                'date' => $news->getCreatedAt()->format('Y-m-d\TH:i:sP'),
            ];
        }

        return $this->json($data);
    }

    // 2. Lire une news par ID (Public)
    #[Route('/news/{id}', name: 'get_one', methods: ['GET'])]
    public function getOne(News $news): JsonResponse
    {
        return $this->json([
            'id' => $news->getId(),
            'title' => $news->getTitle(),
            'content' => $news->getContent(),
            'imageUrl' => $news->getImageUrl(),
            'date' => $news->getCreatedAt()->format('Y-m-d H:i'),
        ]);
    }

    // 3. (ADMIN) Ajouter une news
    #[Route('/admin/news', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['title']) || empty($data['content'])) {
            return $this->json(['message' => 'Titre et contenu obligatoires'], 400);
        }

        $news = new News();
        $news->setTitle($data['title']);
        $news->setContent($data['content']);
        $news->setImageUrl($data['imageUrl'] ?? null); // Image optionnelle

        // Date et isPublished sont gérés automatiquement par le constructeur de l'entité
        
        $em->persist($news);
        $em->flush();

        return $this->json(['message' => 'Actualité publiée avec succès !'], 201);
    }

    // 3. (ADMIN) Supprimer une news
    #[Route('/admin/news/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(News $news, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($news);
        $em->flush();

        return $this->json(['message' => 'Actualité supprimée']);
    }
}