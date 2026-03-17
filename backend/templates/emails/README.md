# Personnalisation des emails

## Fichiers CSS des emails

Pour modifier le style des emails, éditez le fichier :
📁 `backend/templates/emails/base.html.twig`

Ce fichier contient le template de base avec tout le CSS inline nécessaire pour les emails.

### Structure CSS

Le CSS est organisé en sections :

1. **Reset** - Réinitialisation des styles par défaut
2. **Container** - Conteneur principal de l'email
3. **Header** - En-tête avec dégradé violet/violet
4. **Body** - Corps du message
5. **Button** - Boutons d'action
6. **Info Box** - Boîtes d'information avec bordure colorée
7. **Footer** - Pied de page
8. **Responsive** - Adaptations mobile

### Personnalisation rapide

#### Changer les couleurs principales

```css
/* Couleur du dégradé de l'en-tête */
.email-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Couleur du bouton */
.email-button {
    background-color: #667eea;
}

/* Couleur de la bordure info-box */
.info-box {
    border-left: 4px solid #667eea;
}
```

#### Modifier la police

```css
body {
    font-family: 'Arial', 'Helvetica', sans-serif;
}
```

## Templates disponibles

### 1. Confirmation de rendez-vous
📁 `backend/templates/emails/appointment_confirmation.html.twig`

Variables disponibles :
- `firstname` - Prénom de l'utilisateur
- `lastname` - Nom de l'utilisateur
- `motif` - Motif du rendez-vous
- `date` - Date du rendez-vous
- `hour` - Heure du rendez-vous (optionnel)

### 2. Réinitialisation de mot de passe
📁 `backend/templates/emails/reset_password.html.twig`

Variables disponibles :
- `resetLink` - Lien de réinitialisation

## Créer un nouveau template

1. Créez un nouveau fichier dans `backend/templates/emails/`
2. Étendez le template de base :

```twig
{% extends 'emails/base.html.twig' %}

{% block title %}Titre de l'email{% endblock %}

{% block header %}En-tête de l'email{% endblock %}

{% block content %}
    <p>Contenu de votre email...</p>
{% endblock %}
```

3. Utilisez-le dans votre contrôleur :

```php
$emailService->sendTemplatedEmail(
    'destinataire@example.com',
    'Sujet de l\'email',
    'emails/mon_template.html.twig',
    ['variable1' => 'valeur1', 'variable2' => 'valeur2']
);
```

## Bonnes pratiques pour les emails

1. **Utilisez du CSS inline** - Les clients email ne supportent pas toujours les balises `<style>`
2. **Évitez les images externes** - Utilisez des couleurs et du texte
3. **Testez la compatibilité** - Testez sur différents clients (Gmail, Outlook, etc.)
4. **Restez simple** - Évitez les animations et JavaScript
5. **Responsive** - Assurez-vous que l'email s'affiche bien sur mobile

## Tester les emails en local

Les emails sont envoyés via le service configuré dans `.env` (MAILER_DSN).

Pour tester sans envoyer de vrais emails, vous pouvez utiliser :
- [Mailtrap](https://mailtrap.io/)
- [MailHog](https://github.com/mailhog/MailHog)
- `symfony/messenger` en mode async
