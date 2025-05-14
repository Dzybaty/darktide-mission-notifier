import { BOARD_URL } from '../constants';

export const redirectToTab = () => {
  chrome.tabs.query({}, tabs => {
    const tab = tabs?.find(el => el.url === BOARD_URL);

    if (tab) {
      if (tab.active) {
        return;
      }

      chrome.tabs.update(tab.id, { active: true });

      return;
    }

    chrome.tabs.create({ url: BOARD_URL });
  });
};
