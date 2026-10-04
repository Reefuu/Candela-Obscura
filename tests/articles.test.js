import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGNS } from '../campaign-data.js';
import { clone } from '../core.js';
import { FIRST_ARTICLE, migrateArticles, articleImagePath, listArticles, addArticle, updateArticle, removeArticle } from '../articles.js';

const seed = () => migrateArticles(clone(CAMPAIGNS[0]));
const article = (id = 'keith-report') => ({ id, authorId: 'keith', title: 'The investigation',
  publication: 'Newfaire Gazette', dateLabel: 'Issue 12', imagePath: './assets/articles/keith-report.jpg' });

test('existing Circles gain Wysel’s article without changing live sheets or activity', () => {
  const state = clone(CAMPAIGNS[0]);
  state.characters.jack.portrait = './assets/custom-jack.jpg';
  state.characters.keith.notes = 'Keep these notes.';
  state.events = { existing: { type: 'chat', message: 'Keep this log.' } };
  const before = clone(state);
  migrateArticles(state);
  assert.deepEqual(state, { ...before, articleArchiveVersion: 1, articles: { [FIRST_ARTICLE.id]: FIRST_ARTICLE } });
  assert.equal(state.articles[FIRST_ARTICLE.id].dateLabel, '');
  assert.notEqual(state.articles[FIRST_ARTICLE.id], FIRST_ARTICLE);
});

test('migration preserves edited articles and additions on every reopen', () => {
  const state = seed();
  updateArticle(state, FIRST_ARTICLE.id, { ...FIRST_ARTICLE, title: 'A corrected title' }, 0, 10);
  addArticle(state, article(), 20);
  const before = clone(state);
  migrateArticles(state); migrateArticles(state);
  assert.deepEqual(state, before);
});

test('removing every article persists even when Firebase drops the empty archive object', () => {
  const state = seed();
  removeArticle(state, FIRST_ARTICLE.id, 0);
  delete state.articles;
  migrateArticles(state);
  assert.deepEqual(state.articles, {});
  assert.equal(state.articleArchiveVersion, 1);
});

test('the example is scoped to The Prophets and preserves an existing imported record', () => {
  const state = clone(CAMPAIGNS[0]); state.id = 'another-circle';
  migrateArticles(state);
  assert.deepEqual(state.articles, {});
  const existing = clone(CAMPAIGNS[0]);
  existing.articles = { [FIRST_ARTICLE.id]: { ...FIRST_ARTICLE, title: 'Already imported' } };
  migrateArticles(existing);
  assert.equal(existing.articles[FIRST_ARTICLE.id].title, 'Already imported');
});

test('both writers can add optional metadata and filter the archive in newest-first order', () => {
  const state = seed();
  addArticle(state, article(), 100);
  addArticle(state, { ...article('wysel-next'), authorId: 'wysel', title: '', publication: '', dateLabel: '' }, 200);
  assert.deepEqual(listArticles(state).map(a => a.id), ['wysel-next', 'keith-report', FIRST_ARTICLE.id]);
  assert.deepEqual(listArticles(state, 'keith').map(a => a.id), ['keith-report']);
  assert.deepEqual(listArticles(state, 'wysel').map(a => a.id), ['wysel-next', FIRST_ARTICLE.id]);
  assert.deepEqual(state.events || {}, {});
});

test('a retried add cannot duplicate or replace an existing article', () => {
  const state = seed();
  addArticle(state, article(), 10);
  addArticle(state, { ...article(), title: 'Do not replace', authorId: 'wysel' }, 20);
  assert.equal(state.articles['keith-report'].title, 'The investigation');
  assert.equal(state.articles['keith-report'].createdAt, 10);
  assert.equal(listArticles(state).length, 2);
});

test('stale article edits and removals cannot overwrite a newer shared change', () => {
  const state = seed();
  addArticle(state, article(), 10);
  updateArticle(state, 'keith-report', { ...article(), title: 'Current title' }, 0, 20);
  const current = clone(state);
  assert.throws(() => updateArticle(state, 'keith-report', { ...article(), title: 'Stale' }, 0), /Someone changed/);
  assert.throws(() => removeArticle(state, 'keith-report', 0), /Someone changed/);
  assert.deepEqual(state, current);
  assert.equal(state.articles['keith-report'].createdAt, 10);
  removeArticle(state, 'keith-report', 1);
  removeArticle(state, 'keith-report', 1);
  assert.throws(() => updateArticle(state, 'keith-report', article(), 1), /removed/);
});

test('unsupported authors, unsafe paths, and invalid IDs leave the archive unchanged', () => {
  const state = seed(), before = clone(state);
  for (const input of [
    { ...article(), authorId: 'jack' }, { ...article(), id: 'bad.id' },
    { ...article(), imagePath: 'javascript:alert(1)' }, { ...article(), imagePath: 'data:image/png;base64,abcd' },
    { ...article(), imagePath: 'http://example.com/page.png' }, { ...article(), imagePath: './page.html' },
  ]) assert.throws(() => addArticle(state, input));
  assert.deepEqual(state, before);
  assert.throws(() => updateArticle(state, FIRST_ARTICLE.id, { ...FIRST_ARTICLE, imagePath: 'blob:bad' }, 0));
  assert.deepEqual(state, before);
});

test('image paths retain their exact case and external signed parameters', () => {
  for (const path of ['./assets/articles/WyselBlazing.PNG', 'assets/articles/issue 2.jpg?v=2#page',
    'https://images.example.com/export?signature=unchanged']) assert.equal(articleImagePath(path), path);
  for (const path of ['', '//example.com/image.png', 'https://user:password@example.com/image.png', './assets\\image.png']) {
    assert.throws(() => articleImagePath(path));
  }
});

test('clearing the table log and reopening preserves the archive and its version marker', () => {
  const state = seed(); addArticle(state, article(), 20);
  state.events = { log: { type: 'chat', message: 'Clear me' } };
  const before = clone(state.articles);
  state.events = {};
  migrateArticles(state);
  assert.deepEqual(state.articles, before);
  assert.equal(state.articleArchiveVersion, 1);
  assert.deepEqual(state.events, {});
});
