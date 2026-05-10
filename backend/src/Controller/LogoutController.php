<?php

namespace App\Controller;

use App\Entity\BlacklistedJwt;
use App\Repository\BlacklistedJwtRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class LogoutController extends AbstractController
{
    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function logout(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $authHeader = $request->headers->get('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return $this->json(['message' => 'Aucun token JWT fourni'], 400);
        }
        $jwt = substr($authHeader, 7);
        $payload = explode('.', $jwt)[1] ?? null;
        if (!$payload) {
            return $this->json(['message' => 'Token JWT invalide'], 400);
        }
        $data = json_decode(base64_decode(strtr($payload, '-_', '+/')), true);
        $exp = $data['exp'] ?? null;
        if (!$exp) {
            return $this->json(['message' => 'Impossible de lire la date d\'expiration du token'], 400);
        }
        $expiresAt = (new \DateTimeImmutable())->setTimestamp($exp);
        $blacklisted = new BlacklistedJwt();
        $blacklisted->setToken($jwt);
        $blacklisted->setExpiresAt($expiresAt);
        $em->persist($blacklisted);
        $em->flush();
        return $this->json(['message' => 'Déconnexion réussie, token blacklisté.']);
    }
}
