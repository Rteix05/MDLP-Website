<?php

namespace App\Controller;

use App\Entity\Pastor;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api', name: 'api_pastors_')]
class PastorController extends AbstractController
{
    // 1. Lire la liste des pasteurs (Pour le Planning et la page Accueil)
    #[Route('/pastors', name: 'list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $pastors = $em->getRepository(Pastor::class)->findAll();

        $data = [];
        foreach ($pastors as $pastor) {
            $data[] = [
                'id' => $pastor->getId(),
                'name' => $pastor->getName(),
                'role' => $pastor->getRole(),
                'description' => $pastor->getDescription(),
                'imageUrl' => $pastor->getImageUrl(),
            ];
        }

        return $this->json($data);
    }

    // 2. (ADMIN) Ajouter un nouveau pasteur
    #[Route('/admin/pastors', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['name']) || empty($data['role'])) {
            return $this->json(['message' => 'Nom et Rôle obligatoires'], 400);
        }

        $pastor = new Pastor();
        $pastor->setName($data['name']);
        $pastor->setRole($data['role']);
        $pastor->setDescription($data['description'] ?? '');
        $pastor->setImageUrl($data['imageUrl'] ?? null);

        $em->persist($pastor);
        $em->flush();

        return $this->json(['message' => 'Pasteur ajouté avec succès !'], 201);
    }

    // 3. (ADMIN) Supprimer un pasteur
    #[Route('/admin/pastors/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(Pastor $pastor, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($pastor);
        $em->flush();

        return $this->json(['message' => 'Pasteur supprimé']);
    }
}