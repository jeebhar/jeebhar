<?php

declare(strict_types=1);

namespace Jeebhar;

/** Character count of a UTF-8 string. Only loaded when mbstring is missing. */
function mb_strlen(string $value): int
{
    $count = preg_match_all('/./su', $value);
    return $count === false ? strlen($value) : $count;
}
