<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\AuditLogger;
use App\Service\EmailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/users', name: 'admin_users_')]
#[IsGranted('ROLE_ADMIN')]
class AdminUserController extends AbstractController
{
    public function __construct(private readonly AuditLogger $audit, private readonly EmailService $emailService) {}
    // 1. Lister tous les utilisateurs
    #[Route('', name: 'list', methods: ['GET'])]
    public function listUsers(EntityManagerInterface $em, Request $request): JsonResponse
    {
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = min(100, max(1, (int)$request->query->get('limit', 50)));
        $offset = ($page - 1) * $limit;

        $users = $em->getRepository(User::class)->findBy([], ['id' => 'DESC'], $limit, $offset);
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
        // Un administrateur ne peut pas être supprimé depuis le back-office
        if (in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            return $this->json(['message' => 'Impossible de supprimer un administrateur'], 403);
        }

        $email = $user->getEmail();
        $firstname = $user->getFirstname();

        $em->remove($user);
        $em->flush();

        $this->audit->log('USER_DELETED', [
            'deleted_user_id' => $user->getId(),
            'deleted_email' => $email,
        ]);

        try {
            $this->emailService->sendTemplatedEmail(
                $email,
                'Votre compte MDLP a été supprimé',
                'emails/account_deleted.html.twig',
                ['firstname' => $firstname]
            );
        } catch (\Exception $e) {}

        return $this->json(['message' => 'Utilisateur supprimé']);
    }

    // 3. Promouvoir / Rétrograder (Assistant Pasteur)
    #[Route('/{id}/role', name: 'toggle_role', methods: ['PATCH'])]
    public function toggleRole(User $user, EntityManagerInterface $em): JsonResponse
    {
        // Un administrateur ne peut pas être rétrogradé, ni par un autre admin ni par lui-même
        if (in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            return $this->json(['message' => 'Impossible de rétrograder un administrateur'], 403);
        }

        $user->setRoles(['ROLE_ADMIN', 'ROLE_USER']);

        $em->flush();
        $this->audit->log('USER_ROLE_CHANGED', [
            'target_user_id' => $user->getId(),
            'target_email' => $user->getEmail(),
            'new_roles' => $user->getRoles(),
        ]);
        return $this->json(['message' => 'Rôles mis à jour', 'roles' => $user->getRoles()]);
    }
}