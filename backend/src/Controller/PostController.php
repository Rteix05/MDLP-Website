<?php

namespace App\Controller;

use App\Entity\Post;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/news', name: 'api_news_')]
class PostController extends AbstractController
{
    // 1. D'abord la liste (GET ALL)
    #[Route('', name: 'get_all', methods: ['GET'])]
    public function getAll(EntityManagerInterface $em): JsonResponse
    {
        $posts = $em->getRepository(Post::class)->findBy([], ['createdAt' => 'DESC']);
        
        $data = [];
        foreach ($posts as $post) {
            $data[] = [
                'id' => $post->getId(),
                'title' => $post->getTitle(),
                'content' => $post->getContent(),
                'date' => $post->getCreatedAt()->format('Y-m-d H:i'),
                'author' => $post->getAuthor() ?? 'L\'équipe MDLP'
            ];
        }

        return $this->json($data);
    }

    // 2. ENSUITE la route spécifique GENERATE (IMPORTANT : AVANT L'ID)
    #[Route('/generate', name: 'generate_posts', methods: ['GET'])]
    public function generate(EntityManagerInterface $em): JsonResponse
    {
        // Article 1
        $post1 = new Post();
        $post1->setTitle('Bienvenue sur le nouveau site de MDLP !');
        $post1->setContent("C'est une grande joie de vous accueillir sur notre nouvelle plateforme numérique. Ici, vous pourrez retrouver toutes les actualités, les événements et les enseignements de l'église. N'hésitez pas à créer votre compte pour accéder à l'espace membre.");
        $post1->setCreatedAt(new \DateTimeImmutable('-2 days')); 
        $post1->setAuthor('Pasteur Pierre');
        $em->persist($post1);

        // Article 2
        $post2 = new Post();
        $post2->setTitle('Retour sur le culte de dimanche');
        $post2->setContent("Quel moment béni nous avons passé ensemble ce dimanche ! La louange était puissante et le message sur la foi a touché de nombreux cœurs. Retrouvez les photos sur notre page Facebook.");
        $post2->setCreatedAt(new \DateTimeImmutable('-1 week'));
        $post2->setAuthor('Équipe Com');
        $em->persist($post2);

        // Article 3
        $post3 = new Post();
        $post3->setTitle('Collecte alimentaire : Merci à tous');
        $post3->setContent("Grâce à votre générosité, nous avons pu distribuer plus de 50 paniers repas aux familles dans le besoin de Noisy-le-Grand. Continuons à être une lumière dans notre ville !");
        $post3->setCreatedAt(new \DateTimeImmutable('-10 days'));
        $post3->setAuthor('Diaconat');
        $em->persist($post3);

        $em->flush();

        return $this->json(['message' => '3 articles ont été créés avec succès ! 🚀']);
    }

    // 3. EN DERNIER : La route dynamique avec ID (car elle attrape tout le reste)
    #[Route('/{id}', name: 'get_one', methods: ['GET'])]
    public function getOne(Post $post): JsonResponse
    {
        return $this->json([
            'id' => $post->getId(),
            'title' => $post->getTitle(),
            'content' => $post->getContent(),
            'date' => $post->getCreatedAt()->format('Y-m-d H:i'),
            'author' => $post->getAuthor() ?? 'L\'équipe MDLP'
        ]);
    }
}