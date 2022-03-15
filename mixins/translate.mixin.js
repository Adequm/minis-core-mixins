import { mapState } from 'vuex';
import _ from 'lodash';

export default {
  computed: {
    ...mapState(['projectKey']),
    ...mapState({
      minisLang: state => state.minis.minisLang,
      translateJSON: state => state.minis.translateJSON,
    }),


    translateOfMinis({ translateJSON, minisLang, projectKey }) {
      const path = `[${minisLang}][${projectKey}]`;
      return _.get(translateJSON, path, {});
    },

    translateErrorMessage({ translateJSON, minisLang }) {
      const path = `[${minisLang}].default.error`;
      return _.get(translateJSON, path, '%err%');
    },

    translate({ translateErrorMessage, translateOfMinis }) {
      return (localPath, customErrorMessage) => {
        const errorMessage = customErrorMessage || translateErrorMessage;
        return _.get(translateOfMinis, localPath, errorMessage);
      };
    },

    translateDef({ translateJSON, minisLang, translateErrorMessage }) {
      return (localPath, customErrorMessage) => {
        const path = `[${minisLang}].default[${localPath}]`;
        const errorMessage = customErrorMessage || translateErrorMessage;
        return _.get(translateJSON, path, errorMessage)
      };
    },

    translateChain({ translateJSON, minisLang, translateErrorMessage }) {
      const firstData = _.get(translateJSON, minisLang);
      return function chain(data, path, customErrorMessage) {
        const errorMessage = customErrorMessage || translateErrorMessage;
        const isExistPath = path || _.isNumber(path);
        const translateData = isExistPath ? _.get(data, path, errorMessage) : data;
        return (chainPath, customErrorMessage) => chainPath 
          ? chain(translateData, chainPath, customErrorMessage) 
          : translateData;
      }(firstData);
    },
  },
};