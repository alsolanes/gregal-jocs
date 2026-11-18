const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

// Les llibreries de tercers que fan servir els jocs, fixades al byte.
const vendor = path.join(__dirname, '..', 'web', 'app', 'vendor');
const artifacts = [
  ['mp4-muxer.esm.min.js', '9635E0A6CDB08BE2CC8F6156B7DF70C1B9F405D4E6968B013A59369C69ECFA7D'],
  ['three.module.min.js', 'EA0B317604D082B1393CB2BBE5C6E5F97884A3B66EAA55CF55D89104F8779A2A'],
];

for (const [name, expected] of artifacts) {
  const source = fs.readFileSync(path.join(vendor, name));
  const actual = crypto.createHash('sha256').update(source).digest('hex').toUpperCase();
  assert.equal(actual, expected, `${name} differs from the reviewed upstream artifact`);
}

// three.js: one self-contained ES module (no imports left after bundling) of revision 187.
const three = fs.readFileSync(path.join(vendor, 'three.module.min.js'), 'utf8');
assert.ok(!/from\s*["']\.\/three\./.test(three), 'three.module.min.js must not import other files');
assert.ok(three.includes('="187"'), 'three.module.min.js is not revision 187');
for (const name of ['WebGLRenderer', 'InstancedMesh', 'PerspectiveCamera', 'CanvasTexture']) {
  assert.match(three, new RegExp(' as ' + name + '[,}]'), 'three.module.min.js does not export ' + name);
}

console.log('Vendor artifact pins and three.js exports passed.');
