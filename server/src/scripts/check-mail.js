import nodemailer from 'nodemailer';

import { env, isPlaceholderMailHost } from '../config/env.js';

/**
 * `npm run mail:test` — sends one real email using server/.env and reports
 * exactly what happened.
 *
 * The contact form deliberately does not fail when SMTP does: an enquiry is
 * stored first and notified second, so a visitor is never punished for a mail
 * outage. The cost is that a broken SMTP config looks like success in the
 * browser. This script is the way to check delivery directly.
 */

const line = (label, value) => console.info(`  ${label.padEnd(12)} ${value}`);

const run = async () => {
  console.info('Jeebhar mail test');
  console.info('=================\n');

  const missing = ['host', 'user', 'pass', 'to', 'from'].filter((key) => !env.mail[key]);

  if (missing.length > 0) {
    console.error(
      `Not configured. Set these in server/.env: ${missing.map((k) => `SMTP_${k.toUpperCase()}`).join(', ')}`
    );
    console.error('(MAIL_TO and MAIL_FROM rather than SMTP_TO / SMTP_FROM.)');
    process.exit(1);
  }

  line('host', `${env.mail.host}:${env.mail.port}`);
  line('user', env.mail.user);
  line('from', env.mail.from);
  line('to', env.mail.to);
  line('secure', env.mail.port === 465 ? 'yes (implicit TLS)' : 'no (STARTTLS)');
  console.info('');

  if (isPlaceholderMailHost()) {
    console.error(`SMTP_HOST is still the example placeholder "${env.mail.host}".`);
    console.error('No such server exists, so nothing can be delivered.');
    console.error('');
    console.error('For a Gmail account use:');
    console.error('    SMTP_HOST=smtp.gmail.com');
    console.error('    SMTP_PORT=587');
    console.error('    SMTP_USER=<your gmail address>');
    console.error('    SMTP_PASS=<16-character app password, not your login password>');
    console.error('');
    console.error('App passwords: https://myaccount.google.com/apppasswords');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465,
    auth: { user: env.mail.user, pass: env.mail.pass },
  });

  try {
    console.info('Verifying the connection…');
    await transporter.verify();
    console.info('  connection and credentials accepted\n');

    console.info('Sending a test message…');
    const info = await transporter.sendMail({
      from: env.mail.from,
      to: env.mail.to,
      subject: 'Jeebhar test email',
      text: [
        'This is a test from `npm run mail:test`.',
        '',
        'If you are reading this, the contact form will deliver enquiries to this address.',
        '',
        `Host: ${env.mail.host}:${env.mail.port}`,
        `Sent: ${new Date().toISOString()}`,
      ].join('\n'),
    });

    console.info(`  accepted for: ${(info.accepted ?? []).join(', ') || '(none)'}`);
    if ((info.rejected ?? []).length > 0) {
      console.warn(`  rejected:     ${info.rejected.join(', ')}`);
    }
    console.info(`  message id:   ${info.messageId}`);
    console.info(`\nSent. Check ${env.mail.to} (including the spam folder).`);
  } catch (error) {
    console.error(`\nFAILED: ${error.message}`);

    const text = String(error.message);
    if (/Invalid login|Username and Password not accepted|535/i.test(text)) {
      console.error('\nThe server rejected the credentials. For Gmail this almost always means');
      console.error('SMTP_PASS is a normal account password — it must be a 16-character app');
      console.error('password: https://myaccount.google.com/apppasswords');
    } else if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(text)) {
      console.error(`\nThe hostname "${env.mail.host}" could not be resolved. Check SMTP_HOST.`);
    } else if (/ETIMEDOUT|ECONNREFUSED/i.test(text)) {
      console.error(`\nCould not reach ${env.mail.host}:${env.mail.port}. A firewall may be`);
      console.error('blocking outbound SMTP, or the port is wrong (587 STARTTLS / 465 TLS).');
    } else if (/self signed|certificate/i.test(text)) {
      console.error('\nTLS certificate problem — check the host name matches the certificate.');
    }

    process.exit(1);
  }
};

run();
