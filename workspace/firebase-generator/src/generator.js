'use strict';

const fs = require('fs');
const path = require('path');
const templates = require('./templates');

const ALL_FEATURES = [
  'hosting',
  'firestore',
  'functions',
  'storage',
  'emulators'
];

/**
 * Validate and normalize generator options.
 * @param {object} raw
 * @returns {{projectId: string, features: string[], outDir: string}}
 */
function normalizeOptions(raw) {
  const opts = raw || {};

  const projectId = (opts.projectId || '').trim();
  if (!projectId) {
    throw new Error('projectId is required');
  }
  if (!/^[a-z0-9-]+$/.test(projectId)) {
    throw new Error(
      'projectId may only contain lowercase letters, numbers and hyphens'
    );
  }

  let features = opts.features && opts.features.length
    ? opts.features
    : ['hosting'];

  features = features.map(f => String(f).toLowerCase().trim());

  const invalid = features.filter(f => !ALL_FEATURES.includes(f));
  if (invalid.length) {
    throw new Error(
      'Unknown feature(s): ' +
        invalid.join(', ') +
        '. Valid features: ' +
        ALL_FEATURES.join(', ')
    );
  }

  // dedupe while preserving order
  features = features.filter((f, i) => features.indexOf(f) === i);

  return {
    projectId,
    features,
    outDir: opts.outDir || process.cwd()
  };
}

/**
 * Build an in-memory map of relative file path -> contents.
 * This is pure so it can be unit tested without touching the disk.
 */
function buildFileMap(options) {
  const files = {};

  files['firebase.json'] = templates.firebaseJson(options);
  files['.firebaserc'] = templates.firebaseRc(options);
  files['.gitignore'] = templates.gitignore();
  files['README.md'] = templates.readme(options);

  if (options.features.includes('firestore')) {
    files['firestore.rules'] = templates.firestoreRules();
    files['firestore.indexes.json'] = templates.firestoreIndexes();
  }

  if (options.features.includes('storage')) {
    files['storage.rules'] = templates.storageRules();
  }

  if (options.features.includes('functions')) {
    files[path.join('functions', 'index.js')] = templates.functionsIndex();
    files[path.join('functions', 'package.json')] =
      templates.functionsPackageJson(options);
  }

  if (options.features.includes('hosting')) {
    files[path.join('public', 'index.html')] =
      templates.hostingIndexHtml(options);
  }

  return files;
}

/**
 * Write generated files to disk.
 * @returns {string[]} list of written file paths (relative)
 */
function generate(rawOptions) {
  const options = normalizeOptions(rawOptions);
  const files = buildFileMap(options);
  const written = [];

  Object.keys(files).forEach(rel => {
    const full = path.join(options.outDir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, files[rel]);
    written.push(rel);
  });

  return written.sort();
}

module.exports = {
  ALL_FEATURES,
  normalizeOptions,
  buildFileMap,
  generate
};
