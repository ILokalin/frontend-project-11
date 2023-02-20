import { find } from 'lodash';
import onChange from 'on-change';

export default (elements, state, i18next) => {
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

  const handlePosts = ({ posts, seenPosts }) => {
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
      const className = seenPosts.has(post.id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
      link.classList.add(...className);
      link.setAttribute('href', post.link);
      link.dataset.id = post.id;
      link.textContent = post.title;

      const button = element.querySelector('button');
      button.dataset.id = post.id;
      button.dataset.bsToggle = 'modal';
      button.dataset.bsTarget = '#modal';
      button.textContent = i18next.t('preview');
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

  const handleModal = ({ posts, modal }) => {
    const post = find(posts, { id: modal.postId });
    const { modalTemplate } = elements; 
    const title = modalTemplate.querySelector('.modal-title');
    title.textContent = post.title;

    const body = modalTemplate.querySelector('.modal-body');
    body.textContent = post.description;

    const readFullButton = modalTemplate.querySelector('[data-action="readFull"]');
    readeFullButton.textContent = i18next.t('readFull');
    readeFullButton.href = post.link;

    const closeButton = modalTemplate.querySelector('[data-action="close"]');
    closeButton.textContent = i18next.t('close');
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form':
        handleForm(state);
        break;
      case 'feeds':
        handleFeeds(state);
        break;
      case 'posts':
        handlePosts(state);
        break;
      case 'loadingProcess':
        handleLoadingProcess(state);
        break;
      case 'modal.postId':
        handleModal(state);
        break;
      case 'ui.seenPosts':
        handlePosts(state);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
