import onChange from 'on-change';
import i18next from 'i18next';

const handleForm = (state, elements) => {
  const { form: { valid } } = state;
  const { input, feedback } = elements;
  if (valid) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
    feedback.textContent = i18next.t('exist');
  }
};

const renderFormTranslation = (elements, lang) => {
  const {
    title, hint, submit, link, ru, en, feedback,
  } = elements;
  document.title = i18next.t('title');
  title.textContent = i18next.t('title');
  hint.textContent = i18next.t('hint');
  submit.textContent = i18next.t('button');
  link.setAttribute('placeholder', i18next.t('placeholder'));
  if (feedback.classList.contains('text-success')) {
    feedback.textContent = i18next.t('loaded');
  } else if (feedback.classList.contains('text-danger')) {
    feedback.textContent = i18next.t('exist');
  }
  if (lang === 'en') {
    ru.classList.remove('active');
    en.classList.add('active');
  } else {
    en.classList.remove('active');
    ru.classList.add('active');
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
      feedback.textContent = i18next.t('exist');
      break;
    case 'idle':
      submit.disabled = false;
      input.removeAttribute('readonly');
      input.value = '';
      feedback.classList.add('text-success');
      feedback.textContent = i18next.t('loaded');
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

export default (elements, state) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form':
        handleForm(state, elements);
        break;
      case 'loadingProcess.status':
        handleLoadingProcessStatus(state, elements);
        break;
      case 'feeds':
        handleFeeds(state, elements);
        break;
      case 'lang':
        i18next.changeLanguage(state.lang);
        renderFormTranslation(elements, state.lang);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
