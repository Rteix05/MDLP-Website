<?php

namespace App\Analytics;

use App\Repository\PageViewRepository;
use Doctrine\DBAL\Connection;

/**
 * Chiffres de la page « Statistiques » du back-office (même principe que l'Académie E.S.I.C.) :
 * fréquentation, inscriptions, dons et rendez-vous sur une période, comparés à la période précédente
 * de même durée.
 */
final class SiteStatistics
{
    /** Périodes proposées (en jours) */
    public const PERIODS = [7, 30, 90, 365];

    private const DAY_NAMES = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    private const MONTH_NAMES = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

    /** Pages du site nommées en clair */
    private const PAGE_TITLES = [
        '/'                             => 'Accueil',
        '/biographie'                   => 'Biographie',
        '/live'                         => 'Direct',
        '/planning'                     => 'Calendrier',
        '/don'                          => 'Faire un don',
        '/don/merci'                    => 'Don : remerciement',
        '/don/erreur'                   => 'Don : erreur',
        '/rdv'                          => 'Prendre rendez-vous',
        '/contact'                      => 'Contact',
        '/register'                     => 'Inscription',
        '/login'                        => 'Connexion',
        '/forgot-password'              => 'Mot de passe oublié',
        '/reset-password'               => 'Nouveau mot de passe',
        '/dashboard'                    => 'Espace membre',
        '/profil'                       => 'Espace membre : profil',
        '/mentions-legales'             => 'Mentions légales',
        '/cgu'                          => 'CGU',
        '/conditions-des-dons'          => 'Conditions des dons',
        '/politique-de-confidentialite' => 'Politique de confidentialité',
        '/accessibilite'                => 'Accessibilité',
    ];

    public function __construct(
        private readonly PageViewRepository $pageViews,
        private readonly Connection $connection,
    ) {}

    /** @return array<string, mixed> */
    public function forPeriod(int $days, ?\DateTimeImmutable $today = null): array
    {
        $days     = in_array($days, self::PERIODS, true) ? $days : 30;
        $to       = ($today ?? new \DateTimeImmutable('today'))->setTime(0, 0)->modify('+1 day');
        $from     = $to->modify("-$days days");
        $prevFrom = $from->modify("-$days days");

        $traffic     = $this->pageViews->dailyTraffic($from, $to);
        $prevTraffic = $this->pageViews->dailyTraffic($prevFrom, $from);
        $signups     = $this->dailyCount('SELECT DATE(created_at) AS day, COUNT(*) AS n FROM `user` WHERE created_at >= :from AND created_at < :to GROUP BY DATE(created_at)', $from, $to);
        $prevSignups = $this->dailyCount('SELECT DATE(created_at) AS day, COUNT(*) AS n FROM `user` WHERE created_at >= :from AND created_at < :to GROUP BY DATE(created_at)', $prevFrom, $from);
        $donations     = $this->donations($from, $to);
        $prevDonations = $this->donations($prevFrom, $from);

        // Une ligne par jour de la période, y compris les jours sans visite
        $daily = [];
        for ($day = $from; $day < $to; $day = $day->modify('+1 day')) {
            $key = $day->format('Y-m-d');
            $daily[] = [
                'date'     => $key,
                'label'    => self::DAY_NAMES[(int) $day->format('w')] . ' ' . $day->format('j') . ' ' . self::MONTH_NAMES[(int) $day->format('n') - 1],
                'views'    => $traffic[$key]['views'] ?? 0,
                'visitors' => $traffic[$key]['visitors'] ?? 0,
                'signups'  => $signups[$key] ?? 0,
            ];
        }

        $sum   = fn (array $rows, string $field) => array_sum(array_column($rows, $field));
        $chart = $this->chart($daily, $days);

        return [
            'days'    => $days,
            'periods' => self::PERIODS,
            'from'    => $from->format('Y-m-d'),
            'to'      => $to->modify('-1 day')->format('Y-m-d'),
            'kpis'    => [
                'visitors'     => ['value' => $sum($traffic, 'visitors'), 'previous' => $sum($prevTraffic, 'visitors')],
                'views'        => ['value' => $sum($traffic, 'views'), 'previous' => $sum($prevTraffic, 'views')],
                'signups'      => ['value' => array_sum($signups), 'previous' => array_sum($prevSignups)],
                'donations'    => ['value' => $donations['count'], 'previous' => $prevDonations['count']],
                'revenue'      => ['value' => $donations['amount'], 'previous' => $prevDonations['amount']],
                'appointments' => ['value' => $this->appointments($from, $to), 'previous' => $this->appointments($prevFrom, $from)],
            ],
            'chart'    => $chart,
            'chartMax' => max(1, ...array_column($chart, 'views')),
            'pages'    => array_map(fn (array $p) => $p + ['title' => self::PAGE_TITLES[$p['path']] ?? $p['path']], $this->pageViews->topPages($from, $to)),
            'sources'  => $this->pageViews->topSources($from, $to),
            'devices'  => $this->pageViews->devices($from, $to),
        ];
    }

    /**
     * Barres du graphique : par jour jusqu'à un mois, par semaine sur 90 jours, par mois sur un an.
     *
     * @param list<array{date: string, label: string, views: int, visitors: int, signups: int}> $daily
     * @return list<array{label: string, views: int, visitors: int, signups: int}>
     */
    private function chart(array $daily, int $days): array
    {
        if ($days <= 31) {
            return array_map(fn (array $d) => array_diff_key($d, ['date' => true]), $daily);
        }

        $buckets = [];
        foreach ($daily as $d) {
            $date = new \DateTimeImmutable($d['date']);
            if ($days <= 90) {
                $monday = $date->modify('monday this week');
                $key    = $monday->format('Y-m-d');
                $label  = 'sem. du ' . $monday->format('j') . ' ' . self::MONTH_NAMES[(int) $monday->format('n') - 1];
            } else {
                $key   = $date->format('Y-m');
                $label = self::MONTH_NAMES[(int) $date->format('n') - 1] . ' ' . $date->format('Y');
            }
            $buckets[$key] ??= ['label' => $label, 'views' => 0, 'visitors' => 0, 'signups' => 0];
            $buckets[$key]['views']    += $d['views'];
            $buckets[$key]['visitors'] += $d['visitors'];
            $buckets[$key]['signups']  += $d['signups'];
        }

        return array_values($buckets);
    }

    /** @return array<string, int> */
    private function dailyCount(string $sql, \DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $counts = [];
        foreach ($this->connection->fetchAllAssociative($sql, $this->range($from, $to)) as $row) {
            $counts[substr((string) $row['day'], 0, 10)] = (int) $row['n'];
        }

        return $counts;
    }

    /** @return array{count: int, amount: float} */
    private function donations(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $row = $this->connection->fetchAssociative(
            "SELECT COUNT(*) AS n, COALESCE(SUM(amount), 0) AS total FROM payment
              WHERE status = 'COMPLETED' AND date >= :from AND date < :to",
            $this->range($from, $to),
        );

        return ['count' => (int) ($row['n'] ?? 0), 'amount' => round((float) ($row['total'] ?? 0), 2)];
    }

    /** Rendez-vous prévus sur la période (hors refusés) */
    private function appointments(\DateTimeImmutable $from, \DateTimeImmutable $to): int
    {
        return (int) $this->connection->fetchOne(
            "SELECT COUNT(*) FROM appointment WHERE status <> 'CANCELLED' AND date >= :from AND date < :to",
            $this->range($from, $to),
        );
    }

    /** @return array{from: string, to: string} */
    private function range(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        return ['from' => $from->format('Y-m-d H:i:s'), 'to' => $to->format('Y-m-d H:i:s')];
    }
}
