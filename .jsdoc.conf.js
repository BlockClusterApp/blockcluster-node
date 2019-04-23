'use strict';

module.exports = {
  plugins: ['plugins/markdown'],
  recurseDepth: 10,
  source: {
    include: ['lib/clients/paymeter/index.js', 'lib/clients/hyperion/index.js', 'lib/clients/platform/index.js', 'lib/clients/privatehive/index.js'],
  },
  sourceType: 'module',
  tags: {
    allowUnknownTags: true,
    dictionaries: ['jsdoc', 'closure'],
  },
  templates: {
    cleverLinks: false,
    monospaceLinks: false,
  },
  opts: {
    template: 'node_modules/postman-jsdoc-theme',
    destination: './docs/',
    readme: './README.md',
  },
};
