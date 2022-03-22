import _ from 'lodash';

export default {
  data: () => ({
    appIndex: 0,
    framePageIndex: 0,
    isFullscreenInFrame: false,
    links: [],
  }),

  watch: {
    isFullscreen: 'initFramesWatchers',
    isWidthMore768: 'initFramesWatchers',
  },

  computed: {
    domen() {
      return process.env.NODE_ENV === 'development' && location.pathname.startsWith('/minis/')
        ? `${ location.origin }/minis/`
        : 'https://adequm.github.io/minis-';
    },
  },

  methods: {
     getFrameElementById(index = 0, elementId, amount = 0) {
      return new Promise(async resolve => {
        try {
          const body = window.frames[index].document.body;
          const element = body.querySelector(elementId);
          if(!element) throw element;
          resolve(element);
        } catch(err) {
          if(amount >= 200) return resolve(null);
          await new Promise(resolve => setTimeout(resolve, 50));
          resolve(this.getFrameElementById(index, elementId, ++amount));
        }
      })
    },
    initFramesWatchers() {
      _.each(this.links, (link, index) => {
        this.initFrameCheckboxFullscreenWatcher(index);
        this.initFrameSettingsWatcher(index);
      })
    },
    async initFrameCheckboxFullscreenWatcher(index) {
      const checkboxFullscreen = await this.getFrameElementById(index, '#checkboxFullscreen');
      const value = this.isFullscreen || !this.isWidthMore768;
      const valueEl = _.get(checkboxFullscreen, 'checked');
      if(value == valueEl) return; 
      _.invoke(checkboxFullscreen, 'click');
    },
    async initFrameSettingsWatcher(index) {
      if(!this.isFullscreen && this.isWidthMore768) return;
      const settingsButton = await this.getFrameElementById(index, `#settingsButton`);
      _.invoke(settingsButton, 'setAttribute', 'loading', 'done');
      _.invoke(settingsButton, 'addEventListener', 'click', () => {
        this.openedModalName = 'settings';
        this.isClosedSettings = false;
      });
    },

    clickToArrow(side) {
      const length = this.links.length;
      if(side == 'left') {
        this.framePageIndex = ((this.framePageIndex + length) - 1) % length;
      } else {
        this.framePageIndex = (this.framePageIndex + 1) % length;
      }
      this.initFramesWatchers();
    },
  },

  created() {
    this.links.push(this.projectKey);
  },

  beforeMount() {
    const locationsGet = _.chain(location.href)
      .split('?')
      .last()
      .split('&')
      .map(d => d.split('='))
      .fromPairs()
      .value();
    this.isFullscreenInFrame = locationsGet.isFullscreen === 'true';
    this.appIndex = parseInt(locationsGet.index) || 0;
  },

  mounted() {
    this.initFramesWatchers();
  },
};