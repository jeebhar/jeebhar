<?php

declare(strict_types=1);

namespace Jeebhar;

/**
 * Sends plain-text email, either through an SMTP server or PHP's mail().
 *
 *   mail.transport = "smtp"  → authenticated SMTP (Gmail app password, Bluehost
 *                              mailbox, …). Most reliable delivery.
 *   mail.transport = "mail"  → PHP mail() via the host's sendmail. Works on
 *                              Bluehost with zero setup, but use a From address
 *                              on your own domain or it may land in spam.
 *
 * A tiny SMTP client is built in so the API needs no Composer packages.
 */
final class Mailer
{
    private Config $config;

    private function __construct(Config $config)
    {
        $this->config = $config;
    }

    public static function fromConfig(Config $config): self
    {
        return new self($config);
    }

    public function send(string $to, string $subject, string $text, string $replyToEmail, string $replyToName): void
    {
        if ($to === '') {
            throw new \RuntimeException('mail.to is not configured');
        }

        $from = $this->config->string('mail.from', $to);
        $fromName = $this->config->string('mail.fromName', 'Jeebhar Website');

        $headers = [
            'Date' => date(DATE_RFC2822),
            'From' => self::address($from, $fromName),
            'Reply-To' => self::address($replyToEmail, $replyToName),
            'Message-ID' => sprintf('<%s@%s>', bin2hex(random_bytes(8)), substr(strrchr($from, '@') ?: '@jeebhar.com', 1)),
            'MIME-Version' => '1.0',
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Transfer-Encoding' => 'base64',
        ];
        $encodedSubject = self::encodeHeader($subject);
        $body = chunk_split(base64_encode($text), 76, "\r\n");

        if ($this->config->string('mail.transport', 'mail') === 'smtp') {
            $this->sendSmtp($from, $to, ['To' => $to, 'Subject' => $encodedSubject] + $headers, $body);
            return;
        }

        $headerLines = '';
        foreach ($headers as $name => $value) {
            $headerLines .= "$name: $value\r\n";
        }
        if (!mail($to, $encodedSubject, $body, rtrim($headerLines), '-f' . $from)) {
            throw new \RuntimeException('mail() returned false');
        }
    }

    /** @param array<string, string> $headers */
    private function sendSmtp(string $from, string $to, array $headers, string $body): void
    {
        $host = $this->config->string('mail.smtp.host');
        $port = $this->config->int('mail.smtp.port', 587);
        // "tls" = STARTTLS on 587, "ssl" = implicit TLS on 465.
        $secure = $this->config->string('mail.smtp.secure', $port === 465 ? 'ssl' : 'tls');

        $socket = @stream_socket_client(
            ($secure === 'ssl' ? 'ssl://' : 'tcp://') . "$host:$port",
            $errno,
            $errstr,
            15
        );
        if ($socket === false) {
            throw new \RuntimeException("SMTP connect to $host:$port failed: $errstr");
        }
        stream_set_timeout($socket, 15);

        try {
            $this->expect($socket, 220);
            $hostname = gethostname() ?: 'localhost';
            $this->command($socket, "EHLO $hostname", 250);

            if ($secure === 'tls') {
                $this->command($socket, 'STARTTLS', 220);
                if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    throw new \RuntimeException('STARTTLS negotiation failed');
                }
                $this->command($socket, "EHLO $hostname", 250);
            }

            $user = $this->config->string('mail.smtp.user');
            if ($user !== '') {
                $this->command($socket, 'AUTH LOGIN', 334);
                $this->command($socket, base64_encode($user), 334);
                $this->command($socket, base64_encode((string) $this->config->get('mail.smtp.pass', '')), 235);
            }

            $this->command($socket, "MAIL FROM:<$from>", 250);
            $this->command($socket, "RCPT TO:<$to>", [250, 251]);
            $this->command($socket, 'DATA', 354);

            $message = '';
            foreach ($headers as $name => $value) {
                $message .= "$name: $value\r\n";
            }
            // Body is base64, so no line can start with "." — no dot-stuffing needed.
            $this->command($socket, $message . "\r\n" . $body . "\r\n.", 250);
            $this->command($socket, 'QUIT', 221);
        } finally {
            fclose($socket);
        }
    }

    /**
     * @param resource $socket
     * @param int|array<int> $expected
     */
    private function command($socket, string $line, int|array $expected): void
    {
        fwrite($socket, $line . "\r\n");
        $this->expect($socket, $expected);
    }

    /**
     * @param resource $socket
     * @param int|array<int> $expected
     */
    private function expect($socket, int|array $expected): void
    {
        $reply = '';
        // Multi-line replies use "250-…"; the last line uses "250 …".
        while (($line = fgets($socket, 1024)) !== false) {
            $reply .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') {
                break;
            }
        }
        $code = (int) substr($reply, 0, 3);
        if (!in_array($code, (array) $expected, true)) {
            throw new \RuntimeException('SMTP error: ' . trim($reply));
        }
    }

    private static function address(string $email, string $name): string
    {
        $email = preg_replace('/[\r\n<>]/', '', $email) ?? '';
        $name = trim(preg_replace('/[\r\n"]/', '', $name) ?? '');
        return $name === '' ? $email : self::encodeHeader($name) . " <$email>";
    }

    private static function encodeHeader(string $value): string
    {
        $value = preg_replace('/[\r\n]+/', ' ', $value) ?? '';
        return preg_match('/[^\x20-\x7E]/', $value) === 1
            ? '=?UTF-8?B?' . base64_encode($value) . '?='
            : $value;
    }
}
