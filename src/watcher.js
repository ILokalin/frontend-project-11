import onChange from "on-change";

export default (elements, state) => {
  const handleForm = (state) => {
    const { valid, error } = state.form;
    if (valid) {
      elements.input.classList.remove('is-invalid');
    } else {
      elements.input.classList.add('is-invalid');
    }
    elements.feedback.textContent = error;
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
