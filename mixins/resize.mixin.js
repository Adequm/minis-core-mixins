import _ from 'lodash';

import { mapGetters } from 'vuex';

export default {
  data: () => ({
    minContainerWidth: 300,
    minContainerHeight: 560,
    containerWidth: null,
    containerHeight: null,
    innerHeight: null,
    innerWidth: null,
    startResizeX: null,
    startResizeY: null,
    startResizeWidth: null,
    startResizeHeight: null,
    resizeHash: null,
    onInputFocus: false,
  }),

  watch: {
    isFullscreen: 'resizeContainer',
    innerHeight: 'resizeContainer',
    innerWidth: 'resizeContainer',
  },

  computed: {
    ...mapGetters(['isFullscreen']),
    isWidthMore768: ths => ths.innerWidth >= 768,
    isDesktop: ths => ths.isWidthMore768 && !ths.isFullscreen,
    appWidth: ths => ths.isDesktop ? ths.containerWidth : ths.innerWidth,
    appHeight: ths => ths.isDesktop ? ths.containerHeight : ths.innerHeight,
    maxContainerWidth: ths => ths.innerWidth - 180,
    maxContainerHeight: ths => ths.innerHeight - 100,
    isMinContainerWidth: ths => ths.containerWidth === ths.minContainerWidth,
    isMaxContainerWidth: ths => ths.containerWidth === ths.maxContainerWidth,
    isMinContainerHeight: ths => ths.containerHeight === ths.minContainerHeight,
    isMaxContainerHeight: ths => ths.containerHeight === ths.maxContainerHeight,
  },

  methods: {
    resizeContainer(sizes = {}) {
      const { containerWidth: W, minContainerWidth: minW, maxContainerWidth: maxW } = this;
      const { containerHeight: H, minContainerHeight: minH, maxContainerHeight: maxH } = this;
      this.containerWidth = _.clamp(sizes.containerWidth || W, minW, maxW);
      this.containerHeight = _.clamp(sizes.containerHeight || H, minH, maxH);
    },

    setContainerSize({ pageX, pageY }) {
      requestAnimationFrame(() => {
        if(_.isNull(this.startResizeX) || _.isNull(this.startResizeWidth)) return;
        if(_.isNull(this.startResizeY) || _.isNull(this.startResizeHeight)) return;
        const containerWidth = (pageX - this.startResizeX) * 2 + this.startResizeWidth;
        const containerHeight = (pageY - this.startResizeY) * 2 + this.startResizeHeight;
        this.resizeContainer({ containerWidth, containerHeight });
      })
    },

    startResize(event) {
      this.startResizeX = event.pageX;
      this.startResizeY = event.pageY;
      this.startResizeWidth = this.containerWidth;
      this.startResizeHeight = this.containerHeight;
      document.addEventListener('mousemove', this.setContainerSize);
      document.addEventListener('mouseup', this.stopResize);
      window.addEventListener('mouseleave', this.stopResize);
      window.addEventListener('click', this.stopResize);
      window.addEventListener('contextmenu', this.stopResize);
    },

    stopResize() {
      this.startResizeX = null;
      this.startResizeY = null;
      this.startResizeWidth = null;
      this.startResizeHeight = null;
      document.removeEventListener('mousemove', this.setContainerSize);
      document.removeEventListener('mouseup', this.stopResize);
      window.removeEventListener('mouseleave', this.stopResize);
      window.removeEventListener('click', this.stopResize);
      window.removeEventListener('contextmenu', this.stopResize);
    },

    autoResize() {
      const isMin = this.isMinContainerWidth && this.isMinContainerHeight;
      this.resizeContainer({ 
        containerWidth: isMin ? this.maxContainerWidth : this.minContainerWidth, 
        containerHeight: isMin ? this.maxContainerHeight : this.minContainerHeight, 
      });
    },
  },

  beforeMount() {
    const updateInnerSize = () => {
      this.innerWidth = document.body.offsetWidth;
      if(this.onInputFocus) return;
      this.innerHeight = innerHeight;
    }

    updateInnerSize();
    window.addEventListener('resize', updateInnerSize);
    setInterval(updateInnerSize, 1000);
  },
};
