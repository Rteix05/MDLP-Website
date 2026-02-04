<?php

namespace App\Controller;

use App\Repository\PaymentRepository; // <--- N'oublie pas d'importer ça
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/stats', name: 'api_admin_stats_')]
#[IsGranted('ROLE_ADMIN')]
class AdminStatsController extends AbstractController
{
    #[Route('', name: 'get', methods: ['GET'])]
    public function index(UserRepository $userRepo, PaymentRepository $paymentRepo): JsonResponse
    {
        // 1. Compter les utilisateurs
        $userCount = $userRepo->count([]);

        // 2. Calculer le total des revenus (Somme des 'amount' où status = 'COMPLETED')
        // On utilise le QueryBuilder de Doctrine pour faire la somme
        $totalRevenue = $paymentRepo->createQueryBuilder('p')
            ->select('SUM(p.amount)')
            ->where('p.status = :status')
            ->setParameter('status', 'COMPLETED')
            ->getQuery()
            ->getSingleScalarResult();

        // Si c'est null (pas de paiements), on met 0
        $totalRevenue = $totalRevenue ?? 0;

        return $this->json([
            'userCount' => $userCount,
            'totalRevenue' => (float)$totalRevenue // On s'assure que c'est un chiffre
        ]);
    }
}