'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src');
const inputs = {
  __INTERVAL_COVER__: '../assets/interval.webp',
  __INTERVAL_CSS__: 'interval.css',
  __ENGINE__: 'forecast-engine.js',
  __DATA__: 'data/energy-data.js',
  __LESSONS__: 'lesson-data.js',
  __JOURNEY_UI__: 'journey-ui.js',
  __I18N_UI__: 'i18n-ui.js',
  __CONTENT_EN__: 'content-en.js',
  __UI_EN_JSON__: 'ui-en.json'
};

let html = fs.readFileSync(path.join(source, 'page-template.html'), 'utf8');
for (const [token, file] of Object.entries(inputs)) {
  if (!html.includes(token)) throw new Error('Missing template token ' + token);
  const filePath = path.join(source, file);
  const content = token === '__INTERVAL_COVER__'
    ? 'data:image/webp;base64,' + fs.readFileSync(filePath).toString('base64')
    : fs.readFileSync(filePath, 'utf8');
  html = html.replace(token, () => content);
}
if (Object.keys(inputs).some(token => html.includes(token))) {
  throw new Error('Unresolved template tokens');
}
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('Built self-contained index.html (' + Buffer.byteLength(html) + ' bytes).');
