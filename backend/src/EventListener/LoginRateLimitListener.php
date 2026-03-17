<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\RateLimiter\RateLimiterFactory;

#[AsEventListener(event: 'kernel.request', priority: 256)]
class LoginRateLimitListener
{
    public function __construct(
        private readonly RateLimiterFactory $authLoginLimiter
    ) {}

    public function __invoke(RequestEvent $event): void
    {
        $request = $event->getRequest();

        if ($request->getPathInfo() !== '/api/login_check' || $request->getMethod() !== 'POST') {
            return;
        }

        $limiter = $this->authLoginLimiter->create($request->getClientIp());

        if (!$limiter->consume()->isAccepted()) {
            $event->setResponse(new JsonResponse(
                ['message' => 'Trop de tentatives de connexion. Veuillez réessayer plus tard.'],
                429
            ));
        }
    }
}
