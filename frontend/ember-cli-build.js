/* global require, module */
/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    "ember-cli-babel": {
      optional: ['es6.spec.symbols'],
      includePolyfill: true
    },
    eslint: {
      testGenerator: 'qunit',
      group: true
    }
  });

  app.import('bower_components/animate.css/animate.min.css');
  app.import('vendor/bootstrap/dropdown/bootstrap-dropdown.js');
  app.import('vendor/bootstrap/tab/bootstrap-tab.js');
  app.import('vendor/bootstrap/tooltip/bootstrap-tooltip.js');
  app.import('vendor/bootstrap/popover/bootstrap-popover.js');
  app.import('vendor/wildnote/wildnote-helper-list.js');
  app.import('vendor/rails-ujs-handlers.js');
  return app.toTree();
};
