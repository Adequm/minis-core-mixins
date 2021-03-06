import faviconMixin from './mixins/favicon.mixin.js';
import minisMixin from './mixins/minis.mixin.js';
import resizeMixin from './mixins/resize.mixin.js';
import translateMixin from './mixins/translate.mixin.js';
import coreMixin from './mixins/core.mixin.js';
import frameMixin from './mixins/frame.mixin.js';

import vuexMinisModule from './store/minis.module.js';

const persistedMinis = [
  'minis.minisThemeMain', 
  'minis.minisThemeSpecial', 
  'minis.minisLang',
  'minis.minisHints',
  'minis.themesJSON', 
  'minis.translateJSON', 
  'minis.minisJSON',
];

export {
 faviconMixin,
 minisMixin,
 resizeMixin,
 translateMixin,
 coreMixin,
 frameMixin,
 vuexMinisModule,
 persistedMinis
};
