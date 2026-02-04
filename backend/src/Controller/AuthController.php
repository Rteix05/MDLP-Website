<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'api_')]
class AuthController extends AbstractController
{
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validation basique étendue
        if (empty($data['email']) || empty($data['password']) || empty($data['firstname']) || empty($data['lastname'])) {
            return $this->json(['message' => 'Tous les champs obligatoires (Email, Password, Nom, Prénom) doivent être remplis'], 400);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setPassword($passwordHasher->hashPassword($user, $data['password']));
        
        // Nouveaux champs
        $user->setFirstname($data['firstname']);
        $user->setLastname($data['lastname']);
        
        // Le téléphone est optionnel (on vérifie s'il est présent)
        if (!empty($data['phone'])) {
            $user->setPhone($data['phone']);
        }

        $user->setRoles(['ROLE_USER']);

        $em->persist($user);
        $em->flush();

        return $this->json(['message' => 'Compte créé avec succès !'], 201);
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 401);
        }

        return $this->json([
            'email' => $user->getUserIdentifier(),
            'firstname' => $user->getFirstname(), // On renvoie le prénom
            'lastname' => $user->getLastname(),   // On renvoie le nom
            'phone' => $user->getPhone(),         // On renvoie le téléphone
            'roles' => $user->getRoles(),
        ]);
    }
}