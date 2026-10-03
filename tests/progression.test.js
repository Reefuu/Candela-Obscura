import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGNS } from '../campaign-data.js';
import { clone, poolFor } from '../core.js';
import { addRoll, resistRoll, adjustTrack, updateCircle } from '../state.js';
import { ABILITY_CATALOG, abilityChoices } from '../ability-catalog.js';
import { migrateProgression, resolveIllumination, pendingCharacterAdvance,
  chooseCircleAbility, completeCharacterAdvance, manageCharacterAbilities } from '../progression.js';

const seed = () => migrateProgression(clone(CAMPAIGNS[0]));
function ready() {
  const state = seed();
  state.illumination = 23;
  adjustTrack(state,{ group:'circle',key:'illumination',delta:1 });
  chooseCircleAbility(state,'circle-level-3',state.abilities.find(a=>a.name === 'Resource Management').id);
  return state;
}
const advance = (state,choices,extra={}) => completeCharacterAdvance(state,{ cycleId:'circle-level-3',characterId:'keith',expectedVersion:0,choices,...extra });

test('the ability picker contains all 75 abilities from every role and specialty',()=>{
  assert.equal(ABILITY_CATALOG.length,75);
  assert.equal(new Set(ABILITY_CATALOG.map(a=>a.role)).size,5);
  assert.equal(new Set(ABILITY_CATALOG.filter(a=>a.specialty).map(a=>a.specialty)).size,10);
  const choices = abilityChoices(seed().characters.keith);
  assert.equal(choices.length,75);
  assert.equal(choices.filter(a=>a.selected).length,3);
  for (const name of ['Misdirection','Patch Up','Mind Palace','Cold Read','Obscure Lexicon']) assert.ok(choices.find(a=>a.name===name));
});
test('chosen gilded dice retain their color and are included in action resistance',()=>{
  const state = seed();
  addRoll(state,{ id:'picked',uid:'player-a',characterId:'keith',action:'sway',
    options:{ driveSpend:1,gildedIndices:[2] },randomDice:[2,3,1],createdAt:1 });
  assert.deepEqual(state.events.picked.gildedIndices,[2]);
  assert.deepEqual(state.events.picked.actionPositions,[1,2]);
  resistRoll(state,{ id:'rerolled',parentId:'picked',uid:'player-a',randomDice:[4,6],createdAt:2 });
  assert.deepEqual(state.events.rerolled.dice,[2,4,6]);
  assert.deepEqual(state.events.rerolled.gildedIndices,[2]);
  assert.equal(state.characters.keith.drives.cunning.current,4);
});
test('invalid gilded selections do not spend drive, and the added Circle die stays gilded',()=>{
  const state = seed();
  assert.throws(()=>addRoll(state,{ id:'bad',uid:'p',characterId:'keith',action:'sway',options:{ driveSpend:1,gildedIndices:[0,2] },randomDice:[1,2,3],createdAt:1 }),/exactly 1/);
  assert.equal(state.characters.keith.drives.cunning.current,5);
  assert.equal(Object.keys(state.events).length,0);
  assert.throws(()=>poolFor({ rating:2,actionGilded:true,circleDie:true,gildedIndices:[0,1] }),/Circle die/);
  assert.throws(()=>poolFor({ rating:2,extraGilded:2,gildedIndices:[0,0] }),/only once/);
});
test('24 illumination resets to zero and opens one advancement for each level-2 character',()=>{
  const state = seed(); state.illumination=23;
  adjustTrack(state,{ group:'circle',key:'illumination',delta:1 });
  assert.equal(state.level,3); assert.equal(state.illumination,0);
  assert.equal(Object.keys(state.advancements).length,1);
  for (const c of Object.values(state.characters)) {
    assert.equal(c.level,2);
    assert.equal(state.advancements['circle-level-3'].characters[c.id].targetLevel,3);
  }
  resolveIllumination(state);
  assert.equal(state.level,3);
});
test('existing sheets migrate once without resetting their live statistics or abilities',()=>{
  const state = clone(CAMPAIGNS[0]);delete state.level;
  for (const c of Object.values(state.characters)) delete c.level;
  state.characters.keith.drives.cunning.current=1;
  state.characters.keith.notes='Keep my live notes'; state.illumination=29;
  migrateProgression(state);
  assert.equal(state.level,3);assert.equal(state.illumination,5);
  assert.equal(state.characters.keith.level,2);
  assert.equal(state.characters.keith.drives.cunning.current,1);
  assert.equal(state.characters.keith.notes,'Keep my live notes');
  const saved=JSON.stringify(state);migrateProgression(state);assert.equal(JSON.stringify(state),saved);
});
test('editing illumination also triggers advancement and preserves overflow',()=>{
  const state = seed(); updateCircle(state,{ illumination:25 },0);
  assert.equal(state.level,3);assert.equal(state.illumination,1);
});
test('new Circle abilities unlock upgrades and concurrent duplicate choices are harmless',()=>{
  const state = seed();state.illumination=24;resolveIllumination(state);
  assert.throws(()=>advance(state,{ action:'move',gild:'move' }),/Circle ability first/);
  const ability=state.abilities.find(a=>a.name==='Nobody Left Behind');
  chooseCircleAbility(state,'circle-level-3',ability.id);
  chooseCircleAbility(state,'circle-level-3',ability.id);
  assert.equal(state.abilities.filter(a=>a.selected).length,3);
  assert.throws(()=>chooseCircleAbility(state,'circle-level-3',state.abilities.find(a=>a.name==='Resource Management').id),/already chose/);
});
test('a Face can gain a Scholar Doctor ability and an action point once',()=>{
  const state=ready(); const ability=ABILITY_CATALOG.find(a=>a.name==='Patch Up');
  advance(state,{ action:'move',ability:ability.id });
  assert.equal(state.characters.keith.level,3);
  assert.equal(state.characters.keith.actions.move.rating,1);
  assert.equal(state.characters.keith.abilities.find(a=>a.name==='Patch Up').selected,true);
  assert.equal(state.characters.camellya.level,2);
  const saved=JSON.stringify(state);advance(state,{ action:'move',ability:ability.id });assert.equal(JSON.stringify(state),saved);
});
test('invalid, duplicate, and stale upgrade choices cannot partly change a sheet',()=>{
  const state=ready();let saved=JSON.stringify(state);
  assert.throws(()=>advance(state,{ action:'move' }),/2 different/);assert.equal(JSON.stringify(state),saved);
  const owned=state.characters.keith.abilities.find(a=>a.selected);
  assert.throws(()=>advance(state,{ action:'move',ability:owned.id }),/already has/);assert.equal(JSON.stringify(state),saved);
  state.characters.keith.version=1;saved=JSON.stringify(state);
  assert.throws(()=>advance(state,{ action:'move',gild:'move' }),/sheet changed/);assert.equal(JSON.stringify(state),saved);
});
test('two drive points can be split and grant only newly earned resistance',()=>{
  const state=ready();state.characters.keith.drives.cunning={ current:3,max:8,resistance:0 };
  advance(state,{ drives:{ cunning:1,nerve:1 },gild:'move' });
  assert.deepEqual(state.characters.keith.drives.cunning,{ current:4,max:9,resistance:1 });
  assert.equal(state.characters.keith.actions.move.gilded,true);
  assert.equal(state.characters.keith.level,3);
});
test('pending levels queue and cannot be applied out of order',()=>{
  const state=ready();state.illumination=24;resolveIllumination(state);
  chooseCircleAbility(state,'circle-level-4',state.abilities.find(a=>a.name==='Nobody Left Behind').id);
  assert.equal(pendingCharacterAdvance(state,'keith').id,'circle-level-3');
  assert.equal(state.advancements['circle-level-4'].characters.keith.targetLevel,4);
  assert.throws(()=>advance(state,{ action:'move',gild:'move' },{ cycleId:'circle-level-4' }),/earlier character/);
  advance(state,{ action:'move',gild:'move' });
  advance(state,{ action:'move',gild:'focus' },{ cycleId:'circle-level-4',expectedVersion:1 });
  assert.equal(state.characters.keith.level,4);assert.equal(state.characters.keith.actions.move.rating,2);
});
test('existing level-2 abilities can be corrected using any class or a custom entry',()=>{
  const state=seed(), choices=abilityChoices(state.characters.keith);
  choices.find(a=>a.name==='Patch Up').selected=true;
  manageCharacterAbilities(state,'keith',choices,{ name:'Table Ritual',role:'Custom',description:'Our table notes.' },0);
  assert.equal(state.characters.keith.level,2);
  assert.equal(state.characters.keith.abilities.find(a=>a.name==='Patch Up').selected,true);
  assert.equal(state.characters.keith.abilities.find(a=>a.name==='Table Ritual').selected,true);
});
test('custom Circle and character abilities are supported with duplicate protection',()=>{
  const state=seed();state.illumination=24;resolveIllumination(state);
  chooseCircleAbility(state,'circle-level-3','__custom__',{name:'Our Circle Bond',description:'Table notes'});
  chooseCircleAbility(state,'circle-level-3','__custom__',{name:'Our Circle Bond',description:'Table notes'});
  assert.equal(state.abilities.filter(a=>a.name==='Our Circle Bond').length,1);
  advance(state,{ability:{custom:{name:'Our Secret',role:'Supplement',description:'Table notes'}},gild:'move'});
  assert.equal(state.characters.keith.abilities.find(a=>a.name==='Our Secret').selected,true);
});
test('One Last Run grants all four different advancement options',()=>{
  const state=seed();state.illumination=24;resolveIllumination(state);
  chooseCircleAbility(state,'circle-level-3',state.abilities.find(a=>a.name==='One Last Run').id);
  assert.throws(()=>advance(state,{action:'move',gild:'move'}),/4 different/);
  advance(state,{action:'move',drives:{nerve:2},ability:'catalog-patch-up',gild:'move'});
  assert.equal(state.characters.keith.level,3);
  assert.equal(Object.keys(state.advancements['circle-level-3'].characters.keith.choices).length,4);
});
