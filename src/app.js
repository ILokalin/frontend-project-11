// @ts-check
import i18next from 'i18next';
import axios from 'axios';
import { differenceBy, uniqueId } from 'lodash';
import { string, setLocale } from 'yup';
import watch from './watcher.js';
import locale from './translations/yupLocale.js';
import translations from './translations/index.js';
import parse from './parser.js';
import { FETCHING_TIMEOUT, REQUEST_TIMEOUT } from './constants.js';

const addProxy = (originUrl) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.set('url', originUrl);
  proxyUrl.searchParams.set('disableCache', 'true');
  return proxyUrl.toString();
};

const updateState = (state, field, data) => {
  // eslint-disable-next-line no-param-reassign
  state[field] = {
    ...state[field],
    ...data,
  };
};

const getLoadingProcessErrorType = (e) => {
  if (e.isParsingError) {
    return 'noRss';
  }
  if (e.isAxiosError) {
    if (e.message.includes('timeout')) {
      return 'timeout';
    }
    return 'network';
  }
  return 'unknown';
};

const readRss = (watchedState, url) => {
  updateState(watchedState, 'loadingProcess', {
    inProgress: true,
    status: 'loading',
    error: null,
  });

  return axios
    .get(addProxy(url), { timeout: REQUEST_TIMEOUT })
    .then((response) => {
      const { title, description, items } = parse(response.data.contents);
      const feed = {
        id: uniqueId(), url, title, description,
      };
      const posts = items.map((item) => ({
        ...item,
        channelId: feed.id,
        id: uniqueId(),
      }));

      updateState(watchedState, 'loadingProcess', {
        inProgress: false,
        status: 'success',
        error: null,
      });
      watchedState.feeds.unshift(feed);
      watchedState.posts.unshift(...posts);
    })
    .catch((error) => {
      updateState(watchedState, 'loadingProcess', {
        inProgress: false,
        status: 'fail',
        error: getLoadingProcessErrorType(error),
      });
    });
};

const fetchNewPosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => axios
    .get(addProxy(feed.url), { timeout: REQUEST_TIMEOUT })
    .then((response) => {
      const { items: loadedPosts } = parse(response.data.contents);
      const previousPosts = watchedState.posts.filter((post) => post.channelId === feed.id);

      const newPosts = differenceBy(loadedPosts, previousPosts, 'title')
        .map((post) => ({ ...post, channelId: feed.id, id: uniqueId() }));
      watchedState.posts.unshift(...newPosts);
    })
    .catch((error) => {
      updateState(watchedState, 'loadingProcess', {
        inProgress: false,
        status: 'fail',
        error: getLoadingProcessErrorType(error),
      });
    }));
  Promise.all(promises).finally(() => {
    setTimeout(() => fetchNewPosts(watchedState), FETCHING_TIMEOUT);
  });
};

const validateUrl = (url, feeds) => {
  const feedUrls = feeds.map((feed) => feed.url);
  const schema = string().url().required();

  return schema
    .notOneOf(feedUrls)
    .validate(url)
    .then(() => null)
    .catch((error) => error.message);
};

const app = () => {
  const initialState = {
    form: {
      error: null,
      valid: false,
    },
    loadingProcess: {
      inProgress: false,
      status: 'success',
    },
    feeds: [],
    posts: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#rss-input'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    postTemplate: document.querySelector('#postItem'),
    feedTemplate: document.querySelector('#feedItem'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      lng: 'ru',
      debug: false,
      resources: translations,
    })
    .then(() => {
      setLocale(locale);
      const watchedState = watch(elements, initialState, i18nextInstance);

      elements?.form?.addEventListener('submit', (event) => {
        event.preventDefault();
        // @ts-ignore
        const data = new FormData(event.target);
        const url = data.get('rss');

        validateUrl(url, watchedState.feeds)
          .then((error) => {
            if (!error) {
              updateState(watchedState, 'form', { valid: true, error: '' });
              readRss(watchedState, url);
            } else {
              updateState(watchedState, 'form', { valid: false, error: error.key });
            }
          });
      });
      setTimeout(() => fetchNewPosts(watchedState), FETCHING_TIMEOUT);
    });
};

export default app;
