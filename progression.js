import { ACTIONS, DRIVES, cleanText, clone, integer, validateCharacter } from './core.js?v=2';
import { abilityChoices, abilityKey } from './ability-catalog.js?v=2';

export const ILLUMINATION_PER_LEVEL = 24;
export const ADVANCEMENT_OPTIONS = ['action', 'drives', 'ability', 'gild'];

export function migrateProgression(state) {
  if (!state) return state;
  state.level ??= 2;
  state.advancements ||= {};
  state.illuminationMax = ILLUMINATION_PER_LEVEL;
  for (const character of Object.values(state.characters || {})) {
    character.level ??= 2;
    character.abilities ||= [];
  }
  resolveIllumination(state);
  return state;
}

export function advancementCycles(state) {
  return Object.values(state.advancements || {}).sort((a,b) => a.level - b.level);
}
export function pendingCircleAdvance(state) {
  return advancementCycles(state).find(a => !a.circleAbilityId);
}
export function pendingCharacterAdvance(state, characterId) {
  return advancementCycles(state).find(a => a.characters?.[characterId]?.status === 'pending');
}
export function resolveIllumination(state) {
  state.advancements ||= {};
  state.level ??= 2;
  state.illuminationMax = ILLUMINATION_PER_LEVEL;
  while (state.illumination >= ILLUMINATION_PER_LEVEL) {
    state.illumination -= ILLUMINATION_PER_LEVEL;
    state.level++;
    const cycleId = `circle-level-${state.level}`;
    if (state.advancements[cycleId]) throw new Error('This Circle level already has an advancement record.');
    state.advancements[cycleId] = {
      id:cycleId, level:state.level, circleAbilityId:'', circleAbilityName:'',
      characters:Object.fromEntries(Object.entries(state.characters).map(([key,c]) => {
        const previous = advancementCycles(state).map(a => a.characters?.[key]?.targetLevel || 0);
        return [key, { status:'pending', targetLevel:Math.max(c.level ?? 2, ...previous) + 1, choices:{} }];
      })),
    };
  }
}

function newAbility(character, abilityId, custom) {
  let ability;
  if (custom != null) {
    const name = cleanText(custom.name, 60);
    if (!name) throw new Error('Enter an ability name.');
    ability = { id:`custom-${abilityKey(name)}`, name, role:cleanText(custom.role || 'Custom', 60),
      specialty:cleanText(custom.specialty, 60), description:cleanText(custom.description), selected:true };
  } else {
    ability = abilityChoices(character).find(a => a.id === abilityId);
    if (!ability) throw new Error('Choose an ability from any role or specialty.');
    ability = { ...ability, selected:true };
  }
  if (character.abilities.some(a => a.selected && abilityKey(a.name) === abilityKey(ability.name))) {
    throw new Error('This character already has that ability.');
  }
  return ability;
}

export function chooseCircleAbility(state, cycleId, abilityId, custom) {
  const cycle = state.advancements?.[cycleId];
  if (!cycle) throw new Error('This Circle advancement is no longer available.');
  if (cycle.circleAbilityId) {
    const selectedId = abilityId === '__custom__' ? `circle-custom-${abilityKey(custom?.name)}` : abilityId;
    if (cycle.circleAbilityId === selectedId) return;
    throw new Error('The Circle already chose an ability for this level.');
  }
  if (pendingCircleAdvance(state)?.id !== cycleId) throw new Error('Finish the earlier Circle ability choice first.');
  let ability = state.abilities.find(a => a.id === abilityId);
  if (abilityId === '__custom__') {
    const name = cleanText(custom?.name, 60);
    if (!name) throw new Error('Enter the custom Circle ability name.');
    if (state.abilities.some(a=>abilityKey(a.name) === abilityKey(name) && a.selected)) throw new Error('The Circle already has that ability.');
    ability = { id:`circle-custom-${abilityKey(name)}`, name, description:cleanText(custom.description), selected:false };
    if (state.abilities.some(a=>a.id === ability.id)) throw new Error('Choose this ability from the existing list.');
    state.abilities.push(ability);
  }
  if (!ability || ability.selected) throw new Error('Choose a new Circle ability.');
  ability.selected = true;
  cycle.circleAbilityId = ability.id;
  cycle.circleAbilityName = ability.name;
}

export function completeCharacterAdvance(state, { cycleId, characterId, choices, expectedVersion }) {
  const cycle = state.advancements?.[cycleId];
  const entry = cycle?.characters?.[characterId];
  const character = state.characters[characterId];
  if (!entry || !character) throw new Error('This character advancement is no longer available.');
  if (entry.status === 'complete') return;
  if (!cycle.circleAbilityId) throw new Error('Choose the new Circle ability first.');
  if (pendingCharacterAdvance(state, characterId)?.id !== cycleId) throw new Error('Finish the earlier character advancement first.');
  if ((character.version || 0) !== expectedVersion) throw new Error('The sheet changed while you were choosing. Close and reopen advancement to use the latest values.');
  const keys = Object.keys(choices || {});
  const count = cycle.circleAbilityName === 'One Last Run' ? 4 : 2;
  if (keys.length !== count || keys.some(key => !ADVANCEMENT_OPTIONS.includes(key))) {
    throw new Error(`Choose ${count} different advancement options.`);
  }
  // Validate every choice on a copy so a rejected advancement cannot apply half its upgrades.
  const next = clone(character);
  const summary = {};
  if (Object.hasOwn(choices, 'action')) {
    const key = choices.action;
    if (!ACTIONS[key] || next.actions[key].rating >= 3) throw new Error('Choose an action that is below rating 3.');
    next.actions[key].rating++;
    summary.action = `${ACTIONS[key].name} +1`;
  }
  if (Object.hasOwn(choices, 'drives')) {
    if (Object.keys(choices.drives || {}).some(key => !DRIVES.includes(key))) throw new Error('Choose valid drives.');
    const allocation = Object.fromEntries(DRIVES.map(key => [key, integer(choices.drives?.[key] || 0, 0, 2, 'Drive allocation')]));
    if (Object.values(allocation).reduce((sum,n) => sum+n, 0) !== 2) throw new Error('Allocate exactly 2 drive points.');
    for (const key of DRIVES) {
      const drive = next.drives[key], amount = allocation[key];
      if (drive.max + amount > 12) throw new Error('That drive would exceed the sheet maximum of 12.');
      const gainedResistance = Math.floor((drive.max + amount) / 3) - Math.floor(drive.max / 3);
      drive.max += amount;
      drive.current += amount;
      drive.resistance += gainedResistance;
    }
    summary.drives = allocation;
  }
  if (Object.hasOwn(choices, 'ability')) {
    const picked = choices.ability;
    const ability = newAbility(next, typeof picked === 'string' ? picked : picked?.id, typeof picked === 'object' ? picked.custom : null);
    const index = next.abilities.findIndex(a => abilityKey(a.name) === abilityKey(ability.name));
    if (index >= 0) next.abilities[index] = ability;
    else next.abilities.push(ability);
    summary.ability = ability.name;
  }
  if (Object.hasOwn(choices, 'gild')) {
    const key = choices.gild;
    if (!ACTIONS[key] || next.actions[key].gilded) throw new Error('Choose an action that is not already gilded.');
    next.actions[key].gilded = true;
    summary.gild = ACTIONS[key].name;
  }
  next.level = entry.targetLevel;
  next.version = (character.version || 0) + 1;
  validateCharacter(next);
  state.characters[characterId] = next;
  entry.status = 'complete';
  entry.choices = summary;
}

export function manageCharacterAbilities(state, characterId, abilities, custom, expectedVersion) {
  const character = state.characters[characterId];
  if (!character) throw new Error('Choose a character.');
  if ((character.version || 0) !== expectedVersion) throw new Error('The sheet changed while you were editing. Close and reopen it to use the latest values.');
  const next = clone(character);
  next.abilities = clone(abilities);
  if (custom?.name) next.abilities.push(newAbility(next, '', custom));
  const selected = next.abilities.filter(a => a.selected).map(a => abilityKey(a.name));
  if (new Set(selected).size !== selected.length) throw new Error('Choose each ability only once.');
  next.version = expectedVersion + 1;
  state.characters[characterId] = next;
}
