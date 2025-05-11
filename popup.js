const checkTab = () => {
  const URL = "https://darktide.gameslantern.com/mission-board";

  chrome.tabs.query({}, (tabs) => {
    const tab = tabs?.find((el) => el.url === URL);

    if (tab) {
      if (tab.active) {
        return;
      }

      chrome.tabs.update(tab.id, { active: true });

      return;
    }

    chrome.tabs.create({ url: URL });
  });
};

const updateButton = (button, isRunning) => {
  button.textContent = isRunning ? "STOP" : "START";
};

const updateField = (field, key, value) => {
  field[key] = value;
};

const toggleShowMessage = (element, isShown) => {
  if (isShown) {
    element.style.display = "block";
    return;
  }

  element.style.display = "none";
};

const toggleDisableElements = (elements, value) => {
  for (const element of elements) {
    element.disabled = value;
  }
};

const validate = (query, error) => {
  if (!query.value) {
    toggleShowMessage(error, true);

    return false;
  }

  toggleShowMessage(error, false);

  return true;
};

document.addEventListener("DOMContentLoaded", async () => {
  checkTab();
  const error = document.getElementById("error");
  const status = document.getElementById("status");
  const query = document.getElementById("query");
  const notificationChrome = document.getElementById("notification-chrome");
  const notificationSound = document.getElementById("notification-sound");
  const button = document.getElementById("button");

  const {
    isRunning,
    query: queryValue,
    notificationChrome: notificationChromeValue,
    notificationSound: notificationSoundValue,
  } = await chrome.storage.local.get();

  updateButton(button, isRunning);
  updateField(query, "value", queryValue);
  updateField(notificationChrome, "checked", notificationChromeValue);
  updateField(notificationSoundValue, "checked", notificationSoundValue);
  toggleShowMessage(status, isRunning);
  toggleDisableElements([notificationChrome, notificationSound], isRunning);

  const handleClick = async () => {
    if (!isRunning && !validate(query, error)) {
      return;
    }

    await chrome.runtime.sendMessage({
      action: "click",
      query: query.value,
      notificationChrome: notificationChrome.checked,
      notificationSound: notificationSound.checked,
    });
  };

  button.addEventListener("click", handleClick);

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.isRunning) {
      updateButton(button, changes.isRunning.newValue);
      toggleShowMessage(status, changes.isRunning.newValue);
      toggleDisableElements(
        [notificationChrome, notificationSound],
        changes.isRunning.newValue
      );
    }

    if (changes.query) {
      updateField(query, "value", changes.query.newValue);
    }

    if (changes.notificationChrome) {
      updateField(
        notificationChrome,
        "checked",
        changes.notificationChrome.newValue
      );
    }

    if (changes.notificationSound) {
      updateField(
        notificationSound,
        "checked",
        changes.notificationSound.newValue
      );
    }
  });
});
