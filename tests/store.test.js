import test from 'node:test';
import assert from 'node:assert/strict';
import { FirebaseStore, friendlyError } from '../store.js';

const denied = () => Object.assign(new Error('PERMISSION_DENIED'), { code: 'PERMISSION_DENIED' });

function table({ legacy = false } = {}) {
  const values = new Map(), calls = [], statuses = [], presenceStatuses = [];
  const store = new FirebaseStore((...args) => statuses.push(args), error => presenceStatuses.push(error));
  store.uid = 'player-a'; store.clientId = 'client-a'; store.online = true;
  store.sdk = {
    ref: (_, path) => path,
    onDisconnect: reference => ({ remove: async () => {
      calls.push('cleanup');
      if (legacy && !values.has(reference)) throw denied();
    } }),
    set: async (reference, value) => { calls.push('write'); values.set(reference, value); },
    remove: async reference => { calls.push('remove'); values.delete(reference); },
    serverTimestamp: () => 100,
  };
  return { store, values, calls, statuses, presenceStatuses };
}

test('current rules register disconnect cleanup before publishing a player', async () => {
  const { store, calls, values, presenceStatuses } = table();
  await store.setPresence('the-prophets', 'Jack Robbins', 'jack');
  assert.deepEqual(calls, ['cleanup', 'write']);
  assert.equal(values.get(store.presenceRef).characterId, 'jack');
  assert.equal(presenceStatuses.at(-1), null);
});

test('earlier rules create an owned entry and retry cleanup without a false access warning', async () => {
  const { store, calls, values, statuses, presenceStatuses } = table({ legacy: true });
  await store.setPresence('the-prophets', 'Jack Robbins', 'jack');
  assert.deepEqual(calls, ['cleanup', 'write', 'cleanup']);
  assert.equal(values.get(store.presenceRef).uid, 'player-a');
  assert.equal(presenceStatuses.every(error => error === null), true);
  assert.deepEqual(statuses, []);
  assert.equal(store.online, true);
});

test('a denied player write affects player indicators and clears after a successful retry', async () => {
  const { store, values, statuses, presenceStatuses } = table();
  const publish = store.sdk.set;
  const failure = denied();
  store.sdk.set = async () => { throw failure; };
  await store.setPresence('the-prophets', 'Jack Robbins', 'jack');
  assert.equal(presenceStatuses.at(-1), failure);
  assert.equal(values.size, 0);
  assert.equal(store.online, true);
  assert.deepEqual(statuses, []);
  store.sdk.set = publish;
  assert.equal(await store.writePresence(), true);
  assert.equal(presenceStatuses.at(-1), null);
  assert.equal(values.get(store.presenceRef).name, 'Jack Robbins');
});

test('a temporary presence entry is removed if disconnect cleanup still fails', async () => {
  const { store, values, presenceStatuses } = table();
  store.sdk.onDisconnect = () => ({ remove: async () => { throw denied(); } });
  await store.setPresence('the-prophets', 'Jack Robbins', 'jack');
  assert.equal(values.size, 0);
  assert.equal(presenceStatuses.at(-1).code, 'PERMISSION_DENIED');
});

test('leaving during a pending connection cannot publish the old seat afterward', async () => {
  const { store, values } = table();
  let release, started;
  const ready = new Promise(resolve => { started = resolve; });
  const pending = new Promise(resolve => { release = resolve; });
  store.sdk.onDisconnect = () => ({ remove: async () => { started(); await pending; } });
  const joining = store.setPresence('the-prophets', 'Jack Robbins', 'jack');
  await ready;
  await store.leave();
  release();
  await joining;
  assert.equal(values.size, 0);
  assert.equal(store.presenceRef, null);
});

test('failed seat cleanup does not prevent leaving the Circle', async () => {
  const { store, presenceStatuses } = table();
  await store.setPresence('the-prophets', 'Jack Robbins', 'jack');
  store.sdk.remove = async () => { throw denied(); };
  await assert.doesNotReject(store.leave());
  assert.equal(store.presenceRef, null);
  assert.equal(presenceStatuses.at(-1).code, 'PERMISSION_DENIED');
});

test('real Circle permission failures keep a visible access error', () => {
  assert.match(friendlyError(denied()), /Firebase denied access to this Circle/);
});
