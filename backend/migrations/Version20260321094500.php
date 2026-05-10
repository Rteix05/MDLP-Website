<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260321094500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create blacklist_jwt table for token blacklist';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE blacklist_jwt (id INT AUTO_INCREMENT NOT NULL, token VARCHAR(512) NOT NULL, expires_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)", UNIQUE INDEX UNIQ_BLACKLIST_TOKEN (token), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE blacklist_jwt');
    }
}
