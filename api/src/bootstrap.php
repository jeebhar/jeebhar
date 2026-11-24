<?php

declare(strict_types=1);

/**
 * Minimal PSR-4 style autoloader: Jeebhar\Foo → src/Foo.php.
 * No Composer needed, so the API runs on any shared host with plain PHP 8.
 */
spl_autoload_register(static function (string $class): void {
    $prefix = 'Jeebhar\\';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }
    $file = __DIR__ . '/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_file($file)) {
        require $file;
    }
});

// Never leak warnings into a JSON response; they go to the PHP error log.
ini_set('display_errors', '0');
error_reporting(E_ALL);

/**
 * mb_strlen() without the mbstring extension.
 *
 * mbstring is switched off in a fresh Windows PHP install (and on some hosts),
 * and the API only needs it to count characters. Defined in the Jeebhar
 * namespace, so it is used ONLY when the real global function is missing —
 * PHP resolves Jeebhar\mb_strlen() first, then falls back to \mb_strlen().
 */
if (!function_exists('mb_strlen')) {
    require __DIR__ . '/polyfills.php';
}

