import { firebaseConfig } from './firebase-config.js';
import { clone, validateCircle } from './core.js';

const PREFIX = 'candela-obscura-v1:';
const makeId = () => crypto.randomUUID();

export function friendlyError(error) {
  const code = String(error?.code || '');
  const message = String(error?.message || error || 'Could not save this change.');
  if (code.includes('operation-not-allowed')) return 'Enable Anonymous sign-in in the NEW Firebase project’s Authentication settings.';
  if (code.includes('unauthorized-domain')) return 'Add your GitHub Pages domain to the NEW Firebase project’s authorized domains.';
  if (/invalid-api-key|api-key-not-valid/i.test(code + message)) return 'The Firebase API key is invalid. Check firebase-config.js.';
  if (/network|fetch|loading dynamically imported|importing a module/i.test(code + message)) return 'Could not reach Firebase. Check your connection, then reload.';
  return message;
}

function normalize(state) {
  if (!state) return state;
  state.events ||= {};
  state.abilities ||= [];
  state.characterOrder ||= Object.keys(state.characters || {});
  for (const character of Object.values(state.characters || {})) {
    for (const key of ['abilities', 'gear', 'relationships', 'illuminationKeys']) character[key] ||= [];
  }
  return state;
}

export async function createStore(onStatus) {
  const fields = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId'];
  const supplied = fields.filter(key => firebaseConfig[key] && !firebaseConfig[key].includes('PASTE_YOUR'));
  if (supplied.length === 0) return new LocalStore(onStatus);
  if (supplied.length !== fields.length) throw new Error('The Firebase config is incomplete. Fill in all five required fields, including databaseURL.');
  const store = new FirebaseStore(onStatus);
  await store.init();
  return store;
}

class LocalStore {
  constructor(onStatus) {
    this.mode = 'local';
    this.online = true;
    this.uid = sessionStorage.getItem(`${PREFIX}identity`) || makeId();
    sessionStorage.setItem(`${PREFIX}identity`, this.uid);
    this.clientId = makeId();
    this.onStatus = onStatus;
    this.listeners = new Set();
    this.presenceListeners = new Set();
    this.presence = null;
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`${PREFIX}updates`) : null;
    this.channel?.addEventListener('message', () => this.emit());
    window.addEventListener('storage', event => { if (event.key?.startsWith(PREFIX)) this.emit(); });
    this.timer = setInterval(() => { if (this.presence) this.writePresence(); this.emitPresence(); }, 15000);
    window.addEventListener('pagehide', () => this.leave());
    onStatus('Local preview', 'local');
    // Fail early when storage is unavailable; never pretend edits were saved.
    const probe = `${PREFIX}probe`;
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
  }
  key(id) { return `${PREFIX}circle:${id}`; }
  read(id) {
    const raw = localStorage.getItem(this.key(id));
    if (!raw) return null;
    try { return normalize(JSON.parse(raw)); }
    catch { throw new Error('The local Circle data is damaged. Export any available backup before clearing browser data.'); }
  }
  async lock(id, task) {
    if (navigator.locks?.request) return navigator.locks.request(`${PREFIX}${id}`, task);
    return task();
  }
  async ensureCircle(seed) {
    return this.lock(seed.id, () => {
      let state = this.read(seed.id);
      if (!state) { state = clone(seed); localStorage.setItem(this.key(seed.id), JSON.stringify(state)); }
      validateCircle(state);
      return state;
    });
  }
  async mutate(id, operation) {
    return this.lock(id, () => {
      const current = this.read(id);
      if (!current) throw new Error('This Circle has not been opened yet.');
      const next = clone(current);
      operation(next);
      validateCircle(next);
      next.revision = (current.revision || 0) + 1;
      next.updatedAt = Date.now();
      localStorage.setItem(this.key(id), JSON.stringify(next));
      this.emit();
      this.channel?.postMessage('changed');
      return next;
    });
  }
  subscribe(id, callback, onError) {
    const entry = { id, callback, onError };
    this.listeners.add(entry);
    try { callback(this.read(id)); } catch (error) { onError?.(error); }
    return () => this.listeners.delete(entry);
  }
  emit() {
    for (const entry of this.listeners) {
      try { entry.callback(this.read(entry.id)); } catch (error) { entry.onError?.(error); }
    }
    this.emitPresence();
  }
  writePresence() {
    if (!this.presence) return;
    localStorage.setItem(`${PREFIX}presence:${this.clientId}`, JSON.stringify({ ...this.presence, seenAt: Date.now() }));
  }
  async setPresence(circleId, name, characterId) {
    this.presence = { circleId, name, characterId, uid: this.uid, clientId: this.clientId };
    this.writePresence();
    this.emitPresence();
    this.channel?.postMessage('presence');
  }
  subscribePresence(circleId, callback) {
    const entry = { circleId, callback };
    this.presenceListeners.add(entry);
    this.emitPresence();
    return () => this.presenceListeners.delete(entry);
  }
  emitPresence() {
    const peers = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(`${PREFIX}presence:`)) continue;
      try {
        const peer = JSON.parse(localStorage.getItem(key));
        if (Date.now() - peer.seenAt < 45000) peers.push(peer);
      } catch { /* Ignore an expired or partially removed presence entry. */ }
    }
    for (const entry of this.presenceListeners) entry.callback(peers.filter(p => p.circleId === entry.circleId));
  }
  async leave() {
    this.presence = null;
    localStorage.removeItem(`${PREFIX}presence:${this.clientId}`);
    this.emitPresence();
    this.channel?.postMessage('presence');
  }
}

class FirebaseStore {
  constructor(onStatus) {
    this.mode = 'firebase';
    this.online = false;
    this.clientId = makeId();
    this.onStatus = onStatus;
    this.presenceRef = null;
    this.presenceData = null;
  }
  async init() {
    this.onStatus('Connecting…', 'connecting');
    const [appSDK, authSDK, dbSDK] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js'),
    ]);
    this.sdk = dbSDK;
    const app = appSDK.initializeApp(firebaseConfig, 'candela-obscura');
    this.auth = authSDK.getAuth(app);
    await authSDK.setPersistence(this.auth, authSDK.browserLocalPersistence);
    await this.auth.authStateReady();
    const user = this.auth.currentUser || (await authSDK.signInAnonymously(this.auth)).user;
    this.uid = user.uid;
    this.db = dbSDK.getDatabase(app);
    dbSDK.onValue(dbSDK.ref(this.db, '.info/connected'), snapshot => {
      this.online = snapshot.val() === true;
      this.onStatus(this.online ? 'Table connected' : 'Reconnecting…', this.online ? 'online' : 'offline');
      if (this.online && this.presenceRef && this.presenceData) this.writePresence().catch(error => this.onStatus(friendlyError(error), 'error'));
    });
    window.addEventListener('pagehide', () => { if (this.presenceRef) dbSDK.remove(this.presenceRef).catch(() => { }); });
  }
  async connected() {
    if (this.online) return;
    const { onValue, ref } = this.sdk;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { unsubscribe(); reject(new Error('The database is not connected. Check databaseURL and your internet connection.')); }, 10000);
      const unsubscribe = onValue(ref(this.db, '.info/connected'), snapshot => {
        if (snapshot.val() === true) { clearTimeout(timer); unsubscribe(); resolve(); }
      }, error => { clearTimeout(timer); reject(error); });
    });
  }
  async ensureCircle(seed) {
    await this.connected();
    const { ref, runTransaction } = this.sdk;
    const result = await runTransaction(ref(this.db, `candela/circles/${seed.id}`), current => current ?? clone(seed), { applyLocally: false });
    if (!result.committed) throw new Error('Could not open this Circle.');
    const state = normalize(result.snapshot.val());
    validateCircle(state);
    return state;
  }
  async mutate(id, operation) {
    if (!this.online) throw new Error('The table is reconnecting. Wait for Table connected before making changes.');
    const { ref, runTransaction } = this.sdk;
    let problem = null;
    const result = await runTransaction(ref(this.db, `candela/circles/${id}`), current => {
      // Transaction callbacks may first receive null while the SDK loads data.
      // Return null and let the server comparison retry with the current Circle.
      if (!current) return current;
      try {
        const next = normalize(clone(current));
        operation(next);
        validateCircle(next);
        next.revision = (current.revision || 0) + 1;
        next.updatedAt = Date.now();
        problem = null;
        return next;
      } catch (error) { problem = error; return; }
    }, { applyLocally: false });
    if (problem) throw problem;
    if (!result.committed || !result.snapshot.exists()) throw new Error('Could not save this change. Reload the Circle and try again.');
    return normalize(result.snapshot.val());
  }
  subscribe(id, callback, onError) {
    const { ref, onValue } = this.sdk;
    return onValue(ref(this.db, `candela/circles/${id}`), snapshot => callback(normalize(snapshot.val())), onError);
  }
  async writePresence() {
    const { onDisconnect, set, serverTimestamp } = this.sdk;
    await onDisconnect(this.presenceRef).remove();
    await set(this.presenceRef, { ...this.presenceData, seenAt: serverTimestamp() });
  }
  async setPresence(circleId, name, characterId) {
    const { ref } = this.sdk;
    this.presenceRef = ref(this.db, `candela/presence/${circleId}/${this.clientId}`);
    this.presenceData = { uid: this.uid, clientId: this.clientId, name, characterId };
    if (this.online) await this.writePresence();
  }
  subscribePresence(circleId, callback, onError) {
    const { ref, onValue } = this.sdk;
    return onValue(ref(this.db, `candela/presence/${circleId}`), snapshot => callback(Object.values(snapshot.val() || {})), onError);
  }
  async leave() {
    const previous = this.presenceRef;
    this.presenceRef = null;
    this.presenceData = null;
    if (previous && this.online) await this.sdk.remove(previous);
  }
}
