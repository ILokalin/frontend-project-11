export default {
  string: {
    url: () => ({ key: 'notUrl' }),
  },
  mixed: {
    notOneOf: () => ({ key: 'exists' }),
  },
};
