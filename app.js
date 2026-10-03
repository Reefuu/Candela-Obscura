import { CAMPAIGNS } from './campaign-data.js?v=2';
import { ACTIONS, DRIVES, clone, cleanText, titleCase, poolFor, resultFor, validSelections, secureD6 } from './core.js?v=2';
import { addRoll, selectResult, confirmResult, resistRoll, addChat, adjustTrack,
  updateCharacter, updateCircle, toggleGear } from './state.js?v=2';
import { createStore, friendlyError } from './store.js?v=3';
import { ABILITY_REFERENCE_URL, abilityChoices } from './ability-catalog.js?v=2';
import { advancementCycles, pendingCircleAdvance, pendingCharacterAdvance, chooseCircleAbility,
  completeCharacterAdvance, manageCharacterAbilities } from './progression.js?v=2';

const $ = selector => document.querySelector(selector);
const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const id = () => crypto.randomUUID();
let store, circle, seat = null, activeTab = 'character', action = 'survey';
let unsubscribeCircle, unsubscribePresence, peers = [], busy = false, opening = false;
let presenceReadError = null, presenceWriteError = null;
let editKind, editBaseline, editCharacterId, toastTimer, latestId = null;
let editCycleId, editAbilities = [], gildedChoice = null, poolSignature = '';
const inputNames = ['drive-spend', 'bonus-dice', 'extra-gilded'];

function character() { return seat && seat !== 'gm' ? circle?.characters?.[seat] : null; }
function toast(message, error = false) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.toggle('error', error);
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, error ? 8000 : 3500);
}
function status(message, type) {
  $('#connection-status').textContent = message;
  $('#connection-status').className = `connection ${type}`;
  if (store && circle && seat) syncRollControls();
}
function presenceStatus(error) {
  presenceWriteError = error;
  renderPresence();
}
function showView(name) {
  for (const view of ['library', 'roster', 'table']) $(`#${view}-view`).hidden = view !== name;
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function currentURL(withSeat = false) {
  const url = new URL(location.href);
  url.search = '';
  url.hash = '';
  if (circle) url.searchParams.set('circle', circle.id);
  if (withSeat && seat) url.searchParams.set('character', seat);
  return url;
}
function updateURL() { history.replaceState({}, '', currentURL(true)); }
function portraitMarkup(c, className = 'seat-avatar') {
  return `<span class="${className}">${c.portrait ? `<img src="${html(c.portrait)}" alt="" loading="lazy">` : html(c.name?.slice(0, 1) || '?')}</span>`;
}
function dots(current, max, className = 'track-pip') {
  return Array.from({ length: max }, (_, i) => `<span class="${className}${i < current ? ' filled' : ''}"></span>`).join('');
}
function stepper({ value, max, group, key, characterId = '', field = 'current', label }) {
  const attrs = `data-command="adjust" data-group="${group}" data-key="${key}" data-character="${characterId}" data-field="${field}"`;
  return `<div class="stepper"><button type="button" ${attrs} data-delta="-1" aria-label="Decrease ${html(label)}" ${value <= 0 || busy ? 'disabled' : ''}>−</button><span>${value} / ${max}</span><button type="button" ${attrs} data-delta="1" aria-label="Increase ${html(label)}" ${value >= max || busy ? 'disabled' : ''}>+</button></div>`;
}
function time(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat([], { hour:'2-digit', minute:'2-digit' }).format(new Date(value));
}

function renderLibrary() {
  $('#circle-count').textContent = String(CAMPAIGNS.length).padStart(2, '0');
  $('#circles-list').innerHTML = CAMPAIGNS.map((seed, index) => {
    const c = circle?.id === seed.id ? circle : seed;
    const members = Object.values(c.characters);
    return `<button class="circle-card" data-command="circle" data-circle="${html(c.id)}" ${!store || opening ? 'disabled' : ''}>
      <span class="circle-emblem"><img src="./assets/seal.png" alt=""></span>
      <span><span class="eyebrow">CIRCLE ${String(index + 1).padStart(2, '0')} · ${members.length} INVESTIGATORS</span><h3>${html(c.name)}</h3><span class="muted">${html(c.chapterHouse || 'A circle of Candela Obscura')}</span></span>
      <span class="circle-card-end"><span class="member-dots">${members.map(m => portraitMarkup(m, 'member-dot')).join('')}</span><strong>${opening ? 'Opening…' : 'Enter the Circle'} <span aria-hidden="true">↗</span></strong></span>
    </button>`;
  }).join('');
}
function renderRoster() {
  $('#roster-circle-name').textContent = circle.name;
  $('#character-grid').innerHTML = circle.characterOrder.filter(key => circle.characters[key]).map((key, index) => {
    const c = circle.characters[key];
    return `<button class="character-card" data-command="seat" data-character="${html(key)}" aria-label="Play ${html(c.name)}">
      <span class="portrait${c.portrait ? '' : ' portrait-monogram'}">${c.portrait ? `<img src="${html(c.portrait)}" alt="${html(c.name)}" loading="lazy">` : html(c.name.split(' ').map(v => v[0]).join(''))}<span class="portrait-number">${String(index + 1).padStart(2, '0')}</span></span>
      <span class="character-card-content"><span class="eyebrow">${html(c.role)} / ${html(c.specialty)} · LEVEL ${c.level || 2}</span><h3>${html(c.name)}</h3><span class="pronouns">${html(c.pronouns)}</span><span class="mini-drives">${DRIVES.map(d => `<span>${titleCase(d)}<strong>${c.drives[d].current} / ${c.drives[d].max}</strong></span>`).join('')}</span></span>
      <span class="character-card-footer">Open character <span aria-hidden="true">↗</span></span></button>`;
  }).join('');
}

async function openCircle(circleId, requestedSeat) {
  if (opening || busy) return;
  const seed = CAMPAIGNS.find(c => c.id === circleId);
  if (!seed) throw new Error('That Circle is not in this archive.');
  opening = true;
  renderLibrary();
  $('#opening-error').textContent = '';
  try {
    unsubscribeCircle?.(); unsubscribePresence?.();
    await store.leave();
    circle = await store.ensureCircle(seed);
    seat = null;
    peers = [];
    presenceReadError = presenceWriteError = null;
    unsubscribeCircle = store.subscribe(circle.id, updated => {
      if (!updated) { toast('This Circle is no longer available. Reload to open it again.', true); return; }
      circle = updated;
      try { renderLibrary(); renderRoster(); if (seat) renderTable(); }
      catch (error) { toast(friendlyError(error), true); }
    }, error => toast(friendlyError(error), true));
    unsubscribePresence = store.subscribePresence(circle.id, list => {
      peers = list; presenceReadError = null; renderPresence();
    }, error => { peers = []; presenceReadError = error; renderPresence(); });
    renderRoster();
    if (requestedSeat === 'gm' || circle.characters[requestedSeat]) await selectSeat(requestedSeat);
    else { showView('roster'); updateURL(); }
  } catch (error) {
    $('#opening-error').textContent = friendlyError(error);
    toast(friendlyError(error), true);
  } finally { opening = false; renderLibrary(); }
}
async function selectSeat(key) {
  if (busy) return;
  if (key !== 'gm' && !circle.characters[key]) throw new Error('That character is not in this Circle.');
  seat = key;
  activeTab = key === 'gm' ? 'circle' : 'character';
  action = 'survey';
  latestId = null;
  gildedChoice = null; poolSignature = '';
  for (const name of inputNames) $(`#${name}`).value = '0';
  $('#circle-die').checked = false;
  $('#roll-note').value = '';
  renderTable();
  showView('table');
  updateURL();
  try { await store.setPresence(circle.id, character()?.name || 'Lightkeeper', key); }
  catch (error) { presenceStatus(error); }
}
async function goHome() {
  if (busy) return;
  unsubscribeCircle?.(); unsubscribePresence?.();
  unsubscribeCircle = unsubscribePresence = null;
  await store?.leave();
  circle = null; seat = null;
  const url = new URL(location.href); url.search = ''; url.hash = '';
  history.replaceState({}, '', url);
  renderLibrary(); showView('library');
}
async function showRoster() {
  if (busy) return;
  await store.leave();
  seat = null; latestId = null;
  renderRoster(); showView('roster'); updateURL();
}

function renderSeats() {
  $('#sidebar-circle-name').textContent = circle.name;
  $('#seat-list').innerHTML = circle.characterOrder.filter(key => circle.characters[key]).map(key => {
    const c = circle.characters[key];
    return `<button class="seat-button${seat === key ? ' active' : ''}" data-command="seat" data-character="${html(key)}" aria-label="Switch to ${html(c.name)}" ${seat === key ? 'aria-current="true"' : ''}>${portraitMarkup(c)}<span><strong>${html(c.name)}</strong><small>${html(c.specialty)}</small></span></button>`;
  }).join('') + `<button class="seat-button${seat === 'gm' ? ' active' : ''}" data-command="seat" data-character="gm"><span class="seat-avatar" aria-hidden="true">✧</span><span><strong>Lightkeeper</strong><small>Guide the table</small></span></button>`;
  renderPresence();
}
function renderPresence() {
  if (presenceReadError || presenceWriteError) {
    $('#peer-count').textContent = '—';
    $('#presence-list').innerHTML = '<span class="muted">Online player indicators are unavailable.</span>';
    return;
  }
  $('#peer-count').textContent = String(peers.length);
  $('#presence-list').innerHTML = peers.map(p => `<span class="presence-peer">${html(p.name)}${p.clientId === store?.clientId ? ' (you)' : ''}</span>`).join('') || '<span class="muted">No other seats open</span>';
}
function renderTable() {
  const c = character();
  $('#character-eyebrow').textContent = c ? `${c.role} / ${c.specialty}` : 'GUIDE THE INVESTIGATION';
  $('#character-name').textContent = c?.name || 'The Lightkeeper';
  $('#character-subtitle').textContent = c ? `${c.pronouns} · Level ${c.level || 2} · ${circle.name}` : `${circle.name} · Circle overview & freeform dice`;
  $('#edit-character').hidden = !c;
  for (const tab of ['character', 'dossier', 'circle', 'log']) {
    const button = $(`#tab-${tab}`);
    button.hidden = !c && (tab === 'character' || tab === 'dossier');
    button.classList.toggle('active', tab === activeTab);
    button.setAttribute('aria-pressed', String(tab === activeTab));
  }
  renderSeats();
  renderAdvancement();
  renderSheet();
  syncRollControls();
  renderFeed();
  renderLatest();
  $('.table-columns').classList.toggle('table-log-only', activeTab === 'log');
}
function renderAdvancement() {
  const c = character(), pending = pendingCircleAdvance(circle);
  const personal = c && pendingCharacterAdvance(circle, c.id);
  const rows = [];
  if (pending) rows.push(`<div class="advancement-notice"><div><p class="eyebrow">CIRCLE LEVEL ${pending.level}</p><strong>A new Circle ability awaits.</strong></div><button class="outline-button" data-command="circle-advance" data-cycle="${pending.id}" ${busy ? 'disabled' : ''}>Choose Circle ability ↗</button></div>`);
  if (personal) rows.push(`<div class="advancement-notice"><div><p class="eyebrow">LEVEL ${c.level} → ${personal.characters[c.id].targetLevel}</p><strong>${personal.circleAbilityId ? 'Choose your character upgrades.' : 'Your upgrades unlock after the Circle chooses its ability.'}</strong></div><button class="outline-button" data-command="character-advance" data-cycle="${personal.id}" ${busy || !personal.circleAbilityId ? 'disabled' : ''}>Advance ${html(c.name)} ↗</button></div>`);
  $('#advancement-banner').hidden = !rows.length;
  $('#advancement-banner').innerHTML = rows.join('');
}

function advancementHistory() {
  return advancementCycles(circle).slice().reverse().map(cycle => {
    const completed = Object.values(cycle.characters).filter(c => c.status === 'complete').length;
    return `<details class="advancement-history"><summary>Level ${cycle.level} · ${html(cycle.circleAbilityName || 'Circle ability pending')} <span class="muted">${completed} / ${Object.keys(cycle.characters).length} advanced</span></summary><div>${Object.entries(cycle.characters).map(([key,entry]) => `<p><strong>${html(circle.characters[key]?.name || key)}</strong><span>${entry.status === 'complete' ? `Level ${entry.targetLevel} · ${html(Object.values(entry.choices || {}).map(value => typeof value === 'object' ? Object.entries(value).filter(([,n])=>n).map(([d,n])=>`${titleCase(d)} +${n}`).join(', ') : value).join(' · '))}` : 'Awaiting choices'}</span></p>`).join('')}</div></details>`;
  }).join('');
}
function renderSheet() {
  const c = character();
  $('#sheet-content').hidden = activeTab === 'log';
  if (activeTab === 'character' && c) renderCharacterSheet(c);
  else if (activeTab === 'dossier' && c) renderDossier(c);
  else if (activeTab === 'circle') renderCircleSheet();
}
function renderCharacterSheet(c) {
  $('#sheet-content').innerHTML = `<section class="panel character-panel"><div class="section-heading"><h2>Drives & resistance</h2><span class="muted">Available / maximum</span></div>
    <div class="drive-grid">${DRIVES.map(d => {
      const drive = c.drives[d];
      return `<section class="drive-card ${d}"><h3 class="eyebrow">${titleCase(d)}</h3><div class="drive-value"><strong>${drive.current}</strong><span>/ ${drive.max}</span></div><div class="track-pips" aria-hidden="true">${dots(drive.current, drive.max)}</div>${stepper({ value:drive.current, max:drive.max, group:'drives', key:d, characterId:c.id, label:`${titleCase(d)} drive` })}<div class="resistance-track"><p class="eyebrow" style="margin-bottom:8px">Resistance</p>${stepper({ value:drive.resistance, max:Math.floor(drive.max / 3), group:'drives', key:d, characterId:c.id, field:'resistance', label:`${titleCase(d)} resistance` })}</div></section>`;
    }).join('')}</div>
    <div class="section-heading"><h2>Actions</h2><span class="muted">Choose one to roll</span></div><div class="actions-grid">${DRIVES.map(d => `<section class="action-group"><h3 class="eyebrow">${titleCase(d)}</h3>${Object.entries(ACTIONS).filter(([, a]) => a.drive === d).map(([key, a]) => `<button class="action-button${action === key ? ' selected' : ''}" data-command="action" data-action="${key}" aria-label="Roll ${a.name}, rating ${c.actions[key].rating}${c.actions[key].gilded ? ', gilded' : ''}" aria-pressed="${action === key}"><span class="action-name"><span class="action-diamond${c.actions[key].gilded ? ' gilded' : ''}" aria-hidden="true">${c.actions[key].gilded ? '◆' : '◇'}</span>${a.name}</span><span class="action-rating">${dots(c.actions[key].rating, 3, 'rating-pip')}<b>${c.actions[key].rating}</b></span></button>`).join('')}</section>`).join('')}</div><p class="actions-note"><span class="gold">◆</span> Gilded action · choose which pool die is gold before you roll.</p>
    <div class="section-heading"><h2>Marks</h2><span class="muted">Track harm from the investigation</span></div><div class="marks-grid">${['body','brain','bleed'].map(key => `<section class="mark-card"><h3 class="eyebrow">${titleCase(key)}</h3><div class="track-pips" aria-hidden="true">${dots(c.marks[key], 3)}</div>${stepper({ value:c.marks[key], max:3, group:'marks', key, characterId:c.id, label:`${titleCase(key)} marks` })}</section>`).join('')}</div><p class="small-note">At a fourth mark, resolve the scar with your GM. Clear the track and record the scar in Edit sheet.</p>
    </section>${abilitySection(c, true)}`;
}
function abilitySection(c, includeGear = false) {
  const selected = c.abilities.filter(a => a.selected);
  return `<section class="panel" style="margin-top:20px"><div class="panel-heading"><div><p class="eyebrow">WHAT YOU BRING TO THE TABLE</p><h2>Abilities${includeGear ? ' & gear' : ''}</h2></div><button class="outline-button" data-command="manage-abilities">Choose abilities ↗</button></div>${selected.length ? selected.map(a => `<article class="ability-card selected"><h3>${html(a.name)}</h3>${a.role ? `<span class="ability-origin">${html(a.specialty ? `${a.role} / ${a.specialty}` : `${a.role} role`)}</span>` : ''}<p>${html(a.description)}</p>${a.referencePage ? `<a class="ability-reference" href="${ABILITY_REFERENCE_URL}#page=${Number(a.referencePage) || 1}" target="_blank" rel="noopener">Read ability details ↗</a>` : ''}</article>`).join('') : '<p class="muted">No abilities selected yet.</p>'}${includeGear ? `<div class="dossier-section"><h3>Gear</h3><div class="gear-list">${c.gear.map(g => `<button data-command="gear" data-gear="${html(g.id)}" data-character="${c.id}" aria-label="${g.selected ? 'Unmark' : 'Mark'} ${html(g.name)}" aria-pressed="${g.selected}"><span class="gear-box${g.selected ? ' selected' : ''}" aria-hidden="true">${g.selected ? '✓' : ''}</span>${html(g.name)}</button>`).join('')}</div><p class="small-note">Choose gear as you use it. Check your abilities for additional slots.</p></div>` : ''}</section>`;
}
function renderDossier(c) {
  $('#sheet-content').innerHTML = `<section class="panel"><h2 class="dossier-title">The investigator’s dossier</h2>${[['Style',c.style],['Catalyst',c.catalyst],['Question',c.question],['Scars',c.scars],['Notes',c.notes]].map(([label,value]) => `<section class="dossier-section"><h3>${label}</h3><p>${html(value || 'Nothing recorded yet.')}</p></section>`).join('')}<section class="dossier-section"><h3>Relationships</h3>${c.relationships.length ? c.relationships.map(r => `<p class="relationship">${html(r.name)}<span>${html(r.relation)}</span></p>`).join('') : '<p>No relationships recorded.</p>'}</section><section class="dossier-section"><h3>Illumination keys</h3>${c.illuminationKeys.map(k => `<p>${html(k)}</p>`).join('')}</section></section>${abilitySection(c)}`;
}
function renderCircleSheet() {
  const c = circle;
  $('#sheet-content').innerHTML = `<section class="panel"><div class="panel-heading"><div><p class="eyebrow">THE CIRCLE’S RECORD · LEVEL ${c.level || 2}</p><h2>${html(c.name)}</h2></div><button class="outline-button" data-command="edit-circle">Edit Circle ↗</button></div>
    <p class="muted" style="font-size:11px">${html(c.chapterHouse || 'Chapter house not recorded')}${c.tone ? ` · ${html(c.tone)}` : ''}</p><div class="dossier-section"><div class="circle-track-header"><h3>Illumination</h3><strong>${c.illumination}<span class="muted" style="font-size:18px"> / ${c.illuminationMax}</span></strong></div><div class="illumination-track" aria-hidden="true">${Array.from({ length:c.illuminationMax }, (_, i) => `<span class="illumination-point${i < c.illumination ? ' filled' : ''}">${i + 1}</span>`).join('')}</div>${stepper({ value:c.illumination, max:c.illuminationMax, group:'circle', key:'illumination', label:'Circle illumination' })}<p class="small-note">At 24 illumination, the Circle gains a level and this track resets. Choose a new Circle ability, then each player chooses their advancement.</p></div>
    ${advancementHistory()}<div class="section-heading" style="margin-top:22px"><h2>Downtime resources</h2><span class="muted">Available / maximum</span></div><div class="resource-grid">${Object.entries(c.resources).map(([key,r]) => `<section class="resource-card"><h3>${titleCase(key)}</h3><div class="resource-value">${r.current} <span>/ ${r.max}</span></div>${stepper({ value:r.current, max:r.max, group:'resources', key, label:`${titleCase(key)} resource` })}</section>`).join('')}</div>
    <div class="gilded-count"><div><h3>Stamina Training dice</h3><p class="control-note">Shared gilded dice remaining this assignment</p></div>${stepper({ value:c.gildedDice, max:c.gildedDiceMax, group:'circle', key:'gildedDice', label:'Circle gilded dice' })}</div>
    <div class="section-heading"><h2>Circle abilities</h2></div>${c.abilities.filter(a => a.selected).map(a => `<article class="ability-card selected"><h3>${html(a.name)}</h3><p>${html(a.description)}</p></article>`).join('')}
    ${c.feel ? `<section class="dossier-section"><h3>Campaign feel</h3><p>${html(c.feel)}</p></section>` : ''}<section class="dossier-section"><h3>Circle notes</h3><p>${html(c.notes || 'Nothing recorded yet.')}</p></section><div class="circle-footer-actions"><button class="outline-button" data-command="backup">Export backup ↓</button><button class="danger-button" data-command="clear-log">Clear table log</button></div></section>`;
}

function selectOptions(selector, max) {
  const element = $(selector), previous = Math.max(0, Math.min(max, Number(element.value || 0)));
  element.replaceChildren(...Array.from({ length:max + 1 }, (_, i) => new Option(String(i), String(i))));
  element.value = String(previous);
}
function rollOptions() {
  const c = character();
  return { rating:c ? c.actions[action].rating : Number($('#gm-rating').value),
    actionGilded:c ? c.actions[action].gilded : $('#gm-gilded').checked,
    driveSpend:Number($('#drive-spend').value), bonusDice:Number($('#bonus-dice').value),
    extraGilded:Number($('#extra-gilded').value), circleDie:$('#circle-die').checked,
    ...(gildedChoice ? { gildedIndices:[...gildedChoice] } : {}) };
}
function syncRollControls() {
  if (!circle || !seat) return;
  const c = character(), base = c ? c.actions[action] : { rating:Number($('#gm-rating').value), gilded:$('#gm-gilded').checked };
  const drive = c ? c.drives[ACTIONS[action].drive] : null;
  $('#gm-rating-field').hidden = Boolean(c);
  $('#roll-action-name').textContent = c ? ACTIONS[action].name : 'Lightkeeper roll';
  $('#roll-action-hint').textContent = c ? `${ACTIONS[action].hint} · ${titleCase(ACTIONS[action].drive)}` : 'Set a rating for a freeform roll.';
  $('#roll-gilded-badge').hidden = !base.gilded;
  const canCircle = circle.abilities.some(a => a.name === 'Stamina Training' && a.selected) && circle.gildedDice > 0;
  if (!canCircle) $('#circle-die').checked = false;
  // Clamp every control against the actual live pool, including Circle dice.
  let circleDie = $('#circle-die').checked ? 1 : 0;
  selectOptions('#drive-spend', c ? Math.min(drive.current, 6 - base.rating - circleDie) : 0);
  selectOptions('#bonus-dice', 6 - base.rating - Number($('#drive-spend').value) - circleDie);
  const requested = base.rating + Number($('#drive-spend').value) + Number($('#bonus-dice').value) + circleDie;
  const total = requested || 2;
  selectOptions('#extra-gilded', Math.max(0, total - (base.gilded ? 1 : 0) - circleDie));
  $('#drive-spend-note').textContent = c ? `${drive.current} ${titleCase(ACTIONS[action].drive)} available` : 'Not used for GM rolls';
  $('#circle-die-note').textContent = `Stamina Training · ${circle.gildedDice} remaining`;
  $('#circle-die').disabled = !canCircle || busy || !store?.online;
  for (const name of inputNames) $(`#${name}`).disabled = busy || !store?.online || (name === 'drive-spend' && !c);
  $('#gm-rating').disabled = $('#gm-gilded').disabled = busy || !store?.online;
  try {
    const { gildedIndices:unused, ...options } = rollOptions();
    const pool = poolFor(options);
    const signature = JSON.stringify([seat,action,options]);
    if (signature !== poolSignature) { poolSignature = signature; gildedChoice = [...pool.gildedIndices]; }
    $('#pool-dice').innerHTML = Array.from({ length:pool.total }, (_, i) => {
      const locked = pool.circleDie && i === pool.total - 1;
      const gilded = gildedChoice.includes(i);
      return `<button type="button" class="pool-mini-die${gilded ? ' gilded' : ''}" data-command="gild-die" data-index="${i}" aria-pressed="${gilded}" aria-label="Die ${i + 1}${gilded ? ', gilded' : ', standard'}${locked ? ', Circle die' : ''}" ${locked || !pool.gildedIndices.length || busy || !store?.online ? 'disabled' : ''}>${i+1}<span aria-hidden="true">${gilded ? '◆' : '◇'}</span></button>`;
    }).join('');
    $('#gilded-selection-note').textContent = pool.gildedIndices.length ? `Choose ${pool.gildedIndices.length} gilded ${pool.gildedIndices.length === 1 ? 'die' : 'dice'} before rolling${pool.circleDie ? ' · the Circle die is gilded' : ''}.` : 'Add extra gilded dice above when an ability grants them.';
    $('#pool-summary').textContent = pool.zeroRating ? 'No rating or bonus: 2d6, take the lower.' : `${base.rating} action + ${pool.driveSpend} drive + ${pool.bonusDice + (pool.circleDie ? 1 : 0)} bonus · take the highest or a gilded result`;
    $('#roll-button').innerHTML = busy ? 'Saving to the table…' : `<span aria-hidden="true">✧</span> Roll ${pool.total}d6 <span aria-hidden="true">↗</span>`;
    $('#roll-button').disabled = busy || !store?.online;
    try { poolFor(rollOptions()); }
    catch (error) { $('#gilded-selection-note').textContent = error.message; $('#roll-button').disabled = true; }
  } catch (error) {
    $('#pool-summary').textContent = error.message;
    $('#roll-button').disabled = true;
  }
}

function toggleGildedDie(index) {
  const { gildedIndices:unused, ...options } = rollOptions();
  const pool = poolFor(options);
  if (pool.circleDie && index === pool.total - 1) return;
  if (gildedChoice.includes(index)) gildedChoice = gildedChoice.filter(i=>i!==index);
  else {
    if (gildedChoice.length >= pool.gildedIndices.length) {
      const removable = gildedChoice.find(i=>!pool.circleDie || i!==pool.total-1);
      gildedChoice = gildedChoice.filter(i=>i!==removable);
    }
    gildedChoice.push(index);
  }
  syncRollControls();
}

const PIPS = { 1:[4], 2:[0,8], 3:[0,4,8], 4:[0,2,6,8], 5:[0,2,4,6,8], 6:[0,2,3,5,6,8] };
function buildRollCard(roll) {
  let result;
  try { result = resultFor(roll); } catch { return '<article class="roll-card"><p class="muted">This roll could not be displayed.</p></article>'; }
  const mine = roll.authorUid === store.uid;
  const mutable = mine && !roll.confirmed && !roll.supersededBy;
  const allowed = validSelections(roll), guild = roll.gildedIndices || [];
  const resultClass = result.critical ? 'critical' : result.value === 6 ? 'full' : result.value >= 4 ? 'mixed' : 'failure';
  const c = circle.characters[roll.characterId];
  const remaining = c?.drives?.[roll.drive]?.resistance;
  const canResist = mine && !roll.supersededBy && roll.actionRating > 0 && (!c || remaining > 0);
  return `<article class="roll-card" data-roll-id="${html(roll.id)}"><div class="roll-meta"><strong>${html(roll.author)}</strong><time>${time(roll.createdAt)}</time></div><div class="roll-label">${html(roll.actionName)} · ${roll.resistanceCount ? `Resistance ${roll.resistanceCount}` : `rating ${roll.actionRating}`}${roll.circleDie ? ' · Circle die' : ''}</div>${roll.note ? `<p class="roll-note">${html(roll.note)}</p>` : ''}<div class="dice-row">${roll.dice.map((value, i) => `<button type="button" class="die${guild.includes(i) ? ' gilded' : ''}${i === roll.selectedIndex ? ' selected' : ''}${mutable && allowed.includes(i) ? ' selectable' : ''}${!allowed.includes(i) ? ' not-valid' : ''}${(roll.rerolledIndices || []).includes(i) ? ' rerolled' : ''}" data-command="select-result" data-roll="${html(roll.id)}" data-index="${i}" aria-label="Die ${i + 1}: ${value}${guild.includes(i) ? ', gilded' : ''}${i === roll.selectedIndex ? ', selected' : ''}" ${!mutable || !allowed.includes(i) || busy ? 'disabled' : ''}>${PIPS[value].map(pos => `<span class="die-pip" style="grid-row:${Math.floor(pos / 3) + 1};grid-column:${pos % 3 + 1}"></span>`).join('')}</button>`).join('')}</div><div class="roll-outcome"><strong class="outcome-${resultClass}">${html(result.outcome)}</strong><span class="gold">${result.value}</span></div><p class="roll-detail">${roll.supersededBy ? 'Superseded by a resistance roll.' : roll.confirmed ? `Result accepted.${result.gilded && c ? (roll.driveRecovered ? ` Recovered 1 ${titleCase(roll.drive)} drive.` : ' Drive already at maximum.') : ''}` : result.gilded && c ? `Gilded result · accepting recovers 1 ${titleCase(roll.drive)} drive, up to maximum.` : roll.zeroRating ? 'Rating zero: use the lower result or a gilded alternative.' : mutable ? 'Choose the highest result or any gilded die, then accept.' : 'Waiting for the roller to accept a result.'}</p>
    ${mine && !roll.supersededBy ? `<div class="result-actions">${!roll.confirmed ? `<button class="outline-button" data-command="confirm-result" data-roll="${html(roll.id)}" ${busy ? 'disabled' : ''}>Accept ${result.value}${result.gilded ? ' · gilded result' : ' · result'}</button>` : ''}${roll.actionRating > 0 ? `<button class="resistance-button" data-command="resist" data-roll="${html(roll.id)}" ${!canResist || busy ? 'disabled' : ''}>${c ? remaining > 0 ? `Burn 1 ${titleCase(roll.drive)} resistance · reroll ${roll.actionRating}d6` : `No ${titleCase(roll.drive)} resistance left` : `Resistance reroll ${roll.actionRating}d6 · GM`}</button>` : ''}</div>` : ''}</article>`;
}
function eventsNewest() { return Object.values(circle?.events || {}).sort((a,b) => b.sequence - a.sequence); }
function renderFeed() {
  const scroll = $('#feed').scrollTop;
  const events = eventsNewest();
  $('#feed').innerHTML = events.length ? events.map(e => e.type === 'roll' ? buildRollCard(e) : e.type === 'chat' ? `<article class="chat-event"><div class="roll-meta"><strong>${html(e.author)}</strong><time>${time(e.createdAt)}</time></div><p>${html(e.message)}</p></article>` : '').join('') : '<div class="feed-empty"><strong>The table is quiet.</strong>Your rolls and conversation will appear here.</div>';
  $('#feed').scrollTop = scroll;
}
function renderLatest() {
  const latest = eventsNewest().find(e => e.type === 'roll' && e.authorUid === store.uid && (e.characterId || 'gm') === seat);
  if (!latest) { $('#latest-result').innerHTML = ''; return; }
  latestId = latest.id;
  $('#latest-result').innerHTML = `<section class="panel"><p class="eyebrow">YOUR LATEST ROLL</p>${buildRollCard(latest)}</section>`;
}

async function run(task) {
  if (busy) return;
  busy = true;
  if (seat) renderTable();
  try { await task(); }
  catch (error) { toast(friendlyError(error), true); }
  finally { busy = false; if (seat) renderTable(); }
}
async function mutate(operation) {
  if (!circle) throw new Error('Open your Circle first.');
  circle = await store.mutate(circle.id, operation);
}
async function makeRoll() {
  const opts = rollOptions(), rollId = id(), randomDice = Array.from({ length:6 }, secureD6);
  const characterId = character()?.id || '', selectedAction = action, note = cleanText($('#roll-note').value, 160);
  await mutate(state => {
    addRoll(state, { id:rollId, uid:store.uid, characterId, action:selectedAction, options:opts,
      randomDice, createdAt:Date.now(), expectedRating:opts.rating, expectedGilded:opts.actionGilded });
    if (note) state.events[rollId].note = note;
  });
  latestId = rollId;
  $('#drive-spend').value = '0';
  $('#circle-die').checked = false;
  $('#roll-note').value = '';
}

function field(label, name, value, kind = 'text', extra = '') {
  return `<label class="form-field${kind === 'textarea' ? ' full' : ''}">${html(label)}${kind === 'textarea' ? `<textarea name="${name}" maxlength="2000">${html(value)}</textarea>` : `<input name="${name}" type="${kind}" value="${html(value)}" ${extra}>`}</label>`;
}
function abilityEditor(abilities) {
  return abilities.map(a => `<div class="edit-ability"><label class="checkbox-label"><input type="checkbox" name="ability-${html(a.id)}" ${a.selected ? 'checked' : ''}>${html(a.name)}</label><p>${html(a.description)}</p></div>`).join('');
}
function abilityPicker(abilities, single = false) {
  return `<div class="ability-picker"><p class="small-note">Your table rule: choose abilities from any role or specialty.</p><div class="ability-filters"><label>Search abilities<input id="ability-search" type="search" placeholder="Name, role, or specialty"></label><label>Class<select id="ability-role-filter"><option value="">All classes</option>${['Face','Muscle','Scholar','Slink','Weird'].map(role=>`<option>${role}</option>`).join('')}</select></label></div><div class="ability-options" role="group" aria-label="Abilities from all classes">${abilities.map(a => `<article class="ability-option${a.selected ? ' owned' : ''}" data-ability-option data-role="${html(a.role || '')}" data-search="${html(`${a.name} ${a.role || ''} ${a.specialty || ''}`.toLowerCase())}"><label class="checkbox-label"><input type="${single ? 'radio' : 'checkbox'}" name="${single ? 'chosen-ability' : `ability-${html(a.id)}`}" value="${html(a.id)}" ${a.selected ? single ? 'disabled' : 'checked' : ''}><strong>${html(a.name)}</strong>${single && a.selected ? '<small>Owned</small>' : ''}</label><span class="ability-origin">${html(a.specialty ? `${a.role} / ${a.specialty}` : a.role ? `${a.role} role` : 'Custom')}</span>${a.description ? `<p>${html(a.description)}</p>` : ''}${a.referencePage ? `<a class="ability-reference" href="${ABILITY_REFERENCE_URL}#page=${Number(a.referencePage) || 1}" target="_blank" rel="noopener">Read ability details ↗</a>` : ''}</article>`).join('')}${single ? '<article class="ability-option"><label class="checkbox-label"><input type="radio" name="chosen-ability" value="__custom__"><strong>Custom or supplement ability</strong></label></article>' : ''}</div><p id="ability-filter-empty" class="small-note" hidden>No abilities match this search.</p></div>`;
}
function customAbilityFields() {
  return `<details class="custom-ability-fields"><summary>Add a custom or supplement ability</summary><div class="form-grid">${field('Ability name','custom-ability-name','','text','maxlength="60"')}${field('Source class or supplement','custom-ability-role','','text','maxlength="60"')}${field('Ability notes','custom-ability-description','','textarea')}</div></details>`;
}
function filterAbilities() {
  const search = ($('#ability-search')?.value || '').trim().toLowerCase();
  const role = $('#ability-role-filter')?.value || '';
  let visible = 0;
  for (const option of document.querySelectorAll('[data-ability-option]')) {
    option.hidden = (role && option.dataset.role !== role) || (search && !option.dataset.search.includes(search));
    if (!option.hidden) visible++;
  }
  if ($('#ability-filter-empty')) $('#ability-filter-empty').hidden = visible > 0;
}
function prepareAdvancementEditor(kind, title) {
  editKind = kind;
  $('#edit-title').textContent = title;
  $('#edit-error').textContent = '';
  $('#save-edit').disabled = false;
}
function openAbilityManager() {
  const c = character(); if (!c) return;
  editBaseline = clone(c); editCharacterId = c.id; editAbilities = abilityChoices(c);
  prepareAdvancementEditor('abilities', `Abilities · ${c.name}`);
  $('#save-edit').textContent = 'Save ability choices';
  $('#edit-fields').innerHTML = `<p class="muted">Level ${c.level} · choose the abilities your character already owns.</p>${abilityPicker(editAbilities)}${customAbilityFields()}`;
  $('#edit-dialog').showModal();
}
function openCircleAdvancement(cycleId) {
  const cycle = circle.advancements?.[cycleId]; if (!cycle || cycle.circleAbilityId) return;
  editCycleId = cycleId;
  prepareAdvancementEditor('circle-advance', `Circle level ${cycle.level}`);
  $('#save-edit').textContent = 'Choose Circle ability';
  $('#edit-fields').innerHTML = `<p class="muted">The illumination track has reset. Choose one new Circle ability to unlock everyone's character advancement.</p><div class="circle-ability-options">${circle.abilities.filter(a=>!a.selected).map(a=>`<article class="edit-ability"><label class="checkbox-label"><input type="radio" name="new-circle-ability" value="${html(a.id)}"><strong>${html(a.name)}</strong></label><p>${html(a.description)}</p></article>`).join('')}<article class="edit-ability"><label class="checkbox-label"><input type="radio" name="new-circle-ability" value="__custom__"><strong>Custom Circle ability</strong></label></article></div>${customAbilityFields()}`;
  $('#edit-dialog').showModal();
}
function openCharacterAdvancement(cycleId) {
  const c = character(), cycle = circle.advancements?.[cycleId];
  if (!c || !cycle?.characters?.[c.id] || cycle.characters[c.id].status !== 'pending') return;
  if (!cycle.circleAbilityId) { toast('Choose the new Circle ability first.', true); return; }
  editCycleId = cycleId; editCharacterId = c.id; editBaseline = clone(c); editAbilities = abilityChoices(c);
  const count = cycle.circleAbilityName === 'One Last Run' ? 4 : 2;
  prepareAdvancementEditor('character-advance', `${c.name} · level ${cycle.characters[c.id].targetLevel}`);
  $('#save-edit').textContent = 'Apply advancement';
  const select = (name,label,options) => `<label class="form-field">${label}<select name="${name}"><option value="">Choose…</option>${options}</select></label>`;
  const actions = Object.entries(ACTIONS).map(([key,a])=>`<option value="${key}" ${c.actions[key].rating >= 3 ? 'disabled' : ''}>${a.name} · ${c.actions[key].rating} → ${Math.min(3,c.actions[key].rating+1)}</option>`).join('');
  const guild = Object.entries(ACTIONS).filter(([key])=>!c.actions[key].gilded).map(([key,a])=>`<option value="${key}">${a.name}</option>`).join('');
  const drives = DRIVES.map(key=>`<option value="${key}">${titleCase(key)} · maximum ${c.drives[key].max}</option>`).join('');
  const option = (key,title,details) => `<section class="upgrade-option"><label class="checkbox-label"><input type="checkbox" name="upgrade-${key}" data-upgrade="${key}" ${count === 4 ? 'checked' : ''}><strong>${title}</strong></label><div id="upgrade-details-${key}" class="upgrade-details" hidden>${details}</div></section>`;
  $('#edit-fields').innerHTML = `<p class="muted">Choose ${count} different options for level ${c.level} → ${cycle.characters[c.id].targetLevel}.</p><p id="upgrade-count" class="upgrade-count" data-required="${count}" aria-live="polite"></p>${option('action','Add 1 action point',select('upgrade-action-target','Action',actions))}${option('drives','Add 2 drive points',`<p class="small-note">Put both points in one drive or split them. New points also increase your maximum and any newly earned resistance.</p><div class="form-grid">${select('upgrade-drive-one','First drive point',drives)}${select('upgrade-drive-two','Second drive point',drives)}</div>`)}${option('ability','Take a new ability from any class',abilityPicker(editAbilities,true)+customAbilityFields())}${option('gild','Gild an additional action',select('upgrade-gild-target','Action to gild',guild))}`;
  syncUpgradeChoices();
  $('#edit-dialog').showModal();
}
function syncUpgradeChoices() {
  if (editKind !== 'character-advance' || !$('#upgrade-count')) return;
  let count = 0;
  for (const key of ['action','drives','ability','gild']) {
    const checked = document.querySelector(`[name="upgrade-${key}"]`).checked;
    $(`#upgrade-details-${key}`).hidden = !checked;
    if (checked) count++;
  }
  const required = Number($('#upgrade-count').dataset.required);
  $('#upgrade-count').textContent = `${count} / ${required} options selected`;
  $('#save-edit').disabled = busy || count !== required;
}
function openCharacterEditor() {
  const c = character(); if (!c) return;
  editKind = 'character'; editBaseline = clone(c); editCharacterId = c.id;
  editAbilities = abilityChoices(c);
  $('#edit-title').textContent = `Edit ${c.name}`;
  $('#save-edit').textContent = 'Save changes';
  $('#save-edit').disabled = false;
  $('#edit-error').textContent = '';
  $('#edit-fields').innerHTML = `<h3>The investigator</h3><div class="form-grid">${field('Name','name',c.name,'text','maxlength="60" required')}${field('Pronouns','pronouns',c.pronouns,'text','maxlength="60"')}${field('Role','role',c.role,'text','maxlength="60"')}${field('Specialty','specialty',c.specialty,'text','maxlength="60"')}${field('Style','style',c.style,'textarea')}${field('Catalyst','catalyst',c.catalyst,'textarea')}${field('Question','question',c.question,'textarea')}</div><h3>Action ratings & gilded actions</h3><div class="edit-actions-grid">${Object.entries(ACTIONS).map(([key,a]) => `<div class="edit-action">${field(a.name,`rating-${key}`,c.actions[key].rating,'number','min="0" max="3" required')}<label class="checkbox-label"><input type="checkbox" name="gilded-${key}" ${c.actions[key].gilded ? 'checked' : ''}>Gilded</label></div>`).join('')}</div><h3>Drives & resistance</h3><div class="edit-drive edit-drive-labels"><span>Drive</span><span>Current</span><span>Maximum</span><span>Resistance</span></div>${DRIVES.map(d => `<div class="edit-drive"><span>${titleCase(d)}</span><input aria-label="${titleCase(d)} current" type="number" name="current-${d}" value="${c.drives[d].current}" min="0" max="12" required><input aria-label="${titleCase(d)} maximum" type="number" name="max-${d}" value="${c.drives[d].max}" min="0" max="12" required><input aria-label="${titleCase(d)} resistance" type="number" name="resistance-${d}" value="${c.drives[d].resistance}" min="0" max="4" required></div>`).join('')}<p class="small-note">Maximum resistance is the drive maximum divided by three, rounded down.</p><h3>Marks</h3><div class="edit-actions-grid">${['body','brain','bleed'].map(key => field(titleCase(key),`marks-${key}`,c.marks[key],'number','min="0" max="3" required')).join('')}</div><h3>Ability choices</h3>${abilityPicker(editAbilities)}<h3>Dossier</h3>${field('Scars','scars',c.scars,'textarea')}${field('Notes','notes',c.notes,'textarea')}${field('Relationships · one Name | Relation per line','relationships',c.relationships.map(r => `${r.name} | ${r.relation}`).join('\n'),'textarea')}`;
  $('#edit-dialog').showModal();
}
function openCircleEditor() {
  editKind = 'circle'; editBaseline = clone(circle);
  $('#save-edit').disabled = false;
  $('#edit-title').textContent = 'Edit Circle';
  $('#save-edit').textContent = 'Save changes'; $('#edit-error').textContent = '';
  $('#edit-fields').innerHTML = `<h3>Your Circle</h3><div class="form-grid">${field('Circle name','name',circle.name,'text','maxlength="60" required')}${field('Chapter house','chapterHouse',circle.chapterHouse,'text','maxlength="60"')}${field('Campaign tone','tone',circle.tone,'text','maxlength="60"')}${field('Campaign feel','feel',circle.feel,'text','maxlength="60"')}</div><h3>Illumination</h3><div class="form-grid">${field('Current illumination','illumination',circle.illumination,'number','min="0" max="100" required')}<p class="small-note">The track advances every 24 illumination. Entering more than 24 carries the remainder into the next level.</p></div><h3>Resources</h3><div class="edit-drive edit-drive-labels" style="grid-template-columns:1fr 90px 90px"><span>Resource</span><span>Current</span><span>Maximum</span></div>${Object.entries(circle.resources).map(([key,r]) => `<div class="edit-drive" style="grid-template-columns:1fr 90px 90px"><span>${titleCase(key)}</span><input aria-label="${titleCase(key)} current" type="number" name="resource-${key}" value="${r.current}" min="0" max="12" required><input aria-label="${titleCase(key)} maximum" type="number" name="resource-max-${key}" value="${r.max}" min="0" max="12" required></div>`).join('')}<h3>Stamina Training dice</h3><div class="form-grid">${field('Gilded dice remaining','gildedDice',circle.gildedDice,'number','min="0" max="12" required')}${field('Gilded dice per assignment','gildedDiceMax',circle.gildedDiceMax,'number','min="0" max="12" required')}</div><h3>Circle ability choices</h3>${abilityEditor(circle.abilities)}<h3>Circle notes</h3>${field('Notes','notes',circle.notes,'textarea')}`;
  $('#edit-dialog').showModal();
}
function openClearLog() {
  editKind = 'clear';
  $('#save-edit').disabled = false;
  $('#edit-title').textContent = 'Clear the table log';
  $('#save-edit').textContent = 'Clear log'; $('#edit-error').textContent = '';
  $('#edit-fields').innerHTML = '<p class="muted">This removes all rolls and conversation from this Circle for everyone. Character sheets, drives, resistance and Circle resources keep their current values.</p><p class="small-note">Export a backup first if you want to keep the log.</p>';
  $('#edit-dialog').showModal();
}
async function saveEditor(event) {
  event.preventDefault(); if (busy) return;
  const data = new FormData(event.currentTarget), value = key => data.get(key) ?? '', num = key => Number(value(key));
  const custom = { name:value('custom-ability-name'), role:value('custom-ability-role'), description:value('custom-ability-description') };
  const selectedAbilities = () => editAbilities.map(a=>({ ...a, selected:data.has(`ability-${a.id}`) })).filter(a=>a.selected || editBaseline.abilities.some(saved=>saved.id===a.id));
  busy = true; $('#save-edit').disabled = true; $('#edit-error').textContent = '';
  try {
    if (editKind === 'character') {
      const patch = {};
      for (const key of ['name','pronouns','role','specialty','style','catalyst','question','scars','notes']) patch[key] = value(key);
      patch.actions = Object.fromEntries(Object.keys(ACTIONS).map(key => [key,{ rating:num(`rating-${key}`), gilded:data.has(`gilded-${key}`) }]));
      patch.drives = Object.fromEntries(DRIVES.map(key => [key,{ current:num(`current-${key}`), max:num(`max-${key}`), resistance:num(`resistance-${key}`) }]));
      patch.marks = Object.fromEntries(['body','brain','bleed'].map(key => [key,num(`marks-${key}`)]));
      patch.abilities = selectedAbilities();
      patch.relationships = cleanText(value('relationships')).split('\n').filter(line => line.trim()).map(line => { const [name,...relation] = line.split('|'); return { name:cleanText(name,60), relation:cleanText(relation.join('|'),120) }; });
      await mutate(state => updateCharacter(state, editCharacterId, patch, editBaseline.version || 0));
    } else if (editKind === 'abilities') {
      await mutate(state=>manageCharacterAbilities(state,editCharacterId,selectedAbilities(),custom,editBaseline.version || 0));
    } else if (editKind === 'circle-advance') {
      await mutate(state=>chooseCircleAbility(state,editCycleId,value('new-circle-ability'),custom));
    } else if (editKind === 'character-advance') {
      const choices = {};
      if (data.has('upgrade-action')) choices.action = value('upgrade-action-target');
      if (data.has('upgrade-drives')) {
        choices.drives = Object.fromEntries(DRIVES.map(key=>[key,0]));
        for (const key of [value('upgrade-drive-one'),value('upgrade-drive-two')]) {
          if (!DRIVES.includes(key)) throw new Error('Choose a drive for each of the 2 points.');
          choices.drives[key]++;
        }
      }
      if (data.has('upgrade-ability')) choices.ability = value('chosen-ability') === '__custom__' ? { custom } : value('chosen-ability');
      if (data.has('upgrade-gild')) choices.gild = value('upgrade-gild-target');
      await mutate(state=>completeCharacterAdvance(state,{ cycleId:editCycleId,characterId:editCharacterId,choices,expectedVersion:editBaseline.version || 0 }));
    } else if (editKind === 'circle') {
      const patch = {};
      for (const key of ['name','chapterHouse','tone','feel','notes']) patch[key] = value(key);
      for (const key of ['illumination','gildedDice','gildedDiceMax']) patch[key] = num(key);
      patch.illuminationMax = 24;
      patch.resources = Object.fromEntries(['stitch','refresh','train'].map(key => [key,{ current:num(`resource-${key}`), max:num(`resource-max-${key}`) }]));
      patch.abilities = editBaseline.abilities.map(a => ({ ...a, selected:data.has(`ability-${a.id}`) }));
      await mutate(state => updateCircle(state, patch, editBaseline.revision || 0));
    } else if (editKind === 'clear') {
      await mutate(state => { state.events = {}; }); latestId = null;
    }
    $('#edit-dialog').close(); toast(editKind === 'clear' ? 'Table log cleared.' : editKind === 'circle-advance' ? 'Circle ability chosen. Character upgrades are ready.' : editKind === 'character-advance' ? 'Advancement saved.' : 'Changes saved.');
    if (seat) {
      try { await store.setPresence(circle.id, character()?.name || 'Lightkeeper', seat); }
      catch (error) { presenceStatus(error); }
    }
  } catch (error) { $('#edit-error').textContent = friendlyError(error); }
  finally { busy = false; $('#save-edit').disabled = false; if (seat) renderTable(); if ($('#edit-dialog').open) syncUpgradeChoices(); }
}
function exportBackup() {
  const blob = new Blob([JSON.stringify(circle,null,2)],{ type:'application/json' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = `candela-${circle.id}-${new Date().toISOString().slice(0,10)}.json`;
  a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-command]');
  if (!button || button.disabled) return;
  const d = button.dataset;
  try {
    if (d.command === 'circle') return await openCircle(d.circle);
    if (d.command === 'home') return await goHome();
    if (d.command === 'roster') return await showRoster();
    if (d.command === 'seat') return await selectSeat(d.character);
    if (d.command === 'tab') { activeTab = d.tab; renderTable(); return; }
    if (d.command === 'action') {
      action = d.action;
      $('#drive-spend').value = '0'; $('#extra-gilded').value = '0';
      renderTable();
      if (matchMedia('(max-width:700px)').matches) $('.roller-column').scrollIntoView({ behavior:'smooth', block:'start' });
      return;
    }
    if (d.command === 'edit-character') return openCharacterEditor();
    if (d.command === 'manage-abilities') return openAbilityManager();
    if (d.command === 'circle-advance') return openCircleAdvancement(d.cycle);
    if (d.command === 'character-advance') return openCharacterAdvancement(d.cycle);
    if (d.command === 'gild-die') return toggleGildedDie(Number(d.index));
    if (d.command === 'edit-circle') return openCircleEditor();
    if (d.command === 'clear-log') return openClearLog();
    if (d.command === 'close-dialog') { if (!busy) $('#edit-dialog').close(); return; }
    if (d.command === 'close-help') { $('#help-dialog').close(); return; }
    if (d.command === 'backup') { exportBackup(); return; }
    if (d.command === 'invite') {
      const link = currentURL(false).href;
      try { await navigator.clipboard.writeText(link); toast(store.mode === 'local' ? 'Link copied. Friends can share the table after Firebase setup.' : 'Circle link copied. Send it to your group.'); }
      catch { toast(`Your Circle link: ${link}`); }
      return;
    }
    if (d.command === 'adjust') return await run(() => mutate(state => adjustTrack(state,{ characterId:d.character, group:d.group, key:d.key, field:d.field, delta:Number(d.delta) })));
    if (d.command === 'gear') return await run(() => mutate(state => toggleGear(state,d.character,d.gear)));
    if (d.command === 'select-result') return await run(() => mutate(state => selectResult(state,d.roll,store.uid,Number(d.index))));
    if (d.command === 'confirm-result') return await run(() => mutate(state => confirmResult(state,d.roll,store.uid)));
    if (d.command === 'resist') {
      const newId = id(), parentId = d.roll, randomDice = Array.from({ length:3 },secureD6);
      return await run(() => mutate(state => resistRoll(state,{ id:newId, parentId, uid:store.uid, randomDice, createdAt:Date.now() })));
    }
  } catch (error) { toast(friendlyError(error),true); }
});

$('#roll-button').addEventListener('click', () => run(makeRoll));
for (const name of [...inputNames,'circle-die','gm-rating','gm-gilded']) $(`#${name}`).addEventListener('change',syncRollControls);
$('#edit-form').addEventListener('submit',saveEditor);
$('#edit-form').addEventListener('input', event=> { if (event.target.id === 'ability-search') filterAbilities(); });
$('#edit-form').addEventListener('change', event=> {
  if (event.target.id === 'ability-role-filter') filterAbilities();
  if (event.target.dataset.upgrade) syncUpgradeChoices();
});
$('#edit-dialog').addEventListener('cancel',event => { if (busy) event.preventDefault(); });
$('#help-button').addEventListener('click',() => $('#help-dialog').showModal());
$('#chat-form').addEventListener('submit',async event => {
  event.preventDefault(); const message = cleanText($('#chat-input').value,500); if (!message) return;
  const messageId = id(), author = character()?.name || 'Lightkeeper';
  await run(async () => { await mutate(state => addChat(state,{ id:messageId, uid:store.uid, author, message, createdAt:Date.now() })); $('#chat-input').value = ''; });
});

async function boot() {
  try {
    store = await createStore(status, presenceStatus);
    $('#mode-banner').hidden = store.mode !== 'local';
    renderLibrary();
    const query = new URLSearchParams(location.search), target = query.get('circle');
    if (target) await openCircle(target,query.get('character'));
  } catch (error) {
    status('Could not connect','error');
    $('#opening-error').textContent = `${friendlyError(error)} Reload this page after correcting the setup.`;
    renderLibrary();
  }
}
boot();
