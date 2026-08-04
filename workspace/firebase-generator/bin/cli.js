#!/usr/bin/env node
'use strict';

const path = require('path');
const generator = require('../src/generator');

function parseArgs(argv) {
  const args = { features: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      args.help = true;
    } else if (a === '--project' || a === '-p') {
      args.projectId = argv[++i];
    } else if (a === '--features' || a === '-f') {
      args.features = String(argv[++i] || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    } else if (a === '--out' || a === '-o') {
      args.outDir = argv[++i];
    } else if (!args.projectId && !a.startsWith('-')) {
      // allow bare project id as first positional arg
      args.projectId = a;
    }
  }
  return args;
}

function printHelp() {
  console.log(`firebase-generator - scaffold a Firebase project

Usage:
  firebase-generator <projectId> [options]

Options:
  -p, --project <id>        Firebase project id (lowercase, digits, hyphens)
  -f, --features <list>     Comma separated: ${generator.ALL_FEATURES.join(', ')}
  -o, --out <dir>           Output directory (default: current directory)
  -h, --help                Show this help

Example:
  firebase-generator my-app -f hosting,firestore,functions -o ./my-app
`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.projectId) {
    printHelp();
    process.exit(args.help ? 0 : 1);
    return;
  }

  try {
    const outDir = args.outDir
      ? path.resolve(process.cwd(), args.outDir)
      : path.resolve(process.cwd(), args.projectId);

    const written = generator.generate({
      projectId: args.projectId,
      features: args.features,
      outDir: outDir
    });

    console.log('Generated Firebase project in: ' + outDir);
    written.forEach(f => console.log('  + ' + f));
    console.log('\nNext steps:');
    console.log('  cd ' + args.projectId);
    console.log('  firebase login');
    console.log('  firebase deploy');
  } catch (err) {
    console.error('Error: ' + err.message);
    process.exit(1);
  }
}

main();
