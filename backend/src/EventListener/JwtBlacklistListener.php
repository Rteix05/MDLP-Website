<?php

namespace App\EventListener;

use App\Repository\BlacklistedJwtRepository;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(event: 'kernel.request', priority: 100)]
class JwtBlacklistListener
{
    private $blacklistRepository;

    public function __construct(BlacklistedJwtRepository $blacklistRepository)
    {
        $this->blacklistRepository = $blacklistRepository;
    }

    public function __invoke(RequestEvent $event): void
    {
        $request = $event->getRequest();
        $authHeader = $request->headers->get('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return;
        }
        $jwt = substr($authHeader, 7);
        try {
            if ($this->blacklistRepository->isTokenBlacklisted($jwt)) {
                $event->setResponse(new JsonResponse([
                    'message' => 'Token JWT invalide (blacklisté).'
                ], 401));
            }
        } catch (\Throwable $e) {
            // If the blacklist check fails (missing table, DB down, mapping issue),
            // do not break the request flow — assume token is not blacklisted.
            // This avoids throwing a 500 that would break CORS and block the frontend.
        }
    }
}
