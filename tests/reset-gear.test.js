import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGNS } from '../campaign-data.js';
import { clone, DRIVES, validateCircle } from '../core.js';
import { resetCharacterTracks, addCustomGear, updateCustomGear, removeCustomGear, toggleGear, updateCharacter } from '../state.js';

const seed = () => clone(CAMPAIGNS[0]);
const item = (id = 'custom-ring') => ({ id, name: 'Family signet ring', description: 'The Collins crest.' });

test('reset drives refills only the chosen investigator’s current drives', () => {
  const state = seed(), before = clone(state);
  resetCharacterTracks(state, 'keith', 'current');
  const expected = clone(before);
  for (const key of DRIVES) expected.characters.keith.drives[key].current = expected.characters.keith.drives[key].max;
  expected.characters.keith.version++;
  assert.deepEqual(state, expected);
  assert.equal(validateCircle(state), state);
});

test('reset resistance uses each drive’s maximum, including zero and nonmultiples of three', () => {
  const state = seed();
  state.characters.keith.drives = { nerve: { max: 0, current: 0, resistance: 0 },
    cunning: { max: 8, current: 1, resistance: 0 }, intuition: { max: 12, current: 2, resistance: 1 } };
  const before = clone(state), expected = clone(state);
  expected.characters.keith.drives.cunning.resistance = 2;
  expected.characters.keith.drives.intuition.resistance = 4;
  expected.characters.keith.version++;
  resetCharacterTracks(state, 'keith', 'resistance');
  assert.deepEqual(state, expected);
  assert.equal(state.characters.keith.drives.cunning.current, before.characters.keith.drives.cunning.current);
  assert.equal(validateCircle(state), state);
});

test('repeat resets at maximum do not change data or invalidate editors again', () => {
  const state = seed();
  resetCharacterTracks(state, 'keith', 'current');
  resetCharacterTracks(state, 'keith', 'resistance');
  const before = clone(state);
  resetCharacterTracks(state, 'keith', 'current'); resetCharacterTracks(state, 'keith', 'resistance');
  assert.deepEqual(state, before);
});

test('reset and custom gear changes prevent stale full-sheet edits from undoing them', () => {
  const state = seed(), old = clone(state.characters.keith);
  resetCharacterTracks(state, 'keith', 'current');
  assert.throws(() => updateCharacter(state, 'keith', { drives: old.drives }, old.version), /changed while/);
  const beforeGear = state.characters.keith.version;
  addCustomGear(state, 'keith', item());
  assert.throws(() => updateCharacter(state, 'keith', { gear: old.gear }, beforeGear), /changed while/);
  assert.equal(state.characters.keith.gear.at(-1).name, item().name);
});

test('invalid reset targets or invalid drive maxima cannot partially refill tracks', () => {
  const state = seed();
  const before = clone(state);
  assert.throws(() => resetCharacterTracks(state, 'gm', 'current'), /Choose a character/);
  assert.throws(() => resetCharacterTracks(state, 'keith', 'max'), /drives or resistance/);
  assert.deepEqual(state, before);
  state.characters.keith.drives.intuition.max = 99;
  const invalid = clone(state);
  assert.throws(() => resetCharacterTracks(state, 'keith', 'current'), /maximum/);
  assert.deepEqual(state, invalid);
});

test('custom gear appends a carried item and keeps every existing item and other sheet field', () => {
  const state = seed(), before = clone(state), expected = clone(state);
  addCustomGear(state, 'keith', item());
  expected.characters.keith.gear.push({ ...item(), custom: true, selected: true, version: 0 });
  expected.characters.keith.version++;
  assert.deepEqual(state, expected);
  toggleGear(state, 'keith', item().id);
  assert.equal(state.characters.keith.gear.at(-1).selected, false);
  assert.deepEqual(state.characters.keith.gear.slice(0, -1), before.characters.keith.gear);
  assert.equal(validateCircle(state), state);
});

test('adding custom gear is retry-safe and different item IDs can coexist', () => {
  const state = seed(); addCustomGear(state, 'keith', item());
  const before = clone(state);
  addCustomGear(state, 'keith', { ...item(), name: 'Duplicate attempt' });
  assert.deepEqual(state, before);
  addCustomGear(state, 'keith', { ...item('custom-lockpick'), name: 'Lockpick' });
  assert.deepEqual(state.characters.keith.gear.slice(-2).map(g => g.name), [item().name, 'Lockpick']);
});

test('custom notes are optional, names are trimmed, and whitespace-only names cannot be saved', () => {
  const state = seed(), before = clone(state);
  for (const input of [{ ...item(), name: '  ' }, { ...item(), id: 'bad.id' }]) {
    assert.throws(() => addCustomGear(state, 'keith', input));
    assert.deepEqual(state, before);
  }
  addCustomGear(state, 'keith', { id: 'custom-note', name: '  Notebook  ' });
  assert.equal(state.characters.keith.gear.at(-1).name, 'Notebook');
  assert.equal(state.characters.keith.gear.at(-1).description, '');
  const added = clone(state);
  assert.throws(() => updateCustomGear(state, 'keith', 'custom-note', { name: '  ' }, 0), /name/);
  assert.deepEqual(state, added);
});

test('editing custom gear keeps the latest carried state and other players’ changes', () => {
  const state = seed(); addCustomGear(state, 'keith', item());
  toggleGear(state, 'keith', item().id);
  addCustomGear(state, 'keith', { ...item('custom-pen'), name: 'Pen' });
  updateCustomGear(state, 'keith', item().id, { name: 'Old signet ring', description: 'Still valuable.' }, 0);
  const edited = state.characters.keith.gear.find(g => g.id === item().id);
  assert.equal(edited.name, 'Old signet ring'); assert.equal(edited.selected, false); assert.equal(edited.version, 1);
  assert.equal(state.characters.keith.gear.at(-1).name, 'Pen');
  const before = clone(state);
  assert.throws(() => updateCustomGear(state, 'keith', item().id, item(), 0), /changed/);
  assert.throws(() => removeCustomGear(state, 'keith', item().id, 0), /changed/);
  assert.deepEqual(state, before);
});

test('remove affects only a custom item, is retry-safe, and protects the preset list', () => {
  const state = seed(), originalGear = clone(state.characters.keith.gear);
  addCustomGear(state, 'keith', item());
  const preset = originalGear[0];
  assert.throws(() => removeCustomGear(state, 'keith', preset.id, 0), /Only custom/);
  assert.throws(() => updateCustomGear(state, 'keith', preset.id, item(), 0), /Only custom/);
  removeCustomGear(state, 'keith', item().id, 0);
  const before = clone(state); removeCustomGear(state, 'keith', item().id, 0);
  assert.deepEqual(state, before);
  assert.deepEqual(state.characters.keith.gear, originalGear);
  assert.throws(() => updateCustomGear(state, 'keith', item().id, item(), 0), /removed/);
});
