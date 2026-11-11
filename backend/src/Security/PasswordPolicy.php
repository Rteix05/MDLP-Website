<?php

namespace App\Security;

/**
 * Règles de mot de passe communes à l'inscription, à la réinitialisation et au changement depuis le profil.
 */
final class PasswordPolicy
{
    /** Renvoie le message d'erreur à afficher, ou null si le mot de passe est valide. */
    public static function validate(mixed $password): ?string
    {
        if (!is_string($password) || strlen($password) < 8) {
            return 'Le mot de passe doit contenir au moins 8 caractères';
        }
        if (strlen($password) > 4096) {
            return 'Le mot de passe est trop long';
        }
        if (!preg_match('/[A-Z]/', $password)) {
            return 'Le mot de passe doit contenir au moins une majuscule';
        }
        if (!preg_match('/[a-z]/', $password)) {
            return 'Le mot de passe doit contenir au moins une minuscule';
        }
        if (!preg_match('/[0-9]/', $password)) {
            return 'Le mot de passe doit contenir au moins un chiffre';
        }

        return null;
    }
}
