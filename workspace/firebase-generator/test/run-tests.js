'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const generator = require('../src/generator');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  PASS  ' + name);
  } catch (err) {
    failed++;
    console.log('  FAIL  ' + name);
    console.log('        ' + err.message);
  }
}

console.log('Running firebase-generator tests\n');

test('normalizeOptions requires projectId', () => {
  assert.throws(() => generator.normalizeOptions({}), /projectId is required/);
});

test('normalizeOptions rejects invalid projectId', () => {
  assert.throws(
    () => generator.normalizeOptions({ projectId: 'Bad_Id!' }),
    /lowercase/
  );
});

test('normalizeOptions defaults to hosting feature', () => {
  const o = generator.normalizeOptions({ projectId: 'my-app' });
  assert.deepStrictEqual(o.features, ['hosting']);
});

test('normalizeOptions rejects unknown feature', () => {
  assert.throws(
    () =>
      generator.normalizeOptions({
        projectId: 'my-app',
        features: ['hosting', 'nope']
      }),
    /Unknown feature/
  );
});

test('normalizeOptions dedupes features', () => {
  const o = generator.normalizeOptions({
    projectId: 'my-app',
    features: ['hosting', 'hosting', 'firestore']
  });
  assert.deepStrictEqual(o.features, ['hosting', 'firestore']);
});

test('buildFileMap always includes core files', () => {
  const files = generator.buildFileMap({
    projectId: 'my-app',
    features: ['hosting']
  });
  assert.ok(files['firebase.json']);
  assert.ok(files['.firebaserc']);
  assert.ok(files['.gitignore']);
  assert.ok(files['README.md']);
});

test('.firebaserc contains the project id', () => {
  const files = generator.buildFileMap({
    projectId: 'cool-project',
    features: ['hosting']
  });
  const rc = JSON.parse(files['.firebaserc']);
  assert.strictEqual(rc.projects.default, 'cool-project');
});

test('firestore feature adds rules and indexes', () => {
  const files = generator.buildFileMap({
    projectId: 'my-app',
    features: ['firestore']
  });
  assert.ok(files['firestore.rules']);
  assert.ok(files['firestore.indexes.json']);
  const fbJson = JSON.parse(files['firebase.json']);
  assert.strictEqual(fbJson.firestore.rules, 'firestore.rules');
});

test('functions feature adds functions files', () => {
  const files = generator.buildFileMap({
    projectId: 'my-app',
    features: ['functions']
  });
  assert.ok(files[path.join('functions', 'index.js')]);
  assert.ok(files[path.join('functions', 'package.json')]);
});

test('hosting feature adds public/index.html', () => {
  const files = generator.buildFileMap({
    projectId: 'my-app',
    features: ['hosting']
  });
  assert.ok(files[path.join('public', 'index.html')]);
  assert.ok(files[path.join('public', 'index.html')].includes('my-app'));
});

test('emulators feature configures ports', () => {
  const files = generator.buildFileMap({
    projectId: 'my-app',
    features: ['emulators']
  });
  const fbJson = JSON.parse(files['firebase.json']);
  assert.strictEqual(fbJson.emulators.firestore.port, 8080);
});

test('generate writes files to disk', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fbgen-'));
  const written = generator.generate({
    projectId: 'disk-app',
    features: ['hosting', 'firestore', 'functions'],
    outDir: tmp
  });
  assert.ok(written.length > 0);
  assert.ok(fs.existsSync(path.join(tmp, 'firebase.json')));
  assert.ok(fs.existsSync(path.join(tmp, 'firestore.rules')));
  assert.ok(fs.existsSync(path.join(tmp, 'functions', 'index.js')));
  fs.rmSync(tmp, { recursive: true, force: true });
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
