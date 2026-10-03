import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGNS } from '../campaign-data.js';
import { clone, poolFor, resultFor, validateCircle, secureD6 } from '../core.js';
import { addRoll, confirmResult, selectResult, resistRoll, adjustTrack,
  updateCharacter, updateCircle, addChat, MAX_EVENTS } from '../state.js';

const seed = () => clone(CAMPAIGNS[0]);
const dice = [6, 4, 3, 2, 1, 5];
function roll(state, options = {}, overrides = {}) {
  const id = overrides.id || 'original';
  addRoll(state,{ id, uid:'player-a', characterId:'keith', action:'sway',
    options:{ driveSpend:0, bonusDice:0, extraGilded:0, circleDie:false, ...options },
    randomDice:dice, createdAt:100, ...overrides });
  return state.events[id];
}

test('the five populated workbook seats and unusual Camellya C13 rating are imported', () => {
  const state = seed();
  assert.equal(validateCircle(state),state);
  assert.equal(Object.keys(state.characters).length,5);
  assert.equal(state.characters.camellya.actions.move.rating,1);
  assert.equal(state.characters.keith.actions.sway.rating,2);
  assert.equal(state.characters.keith.actions.sway.gilded,true);
  assert.deepEqual(state.characters.keith.drives.cunning,{ current:5,max:8,resistance:2 });
  assert.equal(state.illumination,11);
  assert.deepEqual(state.resources.train,{ current:2,max:2 });
});
test('rating zero without bonuses takes the lower and never gives a critical', () => {
  const state = seed();
  const event = roll(state,{}, { action:'move', randomDice:[6,6] });
  assert.equal(event.zeroRating,true);
  assert.equal(event.dice.length,2);
  assert.equal(resultFor(event).critical,false);
  const low = { ...event,dice:[5,2],selectedIndex:1 };
  assert.equal(resultFor(low).value,2);
});
test('a zero-rating action with two drive dice can critically succeed', () => {
  const state = seed();
  state.characters.keith.drives.nerve={ current:3,max:3,resistance:1 };
  const event = roll(state,{ driveSpend:2 },{ action:'move',randomDice:[6,6] });
  assert.equal(event.zeroRating,false);
  assert.equal(event.dice.length,2);
  assert.equal(resultFor(event).critical,true);
  assert.equal(state.characters.keith.drives.nerve.current,1);
});
test('drive costs and shared Circle dice are spent once with idempotent roll submission', () => {
  const state = seed();
  const event = roll(state,{ driveSpend:1,circleDie:true });
  assert.equal(event.dice.length,4);
  assert.deepEqual(event.gildedIndices,[0,3]);
  assert.equal(state.characters.keith.drives.cunning.current,4);
  assert.equal(state.gildedDice,2);
  roll(state,{ driveSpend:1,circleDie:true });
  assert.equal(state.characters.keith.drives.cunning.current,4);
  assert.equal(state.gildedDice,2);
});
test('acceptance recovers only once and never exceeds drive maximum', () => {
  const state = seed();
  roll(state,{ driveSpend:1 });
  confirmResult(state,'original','player-a');
  assert.equal(state.characters.keith.drives.cunning.current,5);
  confirmResult(state,'original','player-a');
  assert.equal(state.characters.keith.drives.cunning.current,5);
  state.characters.keith.drives.cunning.current=8;
  roll(state,{}, { id:'second' });
  confirmResult(state,'second','player-a');
  assert.equal(state.characters.keith.drives.cunning.current,8);
  assert.equal(state.events.second.driveRecovered,0);
});
test('a gilded alternative is legal; arbitrary dice and other players are not', () => {
  const state = seed();
  const event = roll(state,{ bonusDice:1 },{ randomDice:[2,6,3] });
  selectResult(state,event.id,'player-a',0);
  assert.equal(resultFor(state.events[event.id]).value,2);
  assert.throws(() => selectResult(state,event.id,'player-a',2),/normal result/);
  assert.throws(() => confirmResult(state,event.id,'player-b'),/Only the roller/);
});
test('resistance spends one point, rerolls gilded action dice and retains bonuses', () => {
  const state = seed();
  roll(state,{ driveSpend:1,bonusDice:1,circleDie:true },{ randomDice:[1,2,3,4,5] });
  resistRoll(state,{ id:'resist-1',parentId:'original',uid:'player-a',randomDice:[6,6,1],createdAt:200 });
  assert.deepEqual(state.events['resist-1'].dice,[6,6,3,4,5]);
  assert.deepEqual(state.events['resist-1'].gildedIndices,[0,4]);
  assert.equal(state.characters.keith.drives.cunning.resistance,1);
  assert.equal(state.characters.keith.drives.cunning.current,4);
  assert.equal(state.gildedDice,2);
  assert.equal(state.events.original.supersededBy,'resist-1');
  assert.throws(() => resistRoll(state,{ id:'duplicate',parentId:'original',uid:'player-a',randomDice:[1,1],createdAt:200 }),/latest resistance/);
  resistRoll(state,{ id:'resist-2',parentId:'resist-1',uid:'player-a',randomDice:[4,4],createdAt:300 });
  assert.equal(state.characters.keith.drives.cunning.resistance,0);
  assert.throws(() => resistRoll(state,{ id:'resist-3',parentId:'resist-2',uid:'player-a',randomDice:[1,1],createdAt:400 }),/no corresponding resistance/);
  assert.doesNotThrow(() => roll(state,{}, { id:'fresh-roll' }));
});
test('invalid pools, overspending and stale action ratings leave persisted copies untouched', () => {
  assert.throws(() => poolFor({ rating:3,driveSpend:4 }),/at most 6/);
  const state = seed();
  state.characters.keith.drives.cunning.current=1;
  assert.throws(() => roll(state,{ driveSpend:2 }),/not enough drive/);
  assert.throws(() => roll(state,{}, { expectedRating:1 }),/action changed/);
  assert.equal(Object.keys(state.events).length,0);
  state.gildedDice=0;
  assert.throws(() => roll(state,{ circleDie:true }),/No Stamina/);
});
test('editing prevents concurrent changes from overwriting newer sheet or Circle values', () => {
  const state = seed();
  adjustTrack(state,{ characterId:'keith',group:'drives',key:'cunning',delta:-1 });
  assert.throws(() => updateCharacter(state,'keith',{ name:'New Keith' },0),/changed while/);
  assert.equal(state.characters.keith.name,'Keith Collins');
  state.revision=2;
  assert.throws(() => updateCircle(state,{ name:'Other name' },1),/changed while/);
  assert.equal(state.name,'The Prophets');
});
test('the bounded log retains the newest entries and prevents duplicate chat submissions', () => {
  const state = seed();
  for (let i=0;i<MAX_EVENTS+5;i++) addChat(state,{ id:`chat-${i}`,uid:'player-a',author:'Keith',message:`Message ${i}`,createdAt:i });
  assert.equal(Object.keys(state.events).length,MAX_EVENTS);
  assert.equal(state.events['chat-0'],undefined);
  assert.equal(state.events[`chat-${MAX_EVENTS+4}`].message,`Message ${MAX_EVENTS+4}`);
  const sequence = state.nextEventSequence;
  addChat(state,{ id:`chat-${MAX_EVENTS+4}`,uid:'player-a',author:'Keith',message:'Duplicate',createdAt:999 });
  assert.equal(state.nextEventSequence,sequence);
});
test('secure d6 values always fall in the valid range', () => {
  for (let i=0;i<1000;i++) { const n=secureD6(); assert.ok(Number.isInteger(n) && n>=1 && n<=6); }
});
