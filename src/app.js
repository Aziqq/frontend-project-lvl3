import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import parse from './parser';
import watch from './watcher';

const baseUrlSchema = yup.string().url().required();
const fetchingTimeout = 3000;

const addProxy = (url) => {
  const proxyUrl = 'https://cors-anywhere.herokuapp.com';
  return `${proxyUrl}/${url}`;
};

const validateUrl = (url, feeds) => {
  const feedUrls = feeds.map((feed) => feed.url);
  const actualUrlSchema = baseUrlSchema.notOneOf(feedUrls);
  try {
    actualUrlSchema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }
};

const fetchNewPosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => {
    const urlWithProxy = addProxy(feed.url);
    return axios.get(urlWithProxy)
      .then((response) => {
        const feedData = parse(response.data);
        const newPosts = feedData.items.map((item) => ({ ...item, channelId: feed.id }));
        const oldPosts = watchedState.posts.filter((post) => post.channelId === feed.id);
        const posts = _.differenceWith(newPosts, oldPosts, (p1, p2) => p1.title === p2.title);
        watchedState.posts.unshift(...posts);
      });
  });
  Promise.all(promises).finally(() => {
    setTimeout(() => fetchNewPosts(watchedState), fetchingTimeout);
  });
};

const loadRss = (watchedState, url) => {
  watchedState.loadingProcess.status = 'loading';
  const urlWithProxy = addProxy(url);
  return axios.get(urlWithProxy, { timeout: 30000 })
    .then((response) => {
      const feedData = parse(response.data);
      const feed = { url, id: _.uniqueId(), title: feedData.title };
      const posts = feedData.items.map((item) => ({ ...item, channelId: feed.id }));
      watchedState.posts.unshift(...posts);
      watchedState.feeds.unshift(feed);

      watchedState.loadingProcess.error = null;
      watchedState.loadingProcess.status = 'idle';
      watchedState.form = {
        ...watchedState.form,
        status: 'filling',
        error: null,
      };
    })
    .catch((e) => {
      watchedState.loadingProcess = {
        error: e,
        status: 'failed',
      };
      throw e;
    });
};

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    feedsBox: document.querySelector('.feeds'),
  };

  const initState = {
    feeds: [],
    posts: [],
    loadingProcess: {
      status: 'idle',
      error: null,
    },
    form: {
      error: null,
      status: 'filling',
      valid: false,
    },
  };

  return new Promise(() => {
    const watchedState = watch(elements, initState);

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      const url = data.get('url');
      const error = validateUrl(url, watchedState.feeds);
      if (!error) {
        watchedState.form = {
          ...watchedState.form,
          valid: true,
          error: null,
        };
        loadRss(watchedState, url);
      } else {
        watchedState.form = {
          ...watchedState.form,
          valid: false,
          error,
        };
      }
    });

    setTimeout(() => fetchNewPosts(watchedState), fetchingTimeout);
  });
};
