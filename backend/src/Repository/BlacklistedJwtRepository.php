<?php

namespace App\Repository;

use App\Entity\BlacklistedJwt;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class BlacklistedJwtRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, BlacklistedJwt::class);
    }

    public function isTokenBlacklisted(string $token): bool
    {
        $qb = $this->createQueryBuilder('b')
            ->select('b')
            ->where('b.token = :token')
            ->andWhere('b.expiresAt > :now')
            ->setParameter('token', $token)
            ->setParameter('now', new \DateTimeImmutable());
        return (bool) $qb->getQuery()->getOneOrNullResult();
    }
}
