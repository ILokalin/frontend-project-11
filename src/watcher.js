import onChange from 'on-change';

export default (containers, state, i18next) => {
  const handleForm = (state) => {
    const { input, feedback } = containers;
    const { valid, error } = state.form;

    if (valid) {
      input.classList.remove('is-invalid');
      feedback.textContent = '';
    } else {
      input.classList.add('is-invalid');
      feedback.textContent = i18next.t([`errors.${error}`, 'errors.unknown']);
    }
  };

  const handleFeeds = ({ feeds }) => {
    const { feedsContainer } = containers;

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
      const element = document.createElement('li');
      element.classList.add('list-group-item', 'border-0', 'border-end-0');
      const title = document.createElement('h3');
      title.classList.add('h6', 'm-0');
      title.textContent = feed.title;
      const description = document.createElement('p');
      description.classList.add('m-0', 'small', 'text-black-50');
      description.textContent = feed.description;
      element.append(title, description);
      return element;
    });

    feedsList.append(...feedsItems);
    feedsFragment.appendChild(feedsList);
    feedsContainer.innerHTML = '';
    feedsContainer.appendChild(feedsFragment);
  };

  const handlePosts = ({ posts }) => {
    const { postsContainer } = containers;

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
      const element = document.createElement('li');
      element.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      
      const link = document.createElement('a');
      link.setAttribute('href', post.link);

      link.dataset.id = post.id;
      link.textContent = post.title;
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      element.appendChild(link);
    
      return element;
    });

    postsList.append(...postsListItems);
    postsFragment.appendChild(postsList);
    postsContainer.innerHTML = '';
    postsContainer.appendChild(postsFragment);
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form':
        handleForm(state);
        break;
      case 'feeds':
        handleFeeds(state);
      case 'posts':
        handlePosts(state);  
      default:
        break;
    }
  });

  return watchedState;
};
