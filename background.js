const UPDATE_INTERVAL = 60000;
const ICON = "icon.png";
const ICON_ACTIVE = "icon_active.png";

const state = {
  isRunning: false,
  notificationChrome: true,
  notificationSound: true,
  query: "",
};

const setState = (values) => {
  for (const [key, value] of Object.entries(values)) {
    state[key] = value;
    chrome.storage.local.set({ [key]: value });
  }
};

const handleNotifications = async () => {
  if (state.notificationSound) {
    await chrome.offscreen.createDocument({
      url: "audio.html",
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: "notification",
    });

    setTimeout(() => chrome.offscreen.closeDocument(), 2000);
  }

  if (state.notificationChrome) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Darktide Mission Notifier",
      message: "Found a mission for you!",
    });
  }
};

const sendContentMessage = async (message) => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  return chrome.tabs.sendMessage(tab.id, message);
};

const setIcon = (icon) => {
  chrome.action.setIcon({ path: icon });
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.clear();
  setState({
    isRunning: false,
    notificationChrome: true,
    notificationSound: true,
    query: "",
  });
});

chrome.runtime.onMessage.addListener(async (req) => {
  if (req.action === "click") {
    if (!state.isRunning) {
      const res = await sendContentMessage({
        action: "start",
        query: req.query,
        interval: UPDATE_INTERVAL,
      });

      if (res.success) {
        setState({
          isRunning: true,
          query: req.query,
          notificationChrome: req.notificationChrome,
          notificationSound: req.notificationSound,
        });

        setIcon(ICON_ACTIVE);
      }

      return;
    }

    const res = await sendContentMessage({
      action: "stop",
    });

    if (res.success) {
      setState({ isRunning: false });
      setIcon(ICON);
    }
  }

  if (req.action === "found") {
    setState({ isRunning: false });
    setIcon(ICON);
    await handleNotifications();
  }
});
