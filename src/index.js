// @ts-check
import "./app.scss";
import { string, setLocale } from "yup";
import watch from "./watcher.js";
import i18next from 'i18next';
import locale from './translations/yupLocale.js';
import translations from './translations/index.js'

const app = () => {
  const initialState = {
    form: {
      error: null,
      valid: false,
    },
    feeds: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#rss-input'),
    feedback: document.querySelector(".feedback"),
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources: translations,
  }).then(() => {
    const watchedState = watch(elements, initialState, i18nextInstance);

    setLocale(locale);
    elements?.form?.addEventListener("submit", (e) => {
      e.preventDefault();
      // @ts-ignore
      const data = new FormData(e.target);
      const rss = data.get("rss");
      const urlSchema = string().url().required();

      const updateFormState = (form) => {
        watchedState.form = {
          ...watchedState.form,
          ...form,
        };
      };
  
      urlSchema
        .notOneOf(watchedState.feeds)
        .validate(rss)
        .then(() => {
          updateFormState({
            valid: true,
            error: "",
          });
          watchedState.feeds.unshift(rss);
        })
        .catch((e) => {
          updateFormState({
            valid: false,
            error: e.message.key,
          });
        });
    });
  });
};
app();
