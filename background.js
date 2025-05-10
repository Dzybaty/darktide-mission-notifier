let isRunning = false;

const sendContentMessage = async (message) => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  return chrome.tabs.sendMessage(tab.id, message);
};

const setStorage = async (key, value) => {
  chrome.storage.local.set({ [key]: value });
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.clear();
  setStorage("isRunning", false);
  setStorage("query", "");
  setStorage("interval", "");
});

chrome.runtime.onMessage.addListener(async (req) => {
  if (req.action === "click") {
    if (!isRunning) {
      const res = await sendContentMessage({
        action: "start",
        query: req.query,
        interval: req.interval,
      });

      if (res.success) {
        isRunning = true;
        setStorage("isRunning", true);
        setStorage("query", req.query);
        setStorage("interval", req.interval);
        chrome.action.setIcon({ path: "icon_active.png" });
      }

      return;
    }

    const res = await sendContentMessage({
      action: "stop",
    });

    if (res.success) {
      isRunning = false;
      setStorage("isRunning", false);
      chrome.action.setIcon({ path: "icon.png" });
    }
  }

  if (req.action === "found") {
    isRunning = false;
    setStorage("isRunning", false);
    chrome.action.setIcon({ path: "icon.png" });

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Darktide Mission Notifier",
      message: "Found a mission for you!",
    });

    chrome.tabs.create({
      url: "https://cdn.freesound.org/previews/56/56164_37876-lq.mp3",
    });
  }
});
