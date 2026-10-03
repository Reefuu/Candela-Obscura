export const DRIVES = ['nerve', 'cunning', 'intuition'];
export const ACTIONS = {
  move: { name: 'Move', drive: 'nerve', hint: 'Run, dodge, navigate' },
  strike: { name: 'Strike', drive: 'nerve', hint: 'Punch, break, knock down' },
  control: { name: 'Control', drive: 'nerve', hint: 'Drive, shoot, finesse' },
  sway: { name: 'Sway', drive: 'cunning', hint: 'Convince, command, consort' },
  read: { name: 'Read', drive: 'cunning', hint: 'Read people, spot lies, gather motives' },
  hide: { name: 'Hide', drive: 'cunning', hint: 'Sneak, distract, sleight of hand' },
  survey: { name: 'Survey', drive: 'intuition', hint: 'Search, track, spot' },
  focus: { name: 'Focus', drive: 'intuition', hint: 'Inspect, analyze, remember' },
  sense: { name: 'Sense', drive: 'intuition', hint: 'Attune, channel, reveal' },
};
export const titleCase = value => value.charAt(0).toUpperCase() + value.slice(1);
export const clone = value => JSON.parse(JSON.stringify(value));

export function integer(value, min, max, label = 'Value') {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error(`${label} must be a whole number from ${min} to ${max}.`);
  }
  return number;
}
export function cleanText(value, max = 2000) {
  return String(value ?? '').replace(/\r/g, '').trim().slice(0, max);
}
export function secureD6() {
  const limit = Math.floor(0x100000000 / 6) * 6;
  const buffer = new Uint32Array(1);
  do { crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % 6 + 1;
}

export function poolFor({ rating, driveSpend = 0, bonusDice = 0, circleDie = false,
  actionGilded = false, extraGilded = 0 }) {
  rating = integer(rating, 0, 3, 'Action rating');
  driveSpend = integer(driveSpend, 0, 6, 'Drive spend');
  bonusDice = integer(bonusDice, 0, 6, 'Bonus dice');
  const ordinaryCount = rating + driveSpend + bonusDice;
  const requested = ordinaryCount + (circleDie ? 1 : 0);
  if (requested > 6) throw new Error('The dice pool can contain at most 6 dice.');
  const zeroRating = requested === 0;
  const total = zeroRating ? 2 : requested;
  const gildedIndices = [];
  if (actionGilded) gildedIndices.push(0);
  if (circleDie && !gildedIndices.includes(total - 1)) gildedIndices.push(total - 1);
  extraGilded = integer(extraGilded, 0, total - gildedIndices.length, 'Additional gilded dice');
  for (let i = 0; extraGilded > 0 && i < total; i++) {
    if (!gildedIndices.includes(i)) { gildedIndices.push(i); extraGilded--; }
  }
  return { rating, driveSpend, bonusDice, circleDie: Boolean(circleDie), zeroRating, total,
    gildedIndices: gildedIndices.sort((a, b) => a - b),
    actionPositions: Array.from({ length: rating }, (_, i) => i) };
}

export function defaultSelection(roll) {
  const target = roll.zeroRating ? Math.min(...roll.dice) : Math.max(...roll.dice);
  // Prefer a tied gilded result, while leaving acceptance to the roller.
  const gilded = (roll.gildedIndices || []).find(i => roll.dice[i] === target);
  return gilded ?? roll.dice.indexOf(target);
}
export function validSelections(roll) {
  const target = roll.zeroRating ? Math.min(...roll.dice) : Math.max(...roll.dice);
  return roll.dice.map((value, i) => value === target || (roll.gildedIndices || []).includes(i) ? i : -1)
    .filter(i => i >= 0);
}
export function resultFor(roll, selectedIndex = roll.selectedIndex) {
  if (!validSelections(roll).includes(selectedIndex)) throw new Error('Choose a valid result die.');
  const value = roll.dice[selectedIndex];
  const critical = !roll.zeroRating && value === 6 && roll.dice.filter(v => v === 6).length >= 2;
  return {
    value, critical, gilded: (roll.gildedIndices || []).includes(selectedIndex),
    outcome: critical ? 'Critical success' : value === 6 ? 'Full success' : value >= 4 ? 'Mixed success' : 'Failure',
  };
}

export function validateCharacter(character) {
  if (!cleanText(character.name, 60)) throw new Error('The character needs a name.');
  if (!ACTIONS || !character.actions || !character.drives) throw new Error('The character sheet is incomplete.');
  for (const key of Object.keys(ACTIONS)) integer(character.actions[key]?.rating, 0, 3, `${titleCase(key)} rating`);
  for (const key of DRIVES) {
    const drive = character.drives[key];
    integer(drive?.max, 0, 12, `${titleCase(key)} maximum`);
    integer(drive?.current, 0, drive.max, `${titleCase(key)} drive`);
    integer(drive?.resistance, 0, Math.floor(drive.max / 3), `${titleCase(key)} resistance`);
  }
  for (const key of ['body', 'brain', 'bleed']) integer(character.marks?.[key], 0, 3, `${titleCase(key)} marks`);
  return character;
}

export function validateCircle(circle) {
  if (!circle || circle.schemaVersion !== 1 || !circle.characters || !cleanText(circle.name, 60)) {
    throw new Error('This Circle data is incomplete or from an unsupported version.');
  }
  integer(circle.illuminationMax, 1, 100, 'Illumination maximum');
  integer(circle.illumination, 0, circle.illuminationMax, 'Illumination');
  integer(circle.gildedDiceMax, 0, 12, 'Circle gilded dice maximum');
  integer(circle.gildedDice, 0, circle.gildedDiceMax, 'Circle gilded dice');
  for (const key of ['stitch', 'refresh', 'train']) {
    integer(circle.resources?.[key]?.max, 0, 12, `${titleCase(key)} maximum`);
    integer(circle.resources[key].current, 0, circle.resources[key].max, `${titleCase(key)} resources`);
  }
  Object.values(circle.characters).forEach(validateCharacter);
  return circle;
}
