<?php

namespace App\Controller;

use App\Entity\News;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api', name: 'api_news_')]
class NewsController extends AbstractController
{
    // 1. Lire toutes les news (Public)
    #[Route('/news', name: 'list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        // On récupère les news publiées, triées par date (plus récentes en premier)
        $newsList = $em->getRepository(News::class)->findBy(
            ['isPublished' => true], 
            ['createdAt' => 'DESC']
        );

        $data = [];
        foreach ($newsList as $news) {
            $data[] = [
                'id' => $news->getId(),
                'title' => $news->getTitle(),
                'content' => $news->getContent(),
                'imageUrl' => $news->getImageUrl(),
                'date' => $news->getCreatedAt()->format('d/m/Y'),
            ];
        }

        return $this->json($data);
    }

    // 2. (ADMIN) Ajouter une news
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