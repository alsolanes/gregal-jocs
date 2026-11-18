const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pkg = require('./package.json');

test('Gregal Jocs ships without a backend, from its own releases repo, on the jocs channel', () => {
  const jocs = require('./electron-builder-jocs.js');
  assert.deepEqual(jocs.win.target, ['nsis', 'portable']);
  assert.notEqual(jocs.nsis.artifactName, jocs.portable.artifactName);
  assert.equal(jocs.extraMetadata.gregalEdition, 'jocs');
  assert.equal(jocs.publish.provider, 'github');
  assert.equal(jocs.publish.owner, 'alsolanes');
  assert.equal(jocs.publish.channel, 'jocs');
  assert.equal(jocs.publish.repo, 'gregal-jocs');
  assert.equal(jocs.extraResources.find(r => r.to === 'backend'), undefined, 'the installer downloads gregal-jocs instead of bundling it');
  assert.ok(jocs.files.includes('backend-download.js'), 'main.js requires it');
  assert.ok(jocs.files.includes('updater.js'), 'the update controller must ship with the app');
  assert.equal(require('./backend-download').JOCS_RELEASES_REPO, 'alsolanes/' + jocs.publish.repo, 'the app downloads from where the installer is published');
  assert.match(pkg.scripts['dist-win'], /electron-builder --config electron-builder-jocs\.js/);
});

test('desktop, lockfile and backend version agree', () => {
  assert.equal(require('./package-lock.json').version, pkg.version);
  assert.equal(require('./package-lock.json').packages[''].version, pkg.version);
  const main = fs.readFileSync(path.join(__dirname, '..', 'cmd', 'gregal-jocs', 'main.go'), 'utf8');
  assert.ok(main.includes(`var version = "v${pkg.version}"`), 'the Gregal Jocs backend has the same version');
});
