'use strict';

/**
 * Template builders for Firebase project files.
 * Each function returns a string with the file contents.
 */

function firebaseJson(options) {
  const config = {};

  if (options.features.includes('hosting')) {
    config.hosting = {
      public: 'public',
      ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
      rewrites: [{ source: '**', destination: '/index.html' }]
    };
  }

  if (options.features.includes('firestore')) {
    config.firestore = {
      rules: 'firestore.rules',
      indexes: 'firestore.indexes.json'
    };
  }

  if (options.features.includes('functions')) {
    config.functions = {
      source: 'functions',
      runtime: 'nodejs18'
    };
  }

  if (options.features.includes('storage')) {
    config.storage = { rules: 'storage.rules' };
  }

  if (options.features.includes('emulators')) {
    config.emulators = {
      auth: { port: 9099 },
      functions: { port: 5001 },
      firestore: { port: 8080 },
      hosting: { port: 5000 },
      storage: { port: 9199 },
      ui: { enabled: true }
    };
  }

  return JSON.stringify(config, null, 2) + '\n';
}

function firebaseRc(options) {
  return JSON.stringify(
    {
      projects: {
        default: options.projectId
      }
    },
    null,
    2
  ) + '\n';
}

function firestoreRules() {
  return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny all access by default. Tighten or loosen for your app.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;
}

function firestoreIndexes() {
  return JSON.stringify({ indexes: [], fieldOverrides: [] }, null, 2) + '\n';
}

function storageRules() {
  return `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
`;
}

function functionsIndex() {
  return `'use strict';

const functions = require('firebase-functions');

exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send('Hello from Firebase!');
});
`;
}

function functionsPackageJson(options) {
  return JSON.stringify(
    {
      name: options.projectId + '-functions',
      description: 'Cloud Functions for Firebase',
      main: 'index.js',
      engines: { node: '18' },
      dependencies: {
        'firebase-admin': '^12.0.0',
        'firebase-functions': '^4.5.0'
      },
      private: true
    },
    null,
    2
  ) + '\n';
}

function hostingIndexHtml(options) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${options.projectId}</title>
</head>
<body>
  <h1>Welcome to ${options.projectId}</h1>
  <p>Firebase Hosting is set up and ready.</p>
</body>
</html>
`;
}

function gitignore() {
  return `node_modules/
.firebase/
*.log
.env
.DS_Store
functions/node_modules/
`;
}

function readme(options) {
  return `# ${options.projectId}

Generated with **firebase-generator**.

## Features
${options.features.map(f => `- ${f}`).join('\n')}

## Getting started

\`\`\`bash
firebase login
firebase deploy
\`\`\`

${options.features.includes('emulators') ? 'Run locally with `firebase emulators:start`.\n' : ''}`;
}

module.exports = {
  firebaseJson,
  firebaseRc,
  firestoreRules,
  firestoreIndexes,
  storageRules,
  functionsIndex,
  functionsPackageJson,
  hostingIndexHtml,
  gitignore,
  readme
};
