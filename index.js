import faviconMixin from './mixins/favicon.mixin.js';
import minisMixin from './mixins/minis.mixin.js';
import resizeMixin from './mixins/resize.mixin.js';
import translateMixin from './mixins/translate.mixin.js';

import vuexMinisModule from './store/minis.module.js';

export {
 faviconMixin,
 minisMixin,
 resizeMixin,
 translateMixin,
 vuexMinisModule,
 persistedMinis
};

export const persistedMinis = [
  'minis.minisThemeMain', 
  'minis.minisThemeSpecial', 
  'minis.minisLang',
  'minis.themesJSON', 
  'minis.translateJSON', 
  'minis.minisJSON',
];
