<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'api_')]
class AuthController extends AbstractController
{
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $em, RateLimiterFactory $authRegisterLimiter): JsonResponse
    {
        $limiter = $authRegisterLimiter->create($request->getClientIp());
        if (!$limiter->consume()->isAccepted()) {
            return $this->json(['message' => 'Trop de tentatives. Veuillez r\u00e9essayer plus tard.'], 429);
        }

        $data = json_decode($request->getContent(), true);

        // Validation basique étendue
        if (empty($data['email']) || empty($data['password']) || empty($data['firstname']) || empty($data['lastname'])) {
            return $this->json(['message' => 'Tous les champs obligatoires (Email, Password, Nom, Prénom) doivent être remplis'], 400);
        }

        // Validation email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->json(['message' => 'Adresse email invalide'], 400);
        }

        // Validation mot de passe (min 8 chars, 1 majuscule, 1 minuscule, 1 chiffre)
        $password = $data['password'];
        if (strlen($password) < 8) {
            return $this->json(['message' => 'Le mot de passe doit contenir au moins 8 caractères'], 400);
        }
        if (!preg_match('/[A-Z]/', $password)) {
            return $this->json(['message' => 'Le mot de passe doit contenir au moins une majuscule'], 400);
        }
        if (!preg_match('/[a-z]/', $password)) {
            return $this->json(['message' => 'Le mot de passe doit contenir au moins une minuscule'], 400);
        }
        if (!preg_match('/[0-9]/', $password)) {
            return $this->json(['message' => 'Le mot de passe doit contenir au moins un chiffre'], 400);
        }

        // Vérifier si l'email existe déjà
        $existingUser = $em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return $this->json(['message' => 'Un compte avec cet email existe déjà'], 409);
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

        // Envoi d'un mail à l'admin pour notifier l'inscription
        try {
            $adminEmail = $_ENV['CONTACT_EMAIL'] ?? 'contact@mdlp.fr';
            $emailService = $this->container->get('App\\Service\\EmailService');
            $emailService->sendTemplatedEmail(
                $adminEmail,
                'Nouvelle inscription utilisateur',
                'emails/registration_admin_notification.html.twig',
                [
                    'firstname' => $user->getFirstname(),
                    'lastname' => $user->getLastname(),
                    'userEmail' => $user->getEmail(),
                    'date' => (new \DateTimeImmutable())->format('d/m/Y H:i')
                ]
            );
        } catch (\Exception $mailError) {
            // Log l'erreur mais ne pas bloquer la réponse
        }

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