const UPDATE_INTERVAL = 60000;
const ICON = '../assets/icon.png';
const ICON_ACTIVE = '../assets/icon_active.png';

const state = {
  isRunning: false,
  notificationChrome: true,
  notificationSound: true,
  query: '',
};

const setState = async values => {
  for (const [key, value] of Object.entries(values)) {
    state[key] = value;
    await chrome.storage.local.set({ [key]: value });
  }

  return Promise.resolve();
};

const handleNotifications = async () => {
  if (state.notificationSound) {
    const offscreenUrl = chrome.runtime.getURL('src/offscreen/index.html');

    await chrome.offscreen.createDocument({
      url: offscreenUrl,
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: 'notification',
    });

    setTimeout(() => chrome.offscreen.closeDocument(), 2000);
  }

  if (state.notificationChrome) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: ICON,
      title: 'Darktide Mission Notifier',
      message: 'Found a mission for you!',
    });
  }

  return Promise.resolve();
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

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.clear();
  await setState({
    isRunning: false,
    notificationChrome: true,
    notificationSound: true,
    query: '',
  });
});

chrome.runtime.onMessage.addListener(async req => {
  if (req.action === 'click') {
    if (!state.isRunning) {
      const res = await sendContentMessage({
        action: 'start',
        query: req.query,
        interval: UPDATE_INTERVAL,
      });

      if (res.success) {
        await setState({
          isRunning: true,
          query: req.query,
          notificationChrome: req.notificationChrome,
          notificationSound: req.notificationSound,
        });
      }

      return Promise.resolve();
    }

    const res = await sendContentMessage({
      action: 'stop',
    });

    if (res.success) {
      await setState({ isRunning: false });

      return Promise.resolve();
    }
  }

  if (req.action === 'found') {
    await setState({ isRunning: false });
    await handleNotifications();

    return Promise.resolve();
  }
});

chrome.storage.onChanged.addListener(async changes => {
  if (changes.isRunning) {
    await updateIcon(changes.isRunning.newValue);
  }
});
