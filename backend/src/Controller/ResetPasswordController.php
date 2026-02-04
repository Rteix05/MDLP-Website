<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\EmailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'api_reset_password_')]
class ResetPasswordController extends AbstractController
{
    #[Route('/forgot-password', name: 'request', methods: ['POST'])]
    public function requestReset(Request $request, EntityManagerInterface $em, EmailService $emailService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';

        $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if ($user) {
            $token = bin2hex(random_bytes(32));
            $expiresAt = new \DateTimeImmutable('+1 hour');

            $user->setResetToken($token);
            $user->setResetTokenExpiresAt($expiresAt);
            $em->flush();

            $link = "http://localhost:3000/reset-password?token=" . $token;

            $content = "<h1>Mot de passe oublie</h1><p>Cliquez ici : <a href='$link'>Reinitialiser</a></p>";

            // J'ai mis ton adresse en dur ici pour être SUR que ça arrive chez toi pour le test
            $emailService->sendEmail('eis95xx@gmail.com', 'Reset Password', $content);
        }

        return $this->json(['message' => 'Email envoye si compte existe']);
    }

    #[Route('/reset-password', name: 'confirm', methods: ['POST'])]
    public function reset(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? '';
        $newPassword = $data['password'] ?? '';

        if (!$token || !$newPassword) return $this->json(['message' => 'Manque token ou password'], 400);

        $user = $em->getRepository(User::class)->findOneBy(['resetToken' => $token]);

        if (!$user) return $this->json(['message' => 'Token invalide'], 400);

        if ($user->getResetTokenExpiresAt() < new \DateTimeImmutable()) {
            return $this->json(['message' => 'Token expire'], 400);
        }

        $hashedPassword = $passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);
        $user->setResetToken(null);
        $user->setResetTokenExpiresAt(null);
        $em->flush();

        return $this->json(['message' => 'Succes mot de passe change']);
    }
}