import _ from 'lodash';
import { mapGetters, mapMutations, mapState } from 'vuex';

export default {
  data: () => ({
    isPageLoad: false,
  }),

  watch: {
    translateOfMinis: {
      deep: true,
      immediate: true,
      handler(translateOfMinis) {
        if(!_.size(translateOfMinis)) return;
        document.title = this.translate('title');
      }
    },
    themeMain: {
      deep: true,
      handler: 'themeMainInit',
    },
    themeSpecial: {
      deep: true,
      handler: 'themeSpecialInit'
    },
    themesJSON: {
      deep: true,
      handler: 'themesJSONInit',
    },
  },

  computed: {
    ...mapGetters([
      'themeMain',
      'themeSpecialName',
      'themeSpecial'
    ]),
    ...mapState({ 
      minisTheme: state => state.minis.minisTheme,
      minisLang: state => state.minis.minisLang,

      themesJSON: state => state.minis.themesJSON,
      minisJSON: state => state.minis.minisJSON,
      translateJSON: state => state.minis.translateJSON,
    }),
  },

  methods: {
    ...mapMutations({ 
      switchTheme: (commit, args) => commit('switchTheme', args),
      switchLang: (commit, args) => commit('switchLang', args),
      initMinis: (commit, args) => commit('initMinis', args),
    }),

    themeMainInit() {
      if(!this.themeMain) return this.switchTheme('main');
      _.entries(this.themeMain.colors).forEach(([key, color]) => {
        document.body.style.setProperty(`--${ key }`, color);
      });
    },

    themeSpecialInit() {
      if(!this.themeSpecial) return this.switchTheme('special');
      document.body.style.setProperty(`--special-color`, this.themeSpecial.normal);
      _.each(this.themeSpecial, (color, value) => {
        document.body.style.setProperty(`--special-color-${value}`, color);
      });
    },

    themesJSONInit() {
      _.entries(this.themesJSON.default || []).forEach(([key, color]) => {
        document.body.style.setProperty(`--${ key }-color`, color);
      });
    },

    isExistMinisData() {
      return _.size(this.themesJSON)
        && _.size(this.minisJSON)
        && _.size(this.translateJSON);
    },

    getMinisOptions() {
      const linkToMinis = 'https://adequm.github.io/minis';
      return new Promise(async resolve => {
        try {
          const translateJSON = await fetch(`${ linkToMinis }/translateJSON.json`).then(d => d.json());
          const minisJSON = await fetch(`${ linkToMinis }/minisJSON.json`).then(d => d.json());
          const themesJSON = await fetch(`${ linkToMinis }/themesJSON.json`).then(d => d.json());
          resolve({ translateJSON, minisJSON, themesJSON });
        } catch(err) {
          setTimeout(async () => {
            if(this.isExistMinisData()) {
              this.themeMainInit();
              this.themeSpecialInit();
              this.themesJSONInit();
              this.isPageLoad = true;
            }
            const minisOptions = await this.getMinisOptions();
            resolve(minisOptions);
          }, 2000);
        }
      });
    },
  },

  async created() {
    const minisOptions = await this.getMinisOptions();
    this.initMinis(minisOptions);
    this.isPageLoad = true;
  },
};