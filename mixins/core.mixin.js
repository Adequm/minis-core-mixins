import { mapState } from 'vuex';

export default {
  data: () => ({
    isClosedSettings: true,
    openedModalName: null,
  }),

  watch: {
    isDesktop(isDesktop) {
      if(isDesktop && this.openedModalName == 'settings') {
        this.openedModalName = null;
        this.isClosedSettings = false;
      }
    },
  },

  computed: {
    ...mapState(['switchFullscreenKey']),
    isShowMinisButton: ths => ths.isDesktop && !ths.isFrame && !ths.isFullscreenInFrame,
    isShowSettingsButton: ths => (ths.isFullscreenInFrame && ths.isFrame) || (!ths.isDesktop && !ths.isFrame),
    minisWrapperMaxWidth() {
      const { isFullscreen, isWidthMore768, isFullscreenInFrame, appWidth, containerWidth } = this;
      return isFullscreen || !isWidthMore768 || isFullscreenInFrame ? appWidth : containerWidth;
    },
  },

	methods: {
    openModal(modalName) {
      if(modalName == 'settings' && this.isFullscreenInFrame) return;
      this.openedModalName = modalName;
    },

    switchSettings() {
      if(this.isFullscreen) {
        const modalName = this.openedModalName == 'settings' ? null : 'settings';
        this.openModal(modalName);
      } else {
        this.isClosedSettings = !this.isClosedSettings;
      }
    },
	},

  beforeMount() {
    document.addEventListener('keydown', event => {
      if(event.key !== 'Escape') return;
      this.switchSettings();
    });
    document.body.addEventListener('click', event => {
      const framesContainerEl = document.getElementsByClassName('frames__container')[0];
      if(document.body !== event.target && framesContainerEl !== event.target) return;
      if(!this.isDesktop) return;
      if(this.isClosedSettings) return;
      this.isClosedSettings = true;
    });
  },
}