import { ACTIONS } from '../constants';
import { redirectToTab } from '../utils/redirect';

import {
  setButtonText,
  setFieldValue,
  setCheckboxValue,
  toggleShowStatus,
  toggleFields,
  initForm,
} from '../utils/form';

document.addEventListener('DOMContentLoaded', async () => {
  redirectToTab();

  const initialFormData = await chrome.storage.local.get();

  const form = {
    mission: {
      name: document.getElementById('mission-name'),
      type: document.getElementById('mission-type'),
      threat: document.getElementById('mission-threat'),
      condition: document.getElementById('mission-condition'),
      books: document.getElementById('mission-books'),
    },
    notifications: {
      chrome: document.getElementById('notification-chrome'),
      sound: document.getElementById('notification-sound'),
    },
    status: document.getElementById('status'),
    button: document.getElementById('button'),
  };

  initForm(form, initialFormData);

  const handleClick = async () => {
    await chrome.runtime.sendMessage({
      action: ACTIONS.CLICK,
      mission: {
        name: form.mission.name.value,
        type: form.mission.type.value,
        threat: form.mission.threat.value,
        condition: form.mission.condition.value,
        books: form.mission.books.value,
      },
      notifications: {
        chrome: form.notifications.chrome.checked,
        sound: form.notifications.sound.checked,
      },
    });
  };

  form.button.addEventListener('click', handleClick);

  chrome.storage.onChanged.addListener(changes => {
    if (changes.isRunning) {
      const { newValue } = changes.isRunning;

      setButtonText(form.button, newValue);
      toggleShowStatus(form.status, newValue);
      toggleFields(newValue, form.mission, form.notifications);
    }

    if (changes.mission) {
      for (const key of Object.keys(changes.mission.newValue)) {
        setFieldValue(form.mission[key], changes.mission.newValue[key]);
      }
    }

    if (changes.notifications) {
      for (const key of Object.keys(changes.notifications.newValue)) {
        setCheckboxValue(
          form.notifications[key],
          changes.notifications.newValue[key],
        );
      }
    }
  });
});
