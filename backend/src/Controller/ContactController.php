<?php

namespace App\Controller;

use App\Service\EmailService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class ContactController extends AbstractController
{
    public function __construct(
        private readonly EmailService $emailService,
        #[Autowire('%app.contact_email%')] private readonly string $contactEmail
    ) {}

    #[Route('/api/contact', name: 'api_contact', methods: ['POST'])]
    public function send(Request $request): JsonResponse
    {
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

        return $this->json(['message' => 'Message envoyé avec succès.']);
    }
}
