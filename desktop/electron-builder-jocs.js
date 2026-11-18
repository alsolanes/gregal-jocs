// Gregal Jocs: el mateix projecte que Gregal, empaquetat com una app a part
// (una altra appId, un altre nom, els seus instal·ladors i el seu canal
// d'actualitzacions, jocs.yml). main.js llegeix gregalEdition i només obre /jocs/.
//
// Les releases i el codi viuen a alsolanes/gregal-jocs; el servidor és el
// de Gregal (gregal/host, ../gregal). Gregal i Jocs tenen cadascun el seu
// «latest» i no cal copiar fitxers d'una release a l'altra.
//
// L'instal·lador NO porta el backend: gregal-jocs(.exe) (cmd/gregal-jocs)
// es penja a la mateixa release i l'app el baixa la primera vegada que s'obre
// (backend-download.js). scripts/release.cjs X.Y.Z ho fa tot.
// Ús: npx electron-builder --config electron-builder-jocs.js --win nsis portable --publish never
const base = require('./package.json').build;

module.exports = {
  ...base,
  appId: 'xyz.solanes.gregal.jocs',
  productName: 'Gregal Jocs',
  extraMetadata: { name: 'gregal-jocs', productName: 'Gregal Jocs', gregalEdition: 'jocs' },
  extraResources: base.extraResources.filter(r => r.from !== 'backend'),
  publish: { ...base.publish, repo: 'gregal-jocs', channel: 'jocs' },
  nsis: {
    ...base.nsis,
    artifactName: 'Gregal-Jocs-Setup-${version}-${arch}.${ext}',
    include: 'build/installer-jocs.nsh',
    shortcutName: 'Gregal Jocs',
  },
  portable: { ...base.portable, artifactName: 'Gregal-Jocs-Portable-${version}-${arch}.${ext}' },
};
