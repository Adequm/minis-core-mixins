import _ from 'lodash';

export default {
  data: () => ({
    appIndex: 0,
    isFullscreenInFrame: false,
  }),

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
};