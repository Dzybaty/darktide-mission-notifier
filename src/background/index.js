import { ACTIONS, UPDATE_INTERVAL, ICON, ICON_ACTIVE } from '../constants';

const defaultState = {
  isRunning: false,
  mission: {
    name: 'Any',
    type: 'Any',
    threat: 'Any',
    condition: 'Any',
    books: 'Any',
  },
  notifications: {
    chrome: true,
    sound: true,
  },
};

const setState = async newValues => {
  await chrome.storage.local.set(newValues);
};

const init = async () => {
  await chrome.storage.local.clear();
  await setState(defaultState);
};

const handleNotifications = async () => {
  const { notifications } = await chrome.storage.local.get();

  if (notifications.sound) {
    const offscreenUrl = chrome.runtime.getURL('offscreen.html');

    await chrome.offscreen.createDocument({
      url: offscreenUrl,
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: 'notification',
    });

    setTimeout(() => chrome.offscreen.closeDocument(), 2000);
  }

  if (notifications.chrome) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: ICON,
      title: 'Darktide Mission Notifier',
      message: 'Found a mission for you!',
    });
  }
};

const sendContentMessage = async message => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  return chrome.tabs.sendMessage(tab.id, message);
};

const updateIcon = async active =>
  chrome.action.setIcon({ path: active ? ICON_ACTIVE : ICON });

chrome.runtime.onMessage.addListener(async req => {
  const { isRunning } = await chrome.storage.local.get();

  if (req.action === ACTIONS.CLICK) {
    if (!isRunning) {
      const res = await sendContentMessage({
        action: ACTIONS.START,
        mission: req.mission,
        interval: UPDATE_INTERVAL,
      });

      if (res.success) {
        return setState({
          isRunning: true,
          mission: req.mission,
          notifications: req.notifications,
        });
      }
    }

    const res = await sendContentMessage({
      action: ACTIONS.STOP,
    });

    if (res.success) {
      await setState({ isRunning: false });
    }
  }

  if (req.action === ACTIONS.FOUND) {
    await setState({
      isRunning: false,
      mission: defaultState.mission,
    });

    await handleNotifications();
  }
});

chrome.storage.onChanged.addListener(async changes => {
  if (changes.isRunning) {
    await updateIcon(changes.isRunning.newValue);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  await init();
});

chrome.runtime.onInstalled.addListener(async () => {
  await init();
});
