<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class EmailService
{
    private $mailer;

    public function __construct(MailerInterface $mailer)
    {
        $this->mailer = $mailer;
    }

    public function sendEmail(string $to, string $subject, string $content): void
    {
        // On n'a plus besoin de try/catch ici, on laisse Symfony gérer les erreurs
        // ou on les attrape dans le Controller si besoin.
        
        $email = (new Email())
            ->from('rafaelteixeira0511@gmail.com') // Ton adresse validée
            ->to($to)
            ->subject($subject)
            ->html($content);

        $this->mailer->send($email);
    }
}