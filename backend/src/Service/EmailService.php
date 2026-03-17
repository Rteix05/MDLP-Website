<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;

class EmailService
{
    private $mailer;
    private $twig;
    private string $fromEmail;

    public function __construct(MailerInterface $mailer, Environment $twig, string $fromEmail = 'contact@mdlp.fr')
    {
        $this->mailer = $mailer;
        $this->twig = $twig;
        $this->fromEmail = $fromEmail;
    }

    /**
     * Envoie un email avec un template Twig
     * 
     * @param string $to Adresse email du destinataire
     * @param string $subject Sujet de l'email
     * @param string $template Chemin du template Twig (ex: 'emails/appointment_confirmation.html.twig')
     * @param array $context Variables à passer au template
     */
    public function sendTemplatedEmail(string $to, string $subject, string $template, array $context = []): void
    {
        $htmlContent = $this->twig->render($template, $context);
        
        $email = (new Email())
            ->from($this->fromEmail)
            ->to($to)
            ->subject($subject)
            ->html($htmlContent);

        $this->mailer->send($email);
    }

    /**
     * Envoie un email simple avec du HTML brut (pour compatibilité)
     * 
     * @deprecated Utiliser sendTemplatedEmail() à la place
     */
    public function sendEmail(string $to, string $subject, string $content): void
    {
        $email = (new Email())
            ->from($this->fromEmail)
            ->to($to)
            ->subject($subject)
            ->html($content);

        $this->mailer->send($email);
    }
}