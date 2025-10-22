// compatible-wujie.js
const fs = require('fs');
const path = require('path');

// 修补 dom.js
const domPath = path.resolve('./', 'node_modules/monaco-editor/esm/vs/base/browser/dom.js');
if (fs.existsSync(domPath)) {
  let dom = fs.readFileSync(domPath, 'utf-8');
  dom = dom.replace(
    'function getShadowRoot(domNode) {',
    `function getShadowRoot(domNode) {\n  if(window.__POWERED_BY_WUJIE__) return window.__WUJIE.shadowRoot;`
  );
  fs.writeFileSync(domPath, dom, 'utf-8');
  console.log('[compatible-wujie] patched dom.js');
} else {
  console.warn('[compatible-wujie] dom.js not found, please check monaco-editor version and path.');
}

// 修补 mouseTarget.js
const mouseTargetPath = path.resolve('./', 'node_modules/monaco-editor/esm/vs/editor/browser/controller/mouseTarget.js');
if (fs.existsSync(mouseTargetPath)) {
  let mouseTarget = fs.readFileSync(mouseTargetPath, 'utf-8');
  mouseTarget = mouseTarget.replace(
    "const font = window.getComputedStyle(el, null).getPropertyValue('font');",
    "const font = window.getComputedStyle(el, null).fontSize + ' ' + window.getComputedStyle(el, null).fontFamily;"
  );
  fs.writeFileSync(mouseTargetPath, mouseTarget, 'utf-8');
  console.log('[compatible-wujie] patched mouseTarget.js');
} else {
  console.warn('[compatible-wujie] mouseTarget.js not found, please check monaco-editor version and path.');
} 