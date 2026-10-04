import { clone, cleanText } from './core.js?v=2';

export const ARTICLE_AUTHORS = ['keith', 'wysel'];
export const FIRST_ARTICLE = {
  id: 'wysel-blazing-family-home',
  authorId: 'wysel',
  title: 'The Blazing Family Home: The Unsolved Fire of Jack Robbins’ Home.',
  publication: 'The Queen’s Gambit News',
  dateLabel: '',
  imagePath: './assets/articles/wyselBlazing.png',
  version: 0,
  createdAt: 0,
  updatedAt: 0,
};

export function migrateArticles(state) {
  state.articles ||= {};
  if (!(state.articleArchiveVersion >= 1)) {
    if (state.id === 'the-prophets' && !state.articles[FIRST_ARTICLE.id]) {
      state.articles[FIRST_ARTICLE.id] = clone(FIRST_ARTICLE);
    }
    // Firebase removes empty objects. Keep this scalar even when all articles
    // are removed so reopening the Circle never restores a deleted example.
    state.articleArchiveVersion = 1;
  }
  return state;
}

export function articleImagePath(value) {
  const path = cleanText(value, 2000);
  if (!path || /[\u0000-\u001f\\]/.test(path) || path.startsWith('//')) {
    throw new Error('Enter a GitHub image path or an HTTPS image URL.');
  }
  let url;
  try { url = new URL(path, 'https://candela.invalid/project/'); }
  catch { throw new Error('That image path is not valid.'); }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('Use an HTTPS image URL or a relative GitHub image path.');
  }
  if (!/^https:/i.test(path) && !/\.(png|jpe?g|webp)$/i.test(url.pathname)) {
    throw new Error('Use a PNG, JPG, or WebP image, such as ./assets/articles/new-article.png.');
  }
  return path;
}

function details(state, input) {
  if (!ARTICLE_AUTHORS.includes(input.authorId) || !state.characters?.[input.authorId]) {
    throw new Error('Choose Keith or Wysel as the author.');
  }
  return {
    authorId: input.authorId,
    title: cleanText(input.title, 160),
    publication: cleanText(input.publication, 100),
    dateLabel: cleanText(input.dateLabel, 60),
    imagePath: articleImagePath(input.imagePath),
  };
}

export function listArticles(state, authorId = '') {
  return Object.values(state.articles || {})
    .filter(article => article && (!authorId || article.authorId === authorId))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0) || (a.title || '').localeCompare(b.title || ''));
}

export function addArticle(state, input, createdAt = Date.now()) {
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(input.id || '')) throw new Error('This article needs a valid ID.');
  if (state.articles?.[input.id]) return state.articles[input.id];
  const record = { ...details(state, input), id: input.id, version: 0, createdAt, updatedAt: createdAt };
  state.articles ||= {};
  state.articles[input.id] = record;
  return record;
}

export function updateArticle(state, articleId, input, expectedVersion, updatedAt = Date.now()) {
  const current = state.articles?.[articleId];
  if (!current) throw new Error('This article was removed. Close the editor and reload the archive.');
  if ((current.version || 0) !== expectedVersion) {
    throw new Error('Someone changed this article. Close and reopen the editor to use the latest version.');
  }
  const record = { ...current, ...details(state, input), version: (current.version || 0) + 1, updatedAt };
  state.articles[articleId] = record;
  return record;
}

export function removeArticle(state, articleId, expectedVersion) {
  const current = state.articles?.[articleId];
  if (!current) return;
  if ((current.version || 0) !== expectedVersion) {
    throw new Error('Someone changed this article. Close and reopen the archive before removing it.');
  }
  delete state.articles[articleId];
}
