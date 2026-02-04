<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/me', name: 'api_profile_')]
class ProfileController extends AbstractController
{
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) return $this->json(['message' => 'Non connecté'], 401);

        return $this->json([
            'firstname' => $user->getFirstname(),
            'lastname' => $user->getLastname(),
            'email' => $user->getEmail(),
            'phone' => method_exists($user, 'getPhone') ? $user->getPhone() : '', // Si tu as ajouté le champ phone
            'roles' => $user->getRoles(),
        ]);
    }
    // 1. Mettre à jour ses infos perso (Nom, Prénom, Tél)
    #[Route('/update', name: 'update', methods: ['PUT'])]
    public function updateProfile(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) return $this->json(['message' => 'Non connecté'], 401);

        $data = json_decode($request->getContent(), true);

        // On met à jour seulement si le champ est envoyé
        if (isset($data['firstname'])) $user->setFirstname($data['firstname']);
        if (isset($data['lastname']))  $user->setLastname($data['lastname']);
        if (isset($data['phone']))     $user->setPhone($data['phone']);

        $em->flush();

        return $this->json([
            'message' => 'Profil mis à jour avec succès !',
            'user' => [
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'phone' => $user->getPhone()
            ]
        ]);
    }

    // 2. Changer son mot de passe
    #[Route('/password', name: 'password', methods: ['PATCH'])]
    public function updatePassword(
        Request $request, 
        UserPasswordHasherInterface $passwordHasher, 
        EntityManagerInterface $em
    ): JsonResponse
    {
        $user = $this->getUser(); // L'utilisateur connecté
        if (!$user) return $this->json(['message' => 'Non connecté'], 401);

        $data = json_decode($request->getContent(), true);

        $oldPassword = $data['oldPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        if (!$oldPassword || !$newPassword) {
            return $this->json(['message' => 'Veuillez remplir tous les champs'], 400);
        }

        // 1. Vérifier si l'ancien mot de passe est bon
        if (!$passwordHasher->isPasswordValid($user, $oldPassword)) {
            return $this->json(['message' => 'Ancien mot de passe incorrect'], 400);
        }

        // 2. Hacher et sauvegarder le nouveau
        $hashedPassword = $passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);

        $em->flush();

        return $this->json(['message' => 'Mot de passe modifié avec succès !']);
    }
}