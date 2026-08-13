import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ContactService } from '../src/services/contact.service.js';

/**
 * The service is constructed with its collaborators, so these tests need no
 * database and no SMTP server — that is the point of the injection.
 */

const fakeRepository = (overrides = {}) => ({
  created: [],
  notifiedIds: [],
  async create(payload) {
    const record = { _id: 'sub-1', ...payload };
    this.created.push(record);
    return record;
  },
  async markNotified(id) {
    this.notifiedIds.push(id);
    return { _id: id, notified: true };
  },
  ...overrides,
});

const input = {
  name: 'Asha Rao',
  email: 'asha@example.com',
  phone: '+91 90000 00000',
  subject: 'Campaign enquiry',
  body: 'We would like help launching our new outlet.',
};

describe('ContactService', () => {
  it('persists the submission and reports a successful notification', async () => {
    const repository = fakeRepository();
    const sent = [];
    const mailer = {
      async send(message) {
        sent.push(message);
        return true;
      },
    };

    const result = await new ContactService(repository, mailer).submit(input, {
      sourceIp: '203.0.113.5',
    });

    assert.equal(result.id, 'sub-1');
    assert.equal(result.notified, true);
    assert.equal(repository.created.length, 1);
    assert.equal(repository.created[0].sourceIp, '203.0.113.5');
    assert.deepEqual(repository.notifiedIds, ['sub-1']);
    assert.match(sent[0].subject, /Campaign enquiry/);
    assert.match(sent[0].text, /asha@example\.com/);
  });

  it('still succeeds when the mailer throws, so the user is not punished for SMTP', async () => {
    const repository = fakeRepository();
    const mailer = {
      async send() {
        throw new Error('SMTP unreachable');
      },
    };

    const result = await new ContactService(repository, mailer).submit(input);

    assert.equal(result.notified, false);
    assert.equal(repository.created.length, 1);
    assert.deepEqual(repository.notifiedIds, []);
  });

  it('does not mark the record notified when the mailer is a no-op', async () => {
    const repository = fakeRepository();
    const mailer = {
      async send() {
        return false;
      },
    };

    const result = await new ContactService(repository, mailer).submit(input);

    assert.equal(result.notified, false);
    assert.deepEqual(repository.notifiedIds, []);
  });

  it('builds a notification containing every submitted field', () => {
    const message = ContactService.buildNotification({ ...input });

    for (const value of Object.values(input)) {
      assert.ok(message.text.includes(value), `expected notification to include "${value}"`);
    }
  });
});
