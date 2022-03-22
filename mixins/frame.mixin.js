import _ from 'lodash';

export default {
  data: () => ({
    appIndex: 0,
    framePageIndex: 0,
    isFullscreenInFrame: false,
    links: [],
  }),

  watch: {
    isFullscreen: 'initFramesSettingsWatcher',
  },

  computed: {
    domen() {
      return process.env.NODE_ENV === 'development' && location.pathname.startsWith('/minis/')
        ? `${ location.origin }/minis#`
        : 'https://adequm.github.io/minis-';
    },
  },

  methods: {
    getSettingsButton(index = 0, amount = 0) {
      return new Promise(async resolve => {
        try {
          const body = window.frames[index].document.body;
          const settingsButton = body.querySelector(`#settingsButton`);
          if(!settingsButton) throw settingsButton;
          resolve(settingsButton);
        } catch(err) {
          if(amount >= 50 || (!this.isFullscreen && this.isWidthMore768)) return resolve(null);
          await new Promise(resolve => setTimeout(resolve, 200));
          resolve(this.getSettingsButton(index, ++amount));
        }
      })
    },
    initFramesSettingsWatcher() {
      _.each(this.links, (link, index) => {
        this.initFrameSettingsWatcher(index);
      })
    },
    async initFrameSettingsWatcher(index) {
      if(!this.isFullscreen && this.isWidthMore768) return;
      const settingsButton = await this.getSettingsButton(index);
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
      this.initFramesSettingsWatcher();
    },
  },

  created() {
    this.links.push(this.projectKey);
  },

  beforeMount() {
    this.initFramesSettingsWatcher();
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
};