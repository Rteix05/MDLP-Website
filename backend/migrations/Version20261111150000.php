<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Version 1.1 :
 * - mesure d'audience interne (table page_view, sans donnée personnelle) ;
 * - date d'inscription des utilisateurs (statistiques) ;
 * - suppression de la table pastor (API Pasteurs inutilisée, retirée).
 */
final class Version20261111150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return "Statistiques du site (page_view, user.created_at) et suppression de la table pastor";
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE page_view (id INT AUTO_INCREMENT NOT NULL, viewed_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', path VARCHAR(255) NOT NULL, visitor_hash VARCHAR(16) NOT NULL, referrer_host VARCHAR(100) DEFAULT NULL, device VARCHAR(12) NOT NULL, entry TINYINT(1) NOT NULL, INDEX idx_page_view_viewed_at (viewed_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE `user` ADD created_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('DROP TABLE IF EXISTS pastor');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE page_view');
        $this->addSql('ALTER TABLE `user` DROP created_at');
        $this->addSql('CREATE TABLE pastor (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, role VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, image_url VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }
}
