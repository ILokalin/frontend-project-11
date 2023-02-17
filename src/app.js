// @ts-check
import i18next from "i18next";
import axios from "axios";
import { uniqueId } from "lodash";
import { string, setLocale } from "yup";
import watch from "./watcher.js";
import locale from "./translations/yupLocale.js";
import translations from "./translations/index.js";
import parse from "./parser.js";

const addProxy = (originUrl) => {
  const proxyUrl = new URL("/get", "https://allorigins.hexlet.app");
  proxyUrl.searchParams.set("url", originUrl);
  proxyUrl.searchParams.set("disableCache", "true");
  return proxyUrl.toString();
};

const updateState = (state, field, data) => {
  state[field] = {
    ...state[field],
    data,
  };
};

const readRss = (watchedState, url) => {
  updateState(watchedState, "loadingProcess", {
    inProgress: true,
    status: "loading",
    error: null,
  });

  return axios
    .get(addProxy(url), { timeout: 10000 })
    .then((response) => {
      const { title, description, items } = parse(response.data.contents);
      const feed = { id: uniqueId(), url, title, description };
      const posts = items.map((item) => ({
        ...item,
        chnnelId: feed.Id,
        id: uniqueId(),
      }));

      updateState(watchedState, "loadingProcess", {
        inProgress: false,
        status: "success",
        error: null,
      });
      watchedState.feeds.unshift(feed);
      watchedState.posts.unshift(...posts);
    })
    .catch((error) => {
      updateState(watchedState, "loadingProcess", {
        inProgress: false,
        status: "fail",
        error,
      });
    });
};

const app = () => {
  const initialState = {
    form: {
      error: null,
      valid: false,
    },
    loadingProcess: {
      inProgress: false,
    },
    feeds: [],
    posts: [],
  };

  const elements = {
    form: document.querySelector(".rss-form"),
    input: document.querySelector("#rss-input"),
    feedback: document.querySelector(".feedback"),
    feedsContainer: document.querySelector(".feeds"),
    postsContainer: document.querySelector(".posts"),
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      lng: "ru",
      debug: false,
      resources: translations,
    })
    .then(() => {
      const watchedState = watch(elements, initialState, i18nextInstance);

      setLocale(locale);
      elements?.form?.addEventListener("submit", (e) => {
        e.preventDefault();

        // @ts-ignore
        const data = new FormData(e.target);
        const url = data.get("rss");
        const urlSchema = string().url().required();

        const updateFormState = (form) => {
          watchedState.form = {
            ...watchedState.form,
            ...form,
          };
        };

        urlSchema
          .notOneOf(watchedState.feeds)
          .validate(url)
          .then(() => {
            updateFormState({
              valid: true,
              error: "",
            });
            readRss(watchedState, url);
          })
          .catch((error) => {
            updateFormState({
              valid: false,
              error: error.message.key,
            });
          });
      });
    });
};

export default app;
