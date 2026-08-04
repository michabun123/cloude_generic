# firebase-generator

A small, dependency-free Node.js CLI that scaffolds a Firebase project:
`firebase.json`, `.firebaserc`, security rules, Cloud Functions boilerplate,
Hosting starter page, and emulator configuration.

## Install / run

```bash
node bin/cli.js my-app -f hosting,firestore,functions
```

Or via npm scripts:

```bash
npm start -- my-app -f hosting,firestore,functions,storage,emulators
```

## Usage

```
firebase-generator <projectId> [options]

  -p, --project <id>      Firebase project id (lowercase, digits, hyphens)
  -f, --features <list>   Comma separated: hosting, firestore, functions, storage, emulators
  -o, --out <dir>         Output directory (default: ./<projectId>)
  -h, --help              Show help
```

## Features

| Feature    | Generated files                                   |
|------------|---------------------------------------------------|
| hosting    | `public/index.html` + hosting config              |
| firestore  | `firestore.rules`, `firestore.indexes.json`       |
| functions  | `functions/index.js`, `functions/package.json`    |
| storage    | `storage.rules`                                   |
| emulators  | emulator ports in `firebase.json`                 |

Core files (`firebase.json`, `.firebaserc`, `.gitignore`, `README.md`) are always created.

## Test

```bash
npm test
```
