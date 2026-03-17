<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;

class AuditLogger
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly Security $security
    ) {}

    public function log(string $action, array $context = []): void
    {
        $user = $this->security->getUser();
        $context['admin_email'] = $user?->getUserIdentifier() ?? 'anonymous';
        $context['timestamp'] = (new \DateTimeImmutable())->format('Y-m-d\TH:i:sP');

        $this->logger->info("[AUDIT] $action", $context);
    }
}
