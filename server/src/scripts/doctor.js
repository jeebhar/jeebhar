import mongoose from 'mongoose';

import { env, isMailConfigured, isPlaceholderMailHost } from '../config/env.js';
import { ContentService } from '../services/content.service.js';
import { defaultContent } from '../seed/default-content.js';
import { siteContentRepository } from '../repositories/site-content.repository.js';

/*
 * Connects with mongoose directly rather than through config/database.js: that
 * module attaches error listeners that dump the driver's full error object, which
 * buries the one line a person actually needs.
 */

/**
 * `npm run doctor` — answers "why is my content not loading?" in one command.
 *
 * Checks configuration, the database connection and the shape of the stored
 * content document, then prints what to do about anything it finds. Read-only:
 * it never writes to the database.
 */

const ok = (message) => console.info(`  ok    ${message}`);
const warn = (message) => console.warn(`  warn  ${message}`);
const bad = (message) => console.error(`  FAIL  ${message}`);

const problems = [];
const fail = (message, fix) => {
  bad(message);
  problems.push(fix);
};

const checkConfig = () => {
  console.info('\nConfiguration (server/.env)');

  if (env.mongoUri) {
    // Show the host only — never the credentials.
    let where = 'unparseable';
    try {
      where = new URL(env.mongoUri.replace(/^mongodb\+srv:/, 'https:')).host;
    } catch {
      /* leave as unparseable */
    }
    ok(`MONGODB_URI set (host: ${where})`);
  } else {
    fail('MONGODB_URI is not set', 'Set MONGODB_URI in server/.env.');
  }

  if (!env.adminToken) {
    fail(
      'ADMIN_TOKEN is not set',
      'Set ADMIN_TOKEN in server/.env — the server will not boot without it.'
    );
  } else if (env.adminToken.length < 24) {
    warn(`ADMIN_TOKEN is only ${env.adminToken.length} characters (24+ required in production)`);
  } else {
    ok('ADMIN_TOKEN set');
  }

  ok(`CLIENT_ORIGIN: ${env.corsOrigins.join(', ')}`);
  ok(`PORT: ${env.port}`);

  if (isPlaceholderMailHost()) {
    bad(`SMTP_HOST is still the example placeholder "${env.mail.host}"`);
    problems.push(
      `SMTP_HOST is "${env.mail.host}", which does not exist — so the contact form stores ` +
        'enquiries but silently sends nothing. For Gmail set SMTP_HOST=smtp.gmail.com with a ' +
        '16-character app password as SMTP_PASS, then check it with `npm run mail:test`.'
    );
  } else if (isMailConfigured()) {
    ok(`SMTP configured (${env.mail.host}:${env.mail.port} -> ${env.mail.to})`);
    problems.push('Confirm delivery actually works with `npm run mail:test`.');
  } else {
    warn('SMTP not fully configured — enquiries are stored but no email is sent');
  }
};

/**
 * Compares what the running server returns against what this code would return.
 *
 * A dev server started before a code change can keep serving the old behaviour:
 * Node's `--watch` does not reliably fire for files written by another process or
 * over a network/VM mount. The symptom is baffling — correct code on disk, stale
 * responses in the browser — so it is worth detecting explicitly.
 */
const checkRunningServer = async () => {
  console.info('\nRunning server');

  const url = `http://127.0.0.1:${env.port}/api/content`;
  let response;

  try {
    response = await fetch(url, { signal: AbortSignal.timeout(4000) });
  } catch {
    warn(`nothing responding on port ${env.port} — the API does not appear to be running`);
    console.info('        (that is fine if you have not started it; run `npm run dev`)');
    return;
  }

  const body = await response.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    bad(`${url} did not return JSON`);
    return;
  }

  // The current code always wraps responses in { ok, data }.
  if (body.ok === undefined) {
    bad('the response has no "ok" envelope — the running server predates the current code');
    problems.push('Stop and restart the API so it picks up the current code.');
    return;
  }

  const served = body.data ?? {};
  ok(`responding on port ${env.port}`);

  const staleSignals = [];
  if (!Array.isArray(served.travelReels)) staleSignals.push('travelReels missing');
  if (!served.mediaKitUrl) staleSignals.push('mediaKitUrl missing');

  if (staleSignals.length > 0) {
    bad(`the response is missing fields this code always fills in: ${staleSignals.join(', ')}`);
    problems.push(
      'The running API is out of date — it is serving responses this code no longer produces. ' +
        "Stop it (Ctrl+C) and run `npm run dev` again. Node's --watch does not always notice " +
        'files changed by another process.'
    );
  } else {
    ok('response shape matches the current code');
  }

  ok(
    `serving ${served.work?.length ?? 0} work items, ${served.reels?.length ?? 0} reels, ` +
      `${served.travelReels?.length ?? 0} travel reels`
  );

  const expected = ContentService.complete(defaultContent);
  if ((served.work?.length ?? 0) !== expected.work.length) {
    warn(
      `defaults define ${expected.work.length} work items but the API is serving ` +
        `${served.work?.length ?? 0} — the stored content is from an older version`
    );
  }
};

const checkDatabase = async () => {
  console.info('\nDatabase');

  if (!env.mongoUri) {
    bad('skipped — no MONGODB_URI');
    return false;
  }

  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
    ok(`connected to "${mongoose.connection.name}"`);
    return true;
  } catch (error) {
    const reason = String(error.message).split('\n')[0];
    bad(`could not connect: ${reason}`);

    if (/Authentication failed|bad auth/i.test(reason)) {
      problems.push(
        'MongoDB rejected the credentials in MONGODB_URI. If you rotated the database password, ' +
          'update server/.env to match.'
      );
    } else if (/ECONNREFUSED/i.test(reason)) {
      problems.push(
        'Nothing is listening at that address. Start MongoDB locally, or point MONGODB_URI at your Atlas cluster.'
      );
    } else {
      problems.push(
        "Check the MONGODB_URI host and credentials, and that this machine's IP is allowlisted in " +
          'MongoDB Atlas under Network Access.'
      );
    }
    return false;
  }
};

const checkContent = async () => {
  console.info('\nContent document');

  const stored = await siteContentRepository.findSingleton();

  if (!stored) {
    warn('no content document yet — it will be seeded on the first GET /api/content');
    problems.push('Run `npm run seed` to seed content now (optional — the API seeds itself).');
    return;
  }

  ok('content document found');

  // Fields the frontend needs. The API fills these in on read, but a stored
  // document that predates them still holds the old copy.
  const expectedCollections = ['services', 'work', 'reels', 'travelReels', 'mediaKitMetrics'];
  const missing = expectedCollections.filter((field) => !Array.isArray(stored[field]));

  expectedCollections.forEach((field) => {
    if (Array.isArray(stored[field])) {
      ok(`${field}: ${stored[field].length} item(s)`);
    } else {
      warn(`${field}: missing from the stored document`);
    }
  });

  ['heroEyebrow', 'mediaKitUrl'].forEach((field) => {
    if (stored[field] === undefined) {
      warn(`${field}: missing from the stored document`);
      missing.push(field);
    }
  });

  if (missing.length > 0) {
    problems.push(
      `The stored document predates these fields: ${missing.join(', ')}. ` +
        'The API fills them in on read, so the site works — but the content itself is from an older version. ' +
        'Run `npm run seed -- --force` to replace it with the current default content.'
    );
  }

  // Is the stored content still the old sample data?
  const storedWorkTitles = (stored.work ?? []).map((item) => item.title);
  const currentWorkTitles = defaultContent.work.map((item) => item.title);
  const overlap = storedWorkTitles.filter((title) => currentWorkTitles.includes(title));

  if (storedWorkTitles.length > 0 && overlap.length === 0) {
    warn(`work titles do not match the current defaults (stored: ${storedWorkTitles.join(', ')})`);
    problems.push(
      'The stored work items are from an earlier version. Run `npm run seed -- --force` to load the ' +
        'current cuisine cards, or edit them at /#/admin.'
    );
  }

  if (!Array.isArray(stored.travelReels) || stored.travelReels.length === 0) {
    problems.push('No travel reels stored. `npm run seed -- --force` loads them.');
  }
};

const run = async () => {
  console.info('Jeebhar doctor');
  console.info('==============');

  checkConfig();

  const connected = await checkDatabase();
  if (connected) {
    await checkContent();
    await mongoose.connection.close();
  }

  await checkRunningServer();

  console.info('\n--------------------------------------------------');
  if (problems.length === 0) {
    console.info('No problems found. Start the app with `npm run dev` from the repo root.');
    return;
  }

  console.info(`${problems.length} thing(s) to do:\n`);
  // De-duplicate: several checks can suggest the same fix.
  [...new Set(problems)].forEach((fix, index) => console.info(`  ${index + 1}. ${fix}`));
  console.info('');
};

run().catch(async (error) => {
  bad(`doctor itself failed: ${error.message}`);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
