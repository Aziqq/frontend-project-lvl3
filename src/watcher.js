import onChange from 'on-change';

const handleForm = (state, elements) => {
  const { form: { valid, error } } = state;
  const { input, feedback } = elements;
  if (valid) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = error;
  }
};

const handleLoadingProcessStatus = (state, elements) => {
  const { loadingProcess } = state;
  const { submit, input, feedback } = elements;
  switch (loadingProcess.status) {
    case 'failed':
      submit.disabled = false;
      input.removeAttribute('readonly');
      feedback.classList.add('text-danger');
      feedback.textContent = loadingProcess.error;
      break;
    case 'idle':
      submit.disabled = false;
      input.removeAttribute('readonly');
      input.value = '';
      feedback.classList.add('text-success');
      feedback.textContent = 'Rss loaded';
      input.focus();
      break;
    case 'loading':
      submit.disabled = true;
      input.setAttribute('readonly', true);
      feedback.classList.remove('text-success');
      feedback.classList.remove('text-danger');
      feedback.innerHTML = '';
      break;
    default:
      throw new Error(`Unknown loadingProcess status: '${loadingProcess.status}'`);
  }
};

const handleFeeds = (state, elements) => {
  const { feeds, posts } = state;
  const { feedsBox } = elements;
  const html = feeds.map((feed) => {
    const feedPosts = posts.filter((p) => p.channelId === feed.id);
    const title = `<h2>${feed.title}</h2>`;
    const content = feedPosts.map((item) => {
      const line = `<div><a href="${item.link}">${item.title}</a></div>`;
      return line;
    }).join('\n');
    return [title, content].join('\n');
  }).join('\n');

  feedsBox.innerHTML = html;
};

export default (elements, initState) => {
  const watchedState = onChange(initState, (path) => {
    switch (path) {
      case 'form':
        handleForm(initState, elements);
        break;
      case 'loadingProcess.status':
        handleLoadingProcessStatus(initState, elements);
        break;
      case 'feeds':
        handleFeeds(initState, elements);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
