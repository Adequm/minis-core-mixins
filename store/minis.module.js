import Vue from 'vue';
import _ from 'lodash';

const store = {};

store.state = () => ({
  minisLang: 'ru',
  minisThemeMain: null,
  minisThemeSpecial: null,
  minisHints: true,
  translateJSON: {},
  themesJSON: {},
  minisJSON: {},
});


store.getters = {
  themeMain({ themesJSON, minisThemeMain }) {
    const themeUser = _.get(themesJSON, `main[${minisThemeMain}]`);
    const themeDefault = _.get(themesJSON, `main.dark`);
    return themeUser || themeDefault;
  },
  themeSpecialName({ themesJSON, minisThemeSpecial }) {
    const isExist = _.get(themesJSON, `special.colors[${minisThemeSpecial}]`);
    const colorsDefault = _.get(themesJSON, `special.default`);
    return isExist ? minisThemeSpecial : colorsDefault;
  },
  themeSpecial({ themesJSON }, { themeSpecialName }) {
    return _.get(themesJSON, `special.colors[${themeSpecialName}]`);
  },
};


store.mutations = {
  switchTheme(state, type = 'main') {
    const stateKey = type == 'main' ? 'minisThemeMain' : 'minisThemeSpecial';
    const themes = type == 'main' ? state.themesJSON.main : state.themesJSON.special.colors;
    const themesJSON = _.keys(themes);
    const themeIndex = themesJSON.indexOf(state[stateKey]);
    const newThemeIndex = (themeIndex + 1) % themesJSON.length;
    Vue.set(state, stateKey, themesJSON[newThemeIndex]);
  },
  switchLang(state) {
    const langsList = _.keys(state.translateJSON);
    const langIndex = langsList.indexOf(state.minisLang);
    const newLangIndex = (langIndex + 1) % langsList.length;
    Vue.set(state, 'minisLang', langsList[newLangIndex]);
  },
  switchHints: state => Vue.set(state, 'minisHints', !state.minisHints),
  initMinis(state, { translateJSON, minisJSON, themesJSON }) {
    Vue.set(state, 'minisJSON', minisJSON);
    Vue.set(state, 'translateJSON', translateJSON);
    Vue.set(state, 'themesJSON', themesJSON);
  },
};

export default store;