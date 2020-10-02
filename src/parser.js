export default (data) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'text/xml');
  const parseError = dom.querySelector('parsererror');
  if (parseError) {
    throw new Error(parseError.textContent);
  }
  const channelTitle = dom.querySelector('channel > title').textContent;
  const channelDescription = dom.querySelector('channel > description').textContent;
  const itemElements = dom.querySelectorAll('item');

  const items = [...itemElements].map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    return {
      title, link, description,
    };
  });

  return { title: channelTitle, description: channelDescription, items };
};
