import { ACTIONS, DRIVES, cleanText, clone, integer, titleCase, poolFor, defaultSelection, resultFor,
  validSelections, validateCharacter, validateCircle } from './core.js?v=2';
import { migrateProgression, resolveIllumination } from './progression.js?v=2';

export const MAX_EVENTS = 100;

function appendEvent(state, event) {
  state.events ||= {};
  state.nextEventSequence = (state.nextEventSequence || 0) + 1;
  state.events[event.id] = { ...event, sequence: state.nextEventSequence };
  const ids = Object.keys(state.events).sort((a, b) => state.events[a].sequence - state.events[b].sequence);
  for (const id of ids.slice(0, Math.max(0, ids.length - MAX_EVENTS))) delete state.events[id];
}

function myRoll(state, id, uid) {
  const roll = state.events?.[id];
  if (!roll || roll.type !== 'roll') throw new Error('This roll is no longer in the log.');
  if (roll.authorUid !== uid) throw new Error('Only the roller can change this result.');
  if (roll.supersededBy) throw new Error('Use the latest resistance result.');
  return roll;
}

export function addRoll(state, { id, uid, characterId, action, options, randomDice, createdAt,
  gmName = 'Lightkeeper', expectedRating, expectedGilded }) {
  if (state.events?.[id]) return id;
  const character = characterId ? state.characters[characterId] : null;
  if (characterId && !character) throw new Error('Choose a character first.');
  if (character && !ACTIONS[action]) throw new Error('Choose an action first.');
  const rating = character ? character.actions[action].rating : options.rating;
  const gilded = character ? character.actions[action].gilded : Boolean(options.actionGilded);
  if ((expectedRating != null && rating !== expectedRating) ||
      (expectedGilded != null && gilded !== expectedGilded)) {
    throw new Error('The action changed on the sheet. Review your dice pool and try again.');
  }
  const pool = poolFor({ ...options, rating, actionGilded: gilded });
  const drive = character ? ACTIONS[action].drive : null;
  if (!character && pool.driveSpend) throw new Error('Lightkeeper rolls do not spend character drive.');
  if (character && pool.driveSpend > character.drives[drive].current) throw new Error('There is not enough drive left.');
  if (pool.circleDie && (!state.abilities?.some(a => a.name === 'Stamina Training' && a.selected) || state.gildedDice < 1)) {
    throw new Error('No Stamina Training die is available.');
  }
  const dice = randomDice.slice(0, pool.total).map(v => integer(v, 1, 6, 'Die'));
  if (dice.length !== pool.total) throw new Error('The roll did not include enough dice.');
  const roll = {
    id, type: 'roll', authorUid: uid, author: character?.name || cleanText(gmName, 60),
    characterId: characterId || '', action: character ? action : 'custom',
    actionName: character ? ACTIONS[action].name : 'Lightkeeper roll', drive: drive || '',
    actionRating: rating, dice, gildedIndices: pool.gildedIndices,
    actionPositions: pool.actionPositions, zeroRating: pool.zeroRating,
    driveSpend: pool.driveSpend, bonusDice: pool.bonusDice, circleDie: pool.circleDie,
    confirmed: false, resistanceCount: 0, rerolledIndices: [], createdAt,
  };
  roll.selectedIndex = defaultSelection(roll);
  if (character && pool.driveSpend) {
    character.drives[drive].current -= pool.driveSpend;
    character.version = (character.version || 0) + 1;
  }
  if (pool.circleDie) state.gildedDice--;
  appendEvent(state, roll);
  return id;
}

export function selectResult(state, id, uid, index) {
  const roll = myRoll(state, id, uid);
  if (roll.confirmed) throw new Error('This result was already accepted.');
  if (!validSelections(roll).includes(index)) throw new Error('Choose the normal result or a gilded die.');
  roll.selectedIndex = index;
}

export function confirmResult(state, id, uid) {
  const roll = myRoll(state, id, uid);
  // Idempotent, including when two tabs accept the same result concurrently.
  if (roll.confirmed) return;
  const result = resultFor(roll);
  roll.confirmed = true;
  roll.outcome = result.outcome;
  roll.driveRecovered = 0;
  if (result.gilded && roll.characterId) {
    const character = state.characters[roll.characterId];
    const drive = character?.drives?.[roll.drive];
    if (!drive) throw new Error('The corresponding drive no longer exists.');
    const next = Math.min(drive.max, drive.current + 1);
    roll.driveRecovered = next - drive.current;
    drive.current = next;
    character.version = (character.version || 0) + 1;
  }
}

export function resistRoll(state, { id, parentId, uid, randomDice, createdAt }) {
  if (state.events?.[id]) return id;
  const parent = myRoll(state, parentId, uid);
  if (parent.actionRating < 1) throw new Error('Rating-zero rolls have no action dice to reroll.');
  const character = parent.characterId ? state.characters[parent.characterId] : null;
  if (parent.characterId && !character) throw new Error('This character no longer exists.');
  if (character && character.drives[parent.drive].resistance < 1) throw new Error('There is no corresponding resistance left.');
  const positions = parent.actionPositions || Array.from({ length: parent.actionRating }, (_, i) => i);
  const dice = [...parent.dice];
  positions.forEach((position, i) => { dice[position] = integer(randomDice[i], 1, 6, 'Die'); });
  const roll = { ...clone(parent), id, parentId, createdAt, dice, confirmed: false,
    resistanceCount: (parent.resistanceCount || 0) + 1,
    rerolledIndices: positions, author: character?.name || parent.author };
  delete roll.supersededBy;
  delete roll.driveRecovered;
  delete roll.outcome;
  roll.selectedIndex = defaultSelection(roll);
  parent.supersededBy = id;
  if (character) {
    character.drives[parent.drive].resistance--;
    character.version = (character.version || 0) + 1;
  }
  appendEvent(state, roll);
  return id;
}

export function addChat(state, { id, uid, author, message, createdAt }) {
  if (state.events?.[id]) return;
  message = cleanText(message, 500);
  if (!message) throw new Error('Write a message first.');
  appendEvent(state, { id, authorUid: uid, type: 'chat', author: cleanText(author, 60), message, createdAt });
}

export function adjustTrack(state, { characterId, group, key, field = 'current', delta }) {
  delta = integer(delta, -1, 1, 'Adjustment');
  if (characterId) {
    const character = state.characters[characterId];
    if (!character) throw new Error('Choose a character.');
    if (group === 'drives' && DRIVES.includes(key) && ['current', 'resistance'].includes(field)) {
      const drive = character.drives[key];
      const max = field === 'resistance' ? Math.floor(drive.max / 3) : drive.max;
      drive[field] = Math.max(0, Math.min(max, drive[field] + delta));
    } else if (group === 'marks' && ['body', 'brain', 'bleed'].includes(key)) {
      character.marks[key] = Math.max(0, Math.min(3, character.marks[key] + delta));
    } else throw new Error('That track cannot be adjusted.');
    character.version = (character.version || 0) + 1;
  } else if (group === 'resources' && ['stitch', 'refresh', 'train'].includes(key)) {
    const track = state.resources[key];
    track.current = Math.max(0, Math.min(track.max, track.current + delta));
  } else if (key === 'illumination' || key === 'gildedDice') {
    if (key === 'illumination') migrateProgression(state);
    state[key] = Math.max(0, Math.min(state[`${key}Max`], state[key] + delta));
    if (key === 'illumination') resolveIllumination(state);
  } else throw new Error('That track cannot be adjusted.');
}

export function updateCharacter(state, characterId, patch, expectedVersion) {
  const character = state.characters[characterId];
  if (!character) throw new Error('Choose a character.');
  if ((character.version || 0) !== expectedVersion) throw new Error('The sheet changed while you were editing. Close and reopen it to use the latest values.');
  const allowed = ['name', 'pronouns', 'role', 'specialty', 'style', 'catalyst', 'question',
    'actions', 'drives', 'marks', 'scars', 'gear', 'abilities', 'notes', 'relationships'];
  for (const key of allowed) if (Object.hasOwn(patch, key)) character[key] = clone(patch[key]);
  for (const key of ['name', 'pronouns', 'role', 'specialty']) character[key] = cleanText(character[key], 60);
  for (const key of ['style', 'catalyst', 'question', 'scars', 'notes']) character[key] = cleanText(character[key]);
  validateCharacter(character);
  character.version = expectedVersion + 1;
}

export function toggleGear(state, characterId, gearId) {
  const character = state.characters[characterId];
  const item = character?.gear?.find(g => g.id === gearId);
  if (!item) throw new Error('That gear no longer exists.');
  item.selected = !item.selected;
  character.version = (character.version || 0) + 1;
}

export function resetCharacterTracks(state, characterId, field) {
  const character = state.characters[characterId];
  if (!character) throw new Error('Choose a character.');
  if (!['current', 'resistance'].includes(field)) throw new Error('Choose drives or resistance to reset.');
  const targets = DRIVES.map(key => {
    const max = integer(character.drives?.[key]?.max, 0, 12, `${titleCase(key)} drive maximum`);
    return [key, field === 'resistance' ? Math.floor(max / 3) : max];
  });
  if (targets.every(([key, value]) => character.drives[key][field] === value)) return;
  for (const [key, value] of targets) character.drives[key][field] = value;
  character.version = (character.version || 0) + 1;
}

function customGearDetails(input) {
  const name = cleanText(input.name, 80);
  if (!name) throw new Error('Enter a name for your gear.');
  return { name, description: cleanText(input.description, 1000) };
}

export function addCustomGear(state, characterId, input) {
  const character = state.characters[characterId];
  if (!character) throw new Error('Choose a character.');
  if (!/^custom-[a-zA-Z0-9_-]{1,100}$/.test(input.id || '')) throw new Error('This gear needs a valid ID.');
  if (character.gear?.some(item => item.id === input.id)) return;
  const item = { ...customGearDetails(input), id: input.id, custom: true, selected: true, version: 0 };
  character.gear ||= [];
  character.gear.push(item);
  character.version = (character.version || 0) + 1;
}

export function updateCustomGear(state, characterId, gearId, input, expectedVersion) {
  const character = state.characters[characterId];
  const item = character?.gear?.find(gear => gear.id === gearId);
  if (!item) throw new Error('This gear was removed. Close the editor and add it again if needed.');
  if (!item.custom) throw new Error('Only custom gear can be edited here.');
  if ((item.version || 0) !== expectedVersion) throw new Error('This gear changed. Close and reopen the editor to use the latest details.');
  // Keep the latest carried/unmarked state when another player toggles the item.
  Object.assign(item, customGearDetails(input), { version: (item.version || 0) + 1 });
  character.version = (character.version || 0) + 1;
}

export function removeCustomGear(state, characterId, gearId, expectedVersion) {
  const character = state.characters[characterId];
  if (!character) throw new Error('Choose a character.');
  const item = character.gear?.find(gear => gear.id === gearId);
  if (!item) return;
  if (!item.custom) throw new Error('Only custom gear can be removed.');
  if ((item.version || 0) !== expectedVersion) throw new Error('This gear changed. Check the latest details before removing it.');
  character.gear = character.gear.filter(gear => gear.id !== gearId);
  character.version = (character.version || 0) + 1;
}

export function updateCircle(state, patch, expectedRevision) {
  if ((state.revision || 0) !== expectedRevision) throw new Error('The Circle changed while you were editing. Close and reopen it to use the latest values.');
  for (const key of ['name', 'chapterHouse', 'tone', 'feel', 'notes', 'resources', 'abilities',
    'illumination', 'illuminationMax', 'gildedDice', 'gildedDiceMax']) {
    if (Object.hasOwn(patch, key)) state[key] = clone(patch[key]);
  }
  for (const key of ['name', 'chapterHouse', 'tone', 'feel']) state[key] = cleanText(state[key], 60);
  state.notes = cleanText(state.notes);
  migrateProgression(state);
  validateCircle(state);
}
