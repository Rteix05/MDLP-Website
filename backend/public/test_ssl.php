<?php
echo "<h1>Diagnostic SSL PHP</h1>";

// 1. Vérifier où PHP cherche le certificat
$certFile = ini_get('curl.cainfo');
echo "<p><strong>Chemin curl.cainfo :</strong> " . ($certFile ? $certFile : "NON DÉFINI ❌") . "</p>";

if ($certFile && file_exists($certFile)) {
    echo "<p style='color:green'>✅ Le fichier existe bien à cet endroit.</p>";
} else {
    echo "<p style='color:red'>❌ Le fichier est introuvable ! Vérifie le chemin dans php.ini.</p>";
}

// 2. Tester la connexion vers Stripe
echo "<hr><h3>Test de connexion vers Stripe...</h3>";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.stripe.com/v1/charges");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// On ne met pas de clés, on veut juste voir si la connexion SSL se fait (même si Stripe renvoie 401 Unauthorized)
$result = curl_exec($ch);
$error = curl_error($ch);
$errno = curl_errno($ch);
curl_close($ch);

if ($errno) {
    echo "<p style='color:red; font-weight:bold'>ÉCHEC : " . $error . " (Code: $errno)</p>";
    if ($errno == 60) {
        echo "<p>👉 C'est bien un problème de certificat SSL.</p>";
    }
} else {
    echo "<p style='color:green; font-weight:bold'>SUCCÈS : La connexion SSL fonctionne ! 🎉</p>";
    echo "<p>Si tu as une erreur 500 sur ton site, c'est une erreur de code (Clé API invalide, code PHP), pas de certificat.</p>";
}