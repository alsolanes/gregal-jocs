#!/usr/bin/env node
// Releases de Gregal Jocs (alsolanes/gregal-jocs). GitHub Actions no hi
// corre: tot es construeix en aquesta màquina, amb ../gregal al costat.
//
//   node scripts/release.cjs check
//       La versió de cmd/gregal-jocs/main.go, desktop/package.json i el seu
//       lock coincideixen.
//   node scripts/release.cjs bump 1.9.1
//       Les posa totes a 1.9.1.
//   node scripts/release.cjs publish 1.9.1
//       Compila el backend gregal-jocs i l'instal·lador (que no el porta
//       dins), i publica com a «latest» els instal·ladors, jocs.yml, el
//       backend i el seu manifest (gregal-jocs-backend.json), que l'app llegeix
//       per baixar-lo en obrir-se.
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const REPO = 'alsolanes/gregal-jocs';
const SEMVER = /^\d+\.\d+\.\d+$/;
const FILES = {
  main: 'cmd/gregal-jocs/main.go',
  pkg: 'desktop/package.json',
  lock: 'desktop/package-lock.json',
};
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, text) => fs.writeFileSync(path.join(root, rel), text);

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function versions() {
  const m = /var version = "v(\d+\.\d+\.\d+)"/.exec(read(FILES.main));
  const lock = JSON.parse(read(FILES.lock));
  return { main: m && m[1], pkg: JSON.parse(read(FILES.pkg)).version, lock: lock.version, lockRoot: lock.packages[''].version };
}

function check() {
  const v = versions();
  const bad = Object.entries(v).filter(([, x]) => x !== v.main);
  if (!v.main || bad.length) fail('versions differ: ' + JSON.stringify(v));
  return v.main;
}

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

const [cmd, value] = process.argv.slice(2);

if (cmd === 'check') {
  console.log('release metadata OK: v' + check());
} else if (cmd === 'bump') {
  if (!SEMVER.test(value || '')) fail('usage: release.cjs bump X.Y.Z');
  write(FILES.main, read(FILES.main).replace(/var version = "v\d+\.\d+\.\d+"/, `var version = "v${value}"`));
  const pkg = JSON.parse(read(FILES.pkg));
  pkg.version = value;
  write(FILES.pkg, JSON.stringify(pkg, null, 2) + '\n');
  const lock = JSON.parse(read(FILES.lock));
  lock.version = value;
  lock.packages[''].version = value;
  write(FILES.lock, JSON.stringify(lock, null, 2) + '\n');
  console.log(`v${check()}. Next: commit, tag v${value}, push, then: node scripts/release.cjs publish ${value}`);
} else if (cmd === 'publish') {
  if (!SEMVER.test(value || '')) fail('usage: release.cjs publish X.Y.Z');
  const v = check();
  if (v !== value) fail(`the code is at ${v}: run bump ${value} first (or publish ${v}).`);
  const desktop = path.join(root, 'desktop');
  const dir = path.join(root, 'output', `release-${value}`);
  const run = (file, args, cwd) => execFileSync(file, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  console.log(`building Gregal Jocs ${value} (backend + installer)…`);
  run('npm', ['run', 'dist-win', '--', `--config.directories.output=${dir}`], desktop);
  run('node', ['verify-release.js', dir, '--jocs'], desktop);
  // El backend va a la release al costat de l'instal·lador, amb el seu manifest.
  const backendName = `gregal-jocs-${value}-win32-x64.exe`;
  const backendFile = path.join(dir, backendName);
  fs.copyFileSync(path.join(desktop, 'backend-jocs', 'gregal-jocs.exe'), backendFile);
  const buf = fs.readFileSync(backendFile);
  const backendManifest = { version: value, files: { 'win32-x64': { name: backendName, sha256: crypto.createHash('sha256').update(buf).digest('hex'), size: buf.length } } };
  fs.writeFileSync(path.join(dir, 'gregal-jocs-backend.json'), JSON.stringify(backendManifest, null, 2) + '\n');
  console.log(`  ${backendName}  ${(buf.length / 1048576).toFixed(1)} MiB`);
  const assets = [`Gregal-Jocs-Setup-${value}-x64.exe`, `Gregal-Jocs-Setup-${value}-x64.exe.blockmap`, `Gregal-Jocs-Portable-${value}-x64.exe`, 'jocs.yml', backendName, 'gregal-jocs-backend.json'].map(f => path.join(dir, f));
  for (const f of assets) if (!fs.existsSync(f)) fail('missing ' + f);
  const self = git(['rev-parse', '--short', 'HEAD'], root);
  const gregal = git(['rev-parse', '--short', 'HEAD'], path.join(root, '..', 'gregal'));
  const notes = `Gregal Jocs v${value}, construït des de ${REPO}@${self} amb alsolanes/gregal@${gregal}.\n\nL'instal·lador és lleuger: la primera vegada que s'obre, l'app baixa el seu motor (${backendName}) d'aquesta mateixa release.`;
  execFileSync('gh', ['release', 'create', 'v' + value, '--repo', REPO, '--draft', '--title', `Gregal Jocs v${value}`, '--notes', notes, ...assets], { cwd: root, stdio: 'inherit' });
  execFileSync('gh', ['release', 'edit', 'v' + value, '--repo', REPO, '--draft=false', '--latest'], { cwd: root, stdio: 'inherit' });
  console.log(`published Gregal Jocs v${value} at https://github.com/${REPO}/releases/tag/v${value}`);
} else {
  fail('usage: release.cjs check | bump X.Y.Z | publish X.Y.Z');
}
