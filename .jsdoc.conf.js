'use strict';

module.exports = {
  plugins: ['plugins/markdown'],
  recurseDepth: 10,
  source: {
    include: [
      'lib/clients/paymeter/index.js',
      'lib/clients/hyperion/index.js',
      'lib/clients/platform/index.js',
      'lib/clients/platform/modules/',
      'lib/clients/privatehive/index.js',
      'lib/clients/privatehive/modules/',
    ],
    includePattern: '.+\\.js?$',
  },
  sourceType: 'module',
  tags: {
    allowUnknownTags: true,
    dictionaries: ['jsdoc'],
  },
  templates: {
    cleverLinks: false,
    monospaceLinks: true,
  },
  opts: {
    template: 'node_modules/docdash',
    destination: './docs/',
    readme: './README.md',
  },
  docdash: {
    static: true,
    sort: true,
    sectionOrder: ['Classes', 'Modules', 'Externals', 'Events', 'Namespaces', 'Mixins', 'Tutorials', 'Interfaces'],
    disqus: 'https://forum.blockcluster.io/',
    openGraph: {
      title: 'Blockcluster',
      type: 'website',
      image: '',
      site_name: '',
      url: '',
    },
    meta: {
      title: 'Blockcluster NodeJS SDK',
      description: '',
      keyword: '',
    },
    search: true,
    collapse: true,
    wrap: true,
    typedefs: true,
    navLevel: 3,
    private: true,
    removeQuotes: 'trim',
    scripts: [],
    menu: {
      'Project Website': {
        href: 'https://www.blockcluster.io/',
        target: '_blank',
        class: 'menu-item',
        id: 'website_link',
      },
      Forum: {
        href: 'https://forum.blockcluster.io/',
        target: '_blank',
        class: 'menu-item',
        id: 'forum_link',
      },
    },
  },
};
