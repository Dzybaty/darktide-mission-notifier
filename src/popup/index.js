import { ACTIONS, BOARD_URL } from '../constants';
import {
  MISSION_NAMES,
  MISSION_TYPES,
  MISSION_THREATS,
  MISSION_CONDITIONS,
  MISSION_BOOKS,
} from '../constants/mission';

import {
  updateButtonText,
  updateFieldValue,
  updateCheckboxValue,
  toggleShowMessage,
  generateOptions,
  toggleFields,
} from '../utils/form';

const checkTab = () => {
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

document.addEventListener('DOMContentLoaded', async () => {
  checkTab();

  const name = document.getElementById('mission-name');
  const type = document.getElementById('mission-type');
  const threat = document.getElementById('mission-threat');
  const condition = document.getElementById('mission-condition');
  const books = document.getElementById('mission-books');

  const status = document.getElementById('status');
  const notificationChrome = document.getElementById('notification-chrome');
  const notificationSound = document.getElementById('notification-sound');
  const button = document.getElementById('button');

  const SELECTABLE_FIELDS = {
    name,
    type,
    threat,
    condition,
    books,
  };

  const OPTIONS_FIELDS = {
    notificationChrome,
    notificationSound,
  };

  generateOptions(name, MISSION_NAMES);
  generateOptions(type, MISSION_TYPES);
  generateOptions(threat, MISSION_THREATS);
  generateOptions(condition, MISSION_CONDITIONS);
  generateOptions(books, MISSION_BOOKS);

  const { isRunning, mission, notifications } =
    await chrome.storage.local.get();

  updateButtonText(button, isRunning);

  updateFieldValue(name, mission.name);
  updateFieldValue(type, mission.type);
  updateFieldValue(threat, mission.threat);
  updateFieldValue(condition, mission.condition);
  updateFieldValue(books, mission.books);

  updateCheckboxValue(notificationChrome, notifications.chrome);
  updateCheckboxValue(notificationSound, notifications.sound);

  toggleShowMessage(status, isRunning);
  toggleFields(SELECTABLE_FIELDS, isRunning);
  toggleFields(OPTIONS_FIELDS, isRunning);

  const handleClick = async () => {
    await chrome.runtime.sendMessage({
      action: ACTIONS.CLICK,
      mission: {
        name: name.value,
        type: type.value,
        threat: threat.value,
        condition: condition.value,
        books: books.value,
      },
      notifications: {
        chrome: notificationChrome.checked,
        sound: notificationSound.checked,
      },
    });
  };

  button.addEventListener('click', handleClick);

  chrome.storage.onChanged.addListener(changes => {
    if (changes.isRunning) {
      updateButtonText(button, changes.isRunning.newValue);
      toggleShowMessage(status, changes.isRunning.newValue);
      toggleFields(SELECTABLE_FIELDS, changes.isRunning.newValue);
      toggleFields(OPTIONS_FIELDS, changes.isRunning.newValue);
    }

    if (changes.mission?.name) {
      updateFieldValue(name, changes.mission.name.newValue);
    }

    if (changes.mission?.type) {
      updateFieldValue(type, changes.mission.type.newValue);
    }

    if (changes.mission?.threat) {
      updateFieldValue(threat, changes.mission.threat.newValue);
    }

    if (changes.mission?.condition) {
      updateFieldValue(condition, changes.mission.condition.newValue);
    }

    if (changes.mission?.books) {
      updateFieldValue(books, changes.mission.books.newValue);
    }

    if (changes.notifications?.chrome) {
      updateCheckboxValue(
        notificationChrome,
        changes.notifications.chrome.newValue,
      );
    }

    if (changes.notifications?.sound) {
      updateCheckboxValue(
        notificationSound,
        changes.notifications.sound.newValue,
      );
    }
  });
});
