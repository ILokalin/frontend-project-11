import onChange from "on-change";

export default (elements, state, i18next) => {
  const handleForm = (state) => {
    const { valid, error } = state.form;
    if (valid) {
      elements.input.classList.remove('is-invalid');
      elements.feedback.textContent = '';
    } else {
      elements.input.classList.add('is-invalid');
      elements.feedback.textContent = i18next.t([`errors.${error}`, 'errors.unknown']);
    }
    ;
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case "form":
        handleForm(state);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
