import onChange from 'on-change';

export default (elements, initialState, i18next) => {
  const handleForm = ({ form }) => {
    const { input, feedback } = elements;
    const { valid, error } = form;

    if (valid) {
      input.classList.remove('is-invalid');
      feedback.classList.add('text-success');
      feedback.textContent = '';
    } else {
      input.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      feedback.textContent = i18next.t([`errors.${error}`, 'errors.unknown']);
    }
  };

  const handleFeeds = ({ feeds }) => {
    const { feedsContainer } = elements;

    const feedsFragment = document.createElement('div');
    feedsFragment.classList.add('card', 'border-0');
    feedsFragment.innerHTML = '<div class="card-body"></div>';

    const feedsTitile = document.createElement('h2');
    feedsTitile.classList.add('card-title', 'h4');
    feedsTitile.textContent = i18next.t('feeds');
    feedsFragment.querySelector('.card-body').appendChild(feedsTitile);

    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'border-0', 'rounded-0');

    const feedsItems = feeds.map((feed) => {
      const element = elements.feedTemplate.content.cloneNode(true);
      const title = element.querySelector('h3');
      title.textContent = feed.title;
      const description = element.querySelector('p');
      description.textContent = feed.description;

      return element;
    });

    feedsList.append(...feedsItems);
    feedsFragment.appendChild(feedsList);
    feedsContainer.innerHTML = '';
    feedsContainer.appendChild(feedsFragment);
  };

  const handlePosts = ({ posts }) => {
    const { postsContainer } = elements;

    const postsFragment = document.createElement('div');
    postsFragment.classList.add('card', 'border-0');
    postsFragment.innerHTML = '<div class="card-body"></div>';

    const postsTitile = document.createElement('h2');
    postsTitile.classList.add('card-title', 'h4');
    postsTitile.textContent = i18next.t('posts');
    postsFragment.querySelector('.card-body').appendChild(postsTitile);

    const postsList = document.createElement('ul');
    postsList.classList.add('list-group', 'border-0', 'rounded-0');

    const postsListItems = posts.map((post) => {
      const element = elements.postTemplate.content.cloneNode(true);
      const link = element.querySelector('a');
      link.setAttribute('href', post.link);
      link.dataset.id = post.id;
      link.textContent = post.title;

      return element;
    });

    postsList.append(...postsListItems);
    postsFragment.appendChild(postsList);
    postsContainer.innerHTML = '';
    postsContainer.appendChild(postsFragment);
  };

  const handleLoadingProcess = ({ loadingProcess }) => {
    const { submit, input, feedback } = elements;
    feedback.classList.remove('text-success');
    feedback.classList.remove('text-danger');

    switch (loadingProcess.status) {
      case 'fail':
        submit.disabled = false;
        input.removeAttribute('readonly');
        feedback.classList.add('text-danger');
        feedback.textContent = i18next.t([`errors.${loadingProcess.error}`, 'errors.unknown']);
        break;
      case 'success':
        submit.disabled = false;
        input.removeAttribute('readonly');
        input.value = '';
        feedback.classList.add('text-success');
        feedback.textContent = i18next.t('loading.success');
        input.focus();
        break;
      case 'loading':
        submit.disabled = true;
        input.setAttribute('readonly', true);
        feedback.innerHTML = i18next.t('loading.loading');
        break;
      default:
        throw new Error(`Unknown loadingProcess status: '${loadingProcess.status}'`);
    }
  };

  const watchedState = onChange(initialState, (path) => {
    switch (path) {
      case 'form':
        handleForm(initialState);
        break;
      case 'feeds':
        handleFeeds(initialState);
        break;
      case 'posts':
        handlePosts(initialState);
        break;
      case 'loadingProcess':
        handleLoadingProcess(initialState);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
