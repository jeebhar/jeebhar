<?php

declare(strict_types=1);

namespace Jeebhar;

/** An error that maps directly onto an HTTP status and the API's error envelope. */
final class HttpError extends \RuntimeException
{
    public int $status;

    /** @var array<int, array{field: string, message: string}> */
    public array $details;

    /** @param array<int, array{field: string, message: string}> $details */
    public function __construct(int $status, string $message, array $details = [])
    {
        parent::__construct($message);
        $this->status = $status;
        $this->details = $details;
    }
}
