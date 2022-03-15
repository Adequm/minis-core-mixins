import { mapGetters } from 'vuex';
import _ from 'lodash';

export default {
  watch: {
    themeHash: {
      immediate: true,
      handler() {
        const image = new Image();
        const projectKey = location.pathname.split('/')[1];
        image.src = `/${projectKey}/icon.svg`;

        image.addEventListener('load', () => {
          [16, 32].forEach(size => {

            const canvas = document.createElement('canvas'); 
            canvas.height = size;
            canvas.width = size; 
            const ctx = canvas.getContext('2d');

            ctx.beginPath();
            ctx.drawImage(image, 0, 0, size, size);

            ctx.globalCompositeOperation = 'source-in';

            ctx.rect(0, 0, size, size);
            ctx.fillStyle = _.get(this.themeSpecial, 'normal');
            ctx.fill();

            const linkEl = document.querySelector(`link[sizes="${ size }x${ size }"]`);
            linkEl.setAttribute('href', canvas.toDataURL()); 
          });
        });
      }
    }
  },

  computed: {
    ...mapGetters(['themeSpecial', 'themeMain']),
    themeHash() {
      return JSON.stringify(this.themeSpecial) + JSON.stringify(this.themeMain);
    },
  },
};