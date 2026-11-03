<?php

declare(strict_types=1);

namespace Jeebhar;

/**
 * The contact form: validate → store → email.
 *
 * Storing comes first on purpose. If the mail server is down the enquiry is
 * still saved in enquiries.jsonl (outside public_html), so no lead is ever lost.
 * The visitor sees success either way; `notified` says whether the email left.
 */
final class ContactService
{
    private const RULES = [
        'name' => [2, 120, 'Please enter your name.'],
        'email' => [3, 254, 'Please enter a valid email address.'],
        'phone' => [7, 40, 'Please enter a valid phone number.'],
        'subject' => [3, 200, 'Please enter a subject of at least 3 characters.'],
        'body' => [10, 5000, 'Please write a message of at least 10 characters.'],
    ];

    private Config $config;

    private Mailer $mailer;

    public function __construct(Config $config, Mailer $mailer)
    {
        $this->config = $config;
        $this->mailer = $mailer;
    }

    /**
     * @param array<string, mixed> $input
     * @return array{id: string, notified: bool}
     */
    public function submit(array $input, string $ip): array
    {
        $enquiry = $this->validate($input);
        $enquiry['id'] = date('Ymd-His') . '-' . bin2hex(random_bytes(3));
        $enquiry['receivedAt'] = date(DATE_ATOM);
        $enquiry['ip'] = $ip;
        $enquiry['site'] = (string) ($_SERVER['HTTP_HOST'] ?? '');

        $this->store($enquiry);

        $notified = false;
        try {
            $this->mailer->send(
                $this->config->string('mail.to'),
                'New enquiry: ' . $enquiry['subject'],
                $this->emailBody($enquiry),
                $enquiry['email'],
                $enquiry['name']
            );
            $notified = true;
        } catch (\Throwable $error) {
            error_log('[jeebhar] contact mail failed: ' . $error->getMessage());
        }

        return ['id' => $enquiry['id'], 'notified' => $notified];
    }

    /**
     * Mirrors client/src/features/contact/contact.validator.ts.
     *
     * @param array<string, mixed> $input
     * @return array<string, string>
     */
    private function validate(array $input): array
    {
        $clean = [];
        $errors = [];

        foreach (self::RULES as $field => [$min, $max, $message]) {
            $value = is_scalar($input[$field] ?? null) ? trim((string) $input[$field]) : '';
            $length = mb_strlen($value);
            $valid = $length >= $min && $length <= $max;

            if ($field === 'email') {
                $value = strtolower($value);
                $valid = $valid && filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
            }
            if ($field === 'phone') {
                $valid = $valid && preg_match('/^[\d\s()+-]+$/', $value) === 1;
            }
            // Header-injection guard: single-line fields may not contain line breaks.
            if ($field !== 'body' && preg_match('/[\r\n]/', $value) === 1) {
                $valid = false;
            }

            if (!$valid) {
                $errors[] = ['field' => $field, 'message' => $message];
            }
            $clean[$field] = $value;
        }

        if ($errors !== []) {
            throw new HttpError(400, 'Please correct the highlighted fields.', $errors);
        }
        return $clean;
    }

    /** @param array<string, string> $enquiry */
    private function store(array $enquiry): void
    {
        $dir = $this->config->dataDir();
        if (!is_dir($dir)) {
            @mkdir($dir, 0700, true);
        }
        $line = json_encode($enquiry, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
        if (@file_put_contents($dir . '/enquiries.jsonl', $line, FILE_APPEND | LOCK_EX) === false) {
            // Not fatal: the email below is still attempted.
            error_log('[jeebhar] could not store enquiry ' . $enquiry['id']);
        }
    }

    /** @param array<string, string> $enquiry */
    private function emailBody(array $enquiry): string
    {
        return implode("\n", [
            'You have a new enquiry from the Jeebhar website.',
            '',
            'Name:     ' . $enquiry['name'],
            'Email:    ' . $enquiry['email'],
            'Phone:    ' . $enquiry['phone'],
            'Subject:  ' . $enquiry['subject'],
            '',
            'Message:',
            $enquiry['body'],
            '',
            '---',
            'Received: ' . $enquiry['receivedAt'],
            'Website:  ' . $enquiry['site'],
            'IP:       ' . $enquiry['ip'],
            'Ref:      ' . $enquiry['id'],
            '',
            'Reply to this email to answer ' . $enquiry['name'] . ' directly.',
        ]);
    }
}
