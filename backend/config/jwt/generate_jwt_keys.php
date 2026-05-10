<?php
// Génère une paire RSA 4096 bits et écrit private.pem/public.pem
$config = [
    "private_key_type" => OPENSSL_KEYTYPE_RSA,
    "private_key_bits" => 4096,
];

$res = openssl_pkey_new($config);
if ($res === false) {
    fwrite(STDERR, "Failed to generate key: " . openssl_error_string() . PHP_EOL);
    exit(1);
}

if (!openssl_pkey_export($res, $privateKey)) {
    fwrite(STDERR, "Failed to export private key\n");
    exit(1);
}

$details = openssl_pkey_get_details($res);
if ($details === false || !isset($details['key'])) {
    fwrite(STDERR, "Failed to get public key details\n");
    exit(1);
}
$publicKey = $details['key'];

file_put_contents('private.pem', $privateKey);
file_put_contents('public.pem', $publicKey);

echo "Generated private.pem and public.pem\n";
