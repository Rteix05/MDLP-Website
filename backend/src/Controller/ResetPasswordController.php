<?php

namespace App\Controller;

use App\Entity\User;
use App\Security\PasswordPolicy;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;
use Psr\Log\LoggerInterface;

#[Route('/api')]
class ResetPasswordController extends AbstractController
{
    private string $frontendUrl;
    private LoggerInterface $logger;
    public function __construct(string $frontendUrl, LoggerInterface $logger) {
        $this->frontendUrl = $frontendUrl;
        $this->logger = $logger;
    }
    #[Route('/forgot-password', name: 'api_forgot_password', methods: ['POST'])]
    public function forgotPassword(Request $request, EntityManagerInterface $em, MailerInterface $mailer, RateLimiterFactory $authForgotPasswordLimiter): JsonResponse
    {
        $limiter = $authForgotPasswordLimiter->create($request->getClientIp());
        if (!$limiter->consume()->isAccepted()) {
            return $this->json(['message' => 'Trop de tentatives. Veuillez r\u00e9essayer plus tard.'], 429);
        }

        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if (!$email) {
            return $this->json(['message' => 'Email requis'], 400);
        }

        $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if ($user) {
            // 1. Générer un token unique
            $token = bin2hex(random_bytes(32));
            $user->setResetToken($token);
            $user->setResetTokenExpiresAt(new \DateTimeImmutable('+1 hour'));
            $em->flush();

            // 2. Préparer le lien pour le frontend
            $resetLink = $this->frontendUrl . '/reset-password?token=' . $token;

            // 3. Envoyer l'email avec ton super design Twig !
            try {
                $emailMessage = (new TemplatedEmail())
                    ->from('contact@mdlp.fr')
                    ->to($user->getEmail())
                    ->subject('Réinitialisation de votre mot de passe - MDLP')
                    ->htmlTemplate('emails/reset_password.html.twig')
                    ->context([
                        'user' => $user,
                        'resetUrl' => $resetLink
                    ]);

                $mailer->send($emailMessage);
            } catch (\Exception $e) {
                // Log l'erreur mais ne pas la dévoiler au client
                $this->logger->error('Erreur envoi email reset password: ' . $e->getMessage(), ['exception' => $e]);
            }
        }

        // Toujours renvoyer un succès (pour ne pas dévoiler si l'email existe ou non aux hackers)
        return $this->json(['message' => 'Si un compte existe, un email a été envoyé.']);
    }

    #[Route('/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $hasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? null;
        $password = $data['password'] ?? null;

        if (!is_string($token) || !$token || !$password) {
            return $this->json(['message' => 'Données invalides'], 400);
        }
        if ($passwordError = PasswordPolicy::validate($password)) {
            return $this->json(['message' => $passwordError], 400);
        }

        // Chercher l'utilisateur avec ce token
        $user = $em->getRepository(User::class)->findOneBy(['resetToken' => $token]);

        if (!$user) {
            return $this->json(['message' => 'Lien invalide ou expiré'], 400);
        }

        // Vérifier que le token n'a pas expiré
        if ($user->getResetTokenExpiresAt() && $user->getResetTokenExpiresAt() < new \DateTimeImmutable()) {
            $user->setResetToken(null);
            $user->setResetTokenExpiresAt(null);
            $em->flush();
            return $this->json(['message' => 'Ce lien a expiré. Veuillez refaire une demande.'], 400);
        }

        // Hasher et sauvegarder le nouveau mot de passe
        $hashedPassword = $hasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);
        $user->setResetToken(null);
        $user->setResetTokenExpiresAt(null);
        $em->flush();

        return $this->json(['message' => 'Mot de passe modifié avec succès']);
    }
}