<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/users', name: 'admin_users_')]
#[IsGranted('ROLE_ADMIN')] // Sécurité : Seul l'admin accède ici
class AdminUserController extends AbstractController
{
    // 1. Lister tous les utilisateurs
    #[Route('', name: 'list', methods: ['GET'])]
    public function listUsers(EntityManagerInterface $em): JsonResponse
    {
        $users = $em->getRepository(User::class)->findAll();
        $data = [];

        foreach ($users as $user) {
            $data[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'roles' => $user->getRoles(),
            ];
        }

        return $this->json($data);
    }

    // 2. Supprimer un utilisateur (Bannir)
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function deleteUser(User $user, EntityManagerInterface $em): JsonResponse
    {
        // On empêche de se supprimer soi-même !
        if ($user === $this->getUser()) {
            return $this->json(['message' => 'Impossible de se supprimer soi-même'], 400);
        }

        $em->remove($user);
        $em->flush();

        return $this->json(['message' => 'Utilisateur supprimé']);
    }

    // 3. Promouvoir / Rétrograder (Assistant Pasteur)
    #[Route('/{id}/role', name: 'toggle_role', methods: ['PATCH'])]
    public function toggleRole(User $user, EntityManagerInterface $em): JsonResponse
    {
        $roles = $user->getRoles();

        if (in_array('ROLE_ADMIN', $roles)) {
            // S'il est admin, on le rétrograde simple user
            $user->setRoles(['ROLE_USER']);
        } else {
            // S'il est user, on le promeut admin
            $user->setRoles(['ROLE_ADMIN', 'ROLE_USER']);
        }

        $em->flush();

        return $this->json(['message' => 'Rôles mis à jour', 'roles' => $user->getRoles()]);
    }
}