const UPDATE_INTERVAL = 60000;
let isRunning = false;
let notificationChrome = true;
let notificationSound = true;

const handleNotifications = async () => {
  if (notificationSound) {
    await chrome.offscreen.createDocument({
      url: "audio.html",
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: "notification",
    });

    setTimeout(() => chrome.offscreen.closeDocument(), 2000);
  }

  if (notificationChrome) {
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

const setStorage = (values) => {
  for (const [key, value] of Object.entries(values)) {
    chrome.storage.local.set({ [key]: value });
  }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.clear();
  setStorage({
    isRunning: false,
    notificationChrome: true,
    notificationSound: true,
    query: "",
  });
});

chrome.runtime.onMessage.addListener(async (req) => {
  if (req.action === "click") {
    if (!isRunning) {
      const res = await sendContentMessage({
        action: "start",
        query: req.query,
        interval: UPDATE_INTERVAL,
      });

      if (res.success) {
        isRunning = true;
        notificationChrome = req.notificationChrome;
        notificationSound = req.notificationSound;

        setStorage({
          isRunning: true,
          query: req.query,
          notificationChrome: req.notificationChrome,
          notificationSound: req.notificationSound,
        });

        chrome.action.setIcon({ path: "icon_active.png" });
      }

      return;
    }

    const res = await sendContentMessage({
      action: "stop",
    });

    if (res.success) {
      isRunning = false;
      setStorage({ isRunning: false });
      chrome.action.setIcon({ path: "icon.png" });
    }
  }

  if (req.action === "found") {
    isRunning = false;
    setStorage({ isRunning: false });
    chrome.action.setIcon({ path: "icon.png" });
    await handleNotifications();
  }
});
