<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260317000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove duplicate subject column from appointment table (reason is the single source of truth)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE appointment DROP COLUMN subject');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE appointment ADD subject VARCHAR(255) NOT NULL');
    }
}
