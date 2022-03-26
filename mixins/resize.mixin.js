import _ from 'lodash';
import Vue from 'vue';

import { mapState } from 'vuex';

export default {
  data: () => ({
    minContainerWidth: 300,
    minContainerHeight: 560,
    containerWidth: {},
    containerHeight: null,
    innerHeight: null,
    innerWidth: null,
    startResizeX: {},
    startResizeY: null,
    startResizeWidth: {},
    startResizeHeight: null,
    resizeIndex: null,
    onInputFocus: false,
    containerWidthSum: 0,
    isAutoResize: false,
    isColResize: false,
    resizeIndexShift: null,
  }),

  watch: {
    isFullscreen: 'resizeContainers',
    innerHeight: 'resizeContainers',
    innerWidth: 'resizeContainers',
  },

  computed: {
    ...mapState(['isFullscreen']),
    isWidthMore768: ths => ths.innerWidth >= 768,
    isFrame: () => window.self !== window.top,
    isDesktop: ths => ths.isWidthMore768 && !ths.isFullscreen && !ths.isFrame,
    isMinContainerHeight: ths => ths.containerHeight === ths.minContainerHeight,
    isMaxContainerHeight: ths => ths.containerHeight === ths.maxContainerHeight,
    maxContainerHeight: ths => ths.innerHeight - 100,
    maxContainerWidth: ths => ths.innerWidth - 180,
    paddingContainersWidth: ths => (ths.links.length - 1) * 20,
    emptyContainerWidth: ths => ths.maxContainerWidth - ths.containerWidthSum - ths.paddingContainersWidth,
    appHeight: ths => ths.isDesktop ? ths.containerHeight : ths.innerHeight,
    appWidths() {
      const innerWidths = _.mapValues(_.cloneDeep(this.containerWidth), this.innerWidth);
      return this.isDesktop ? this.containerWidth : innerWidths;
    },
  },

  methods: {
    resizeContainers(sizes = {}) {
      _.times(this.links.length, index => {
        this.resizeContainer(sizes, index);
      });
      if(this.isAutoResize) this.autoResize();
    },

    resizeContainer(sizes = {}, index) {
      if(!this.isColResize) {
        const { containerHeight: H, minContainerHeight: minH, maxContainerHeight: maxH } = this;
        this.containerHeight = _.clamp(sizes.containerHeight || H, minH, maxH);
      }

      if(this.emptyContainerWidth <= 0 && sizes.containerWidth > this.containerWidth[index]) return;
      const { containerWidth: W, minContainerWidth: minW, maxContainerWidth } = this;
      const neighborsWidths = _.chain(this.containerWidth)
        .omit(index)
        .values()
        .sum()
        .value();
      const maxW = maxContainerWidth - this.paddingContainersWidth - neighborsWidths;
      const newContainerWidth = _.clamp(sizes.containerWidth || W[index] || 0, minW, maxW);
      Vue.set(this.containerWidth, index, newContainerWidth);

      this.containerWidthSum = 0;
      for(let index in this.containerWidth) {
        this.containerWidthSum += this.containerWidth[index];
      }

      if(!this.isDesktop) return;
      const wrapper = document.getElementById(`minis__wrapper_${index}`);
      _.set(wrapper, 'style.width', `${this.containerWidth[index]}px`);
      _.invoke(wrapper, 'setAttribute', 'area-size', this.containerWidth[index])
    },

    setContainerSize({ pageX, pageY }) {
      requestAnimationFrame(() => {
        const startResizeWidth = this.startResizeWidth[this.resizeIndex];
        const startResizeX = this.startResizeX[this.resizeIndex];

        if(_.isNull(startResizeWidth)) return;
        if(_.isNull(startResizeX)) return;
        if(_.isNull(this.startResizeHeight)) return;
        if(_.isNull(this.startResizeY)) return;

        if(this.isColResize) {
          this.setContainerSizeOnCol({ diffAtStart: pageX - startResizeX, startResizeWidth });
        } else {
          let containerHeight = (pageY - this.startResizeY) * 2 + this.startResizeHeight;
          let containerWidth = (pageX - startResizeX) * 2 + startResizeWidth;
          if(containerWidth <= -this.minContainerWidth) containerWidth *= -1;
          if(containerHeight <= -this.minContainerHeight) containerHeight *= -1;
          this.resizeContainer({ containerWidth, containerHeight }, this.resizeIndex);
        }
      })
    },

    setContainerSizeOnCol({ diffAtStart, startResizeWidth }) {
      let currentContainerWidth = this.containerWidth[this.resizeIndex];
      let diffX = diffAtStart + startResizeWidth - currentContainerWidth;
      // if(!diffX) return;

      let index = 0;
      let neighboursShift = 0;
      if(diffX >= 0 && false) {
        let nextContainerIndex = this.resizeIndex - 1;
        while(this.containerWidth[nextContainerIndex]) {
          const nextStartResizeWidth = this.startResizeWidth[nextContainerIndex];
          if(this.containerWidth[nextContainerIndex] > this.minContainerWidth) {
            const newNextContainerWidth = nextStartResizeWidth - diffAtStart + neighboursShift;
            this.resizeContainer({ containerWidth: newNextContainerWidth }, nextContainerIndex);
            this.resizeContainer({ containerWidth: currentContainerWidth + diffAtStart }, this.resizeIndex);
            break;
          }
          index++;
          neighboursShift += nextStartResizeWidth - this.minContainerWidth;
          nextContainerIndex--;
        }
      }
      if(diffX <= 0) {
        this.resizeIndexShift = this.resizeIndex;
        // startResizeWidth = this.startResizeWidth[this.resizeIndex - 1];
        currentContainerWidth = this.containerWidth[this.resizeIndex - 1];

        while(this.containerWidth[this.resizeIndexShift]) {
 
          const nextStartResizeWidth = this.startResizeWidth[this.resizeIndexShift];
          const nextContainerWidth = this.containerWidth[this.resizeIndexShift];

          if(nextContainerWidth > this.minContainerWidth) {
            

            if(nextContainerWidth + diffX <= this.minContainerWidth) {
              diffAtStart -= this.minContainerWidth - nextContainerWidth + diffX;
            }

            setTimeout(console.log.bind(console, diffAtStart))

            const newContainerWidth = currentContainerWidth - diffAtStart - neighboursShift;
            this.resizeContainer({ containerWidth: newContainerWidth }, this.resizeIndex - 1);
            this.resizeContainer({ containerWidth: nextContainerWidth + diffAtStart }, this.resizeIndexShift);
            break;
          }

          index++;
          neighboursShift += nextStartResizeWidth - this.minContainerWidth;
          this.resizeIndexShift++;
        //   newContainerWidth = diffX + startResizeWidth;
        //   containerWidthDifference = newContainerWidth - currentContainerWidth;


        //   const nextContainerWidth = this.containerWidth[nextContainerIndex];
        //   if(nextContainerWidth > this.minContainerWidth) {
        //     const newNextContainerWidth = nextContainerWidth + diffX;
        //     this.resizeContainer({ containerWidth: newNextContainerWidth }, nextContainerIndex);
        //     this.resizeContainer({ containerWidth: newContainerWidth }, this.resizeIndex - 1);
        //     break;
        //   }

        }

        // while(this.containerWidth[nextContainerIndex]) {
        //   // const currentContainerWidthDifference = 
        //   const nextContainerWidth = this.containerWidth[nextContainerIndex];
        //   let newNextContainerWidth = nextContainerWidth + containerWidthDifference;

        //   const shift = newNextContainerWidth - this.minContainerWidth;
        //   if(shift <= 5 && shift > 0) {
        //     newNextContainerWidth -= shift;
        //     containerWidthDifference -= shift;
        //   }

        //   this.resizeContainer({ containerWidth: newNextContainerWidth }, nextContainerIndex);

        //   if(newNextContainerWidth > this.minContainerWidth) {
        //     const abc = this.containerWidth[this.resizeIndex - 1];
        //     this.resizeContainer({ containerWidth: abc - containerWidthDifference }, this.resizeIndex - 1); 
        //   }
        //     break;

        //   nextContainerIndex++;
        // }
      }
    },

    startResize(event, index, isColResize) {
      this.resizeIndexShift = null;
      this.isColResize = isColResize;
      this.isAutoResize = false;
      this.resizeIndex = index;
      this.startResizeX[index] = event.pageX;
      this.startResizeY = event.pageY;
      this.startResizeWidth = _.cloneDeep(this.containerWidth);
      this.startResizeHeight = this.containerHeight;
      this.setContainerSize(event);
      document.addEventListener('mousemove', this.setContainerSize);
      document.addEventListener('mouseup', this.stopResize);
      window.addEventListener('mouseleave', this.stopResize);
      window.addEventListener('click', this.stopResize);
      window.addEventListener('contextmenu', this.stopResize);
    },

    stopResize() {
      this.resizeIndexShift = null;
      this.isColResize = false;
      this.isAutoResize = false;
      this.resizeIndex = null;
      this.startResizeX = {};
      this.startResizeY = null;
      this.startResizeWidth = {};
      this.startResizeHeight = null;
      document.removeEventListener('mousemove', this.setContainerSize);
      document.removeEventListener('mouseup', this.stopResize);
      window.removeEventListener('mouseleave', this.stopResize);
      window.removeEventListener('click', this.stopResize);
      window.removeEventListener('contextmenu', this.stopResize);
    },

    autoResize() {
      this.isColResize = false;
      this.isAutoResize = true;
      const isMinWidth = _.every(this.containerWidth, w => w == this.minContainerWidth);
      const isMin = isMinWidth && this.isMinContainerHeight;
      const length = _.size(this.containerWidth);
      const containerHeight = isMin ? this.maxContainerHeight : this.minContainerHeight;
      const containerWidth = isMin 
        ? Math.floor((this.maxContainerWidth - this.paddingContainersWidth)/length) 
        : this.minContainerWidth;
      _.times(length, index => {
        this.resizeContainer({ containerWidth, containerHeight }, index);
      })
    },
  },

  beforeMount() {
    const updateInnerSize = () => {
      if(!document.body.offsetWidth) return;
      this.innerWidth = document.body.offsetWidth;
      if(this.onInputFocus) return;
      this.innerHeight = innerHeight;
    }

    updateInnerSize();
    window.addEventListener('resize', updateInnerSize);
    setInterval(updateInnerSize, 1000);
  },
};
