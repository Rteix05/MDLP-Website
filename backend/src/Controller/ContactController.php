<?php

namespace App\Controller;

use App\Service\EmailService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;

class ContactController extends AbstractController
{
    public function __construct(
        private readonly EmailService $emailService,
        #[Autowire('%app.contact_email%')] private readonly string $contactEmail
    ) {}

    #[Route('/api/contact', name: 'api_contact', methods: ['POST'])]
    public function send(Request $request, RateLimiterFactory $contactFormLimiter): JsonResponse
    {
        // Anti-spam : limite le nombre de messages par adresse IP
        if (!$contactFormLimiter->create($request->getClientIp())->consume()->isAccepted()) {
            return $this->json(['message' => 'Trop de messages envoyés. Veuillez réessayer plus tard.'], 429);
        }

        $data = json_decode($request->getContent(), true);

        $name = trim($data['name'] ?? '');
        $email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
        $subject = trim($data['subject'] ?? '');
        $message = trim($data['message'] ?? '');

        if (!$name || !$email || !$subject || !$message) {
            return $this->json(['message' => 'Tous les champs sont obligatoires.'], 400);
        }

        $subjectLabels = [
            'infos' => 'Informations sur l\'église',
            'priere' => 'Demande de prière',
            'benevolat' => 'Devenir bénévole',
            'autre' => 'Autre',
        ];

        try {
            // Envoi à l'adresse de contact
            $this->emailService->sendTemplatedEmail(
                $this->contactEmail,
                '[MDLP Contact] ' . ($subjectLabels[$subject] ?? $subject),
                'emails/contact.html.twig',
                [
                    'name' => $name,
                    'email' => $email,
                    'subject' => $subjectLabels[$subject] ?? $subject,
                    'message' => $message,
                ]
            );

            // Envoi de la confirmation à l'expéditeur
            $this->emailService->sendTemplatedEmail(
                $email,
                'Votre message a bien été reçu',
                'emails/contact_confirmation.html.twig',
                [
                    'name' => $name,
                    'subject' => $subjectLabels[$subject] ?? $subject,
                    'message' => $message,
                ]
            );

            return $this->json(['message' => 'Message envoyé avec succès.']);
        } catch (\Throwable $e) {
            // SI ÇA PLANTE, on attrape l'erreur et on la renvoie proprement en JSON
            // Next.js affichera l'erreur au lieu de crasher avec "Unexpected token '<'" !
            return $this->json([
                'message' => 'Erreur lors de l\'envoi du message.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }
}