const checkTab = () => {
  const main = document.getElementById("main");
  const unavailable = document.getElementById("unavailable");

  chrome.tabs.query(
    {
      active: true,
      lastFocusedWindow: true,
    },
    (tabs) => {
      if (tabs[0].url === "https://darktide.gameslantern.com/mission-board") {
        unavailable.style.display = "none";
        return;
      }

      main.style.display = "none";
    }
  );
};

const updateButton = (button, isRunning) => {
  button.textContent = isRunning ? "STOP" : "START";
};

const updateField = (field, value) => {
  field.value = value;
};

const toggleShowElement = (element, isShown) => {
  if (isShown) {
    element.style.display = "block";
    return;
  }

  element.style.display = "none";
};

const validate = (query, interval, error) => {
  if (!query.value || !interval.value) {
    toggleShowElement(error, true);

    return false;
  }

  toggleShowElement(error, false);

  return true;
};

document.addEventListener("DOMContentLoaded", async () => {
  checkTab();
  const error = document.getElementById("error");
  const status = document.getElementById("status");
  const query = document.getElementById("query");
  const interval = document.getElementById("interval");
  const button = document.getElementById("button");

  const {
    isRunning,
    query: queryValue,
    interval: intervalValue,
  } = await chrome.storage.local.get();

  updateButton(button, isRunning);
  updateField(query, queryValue);
  updateField(interval, intervalValue);
  toggleShowElement(status, isRunning);

  const handleClick = async () => {
    if (!isRunning && !validate(query, interval, error)) {
      return;
    }

    await chrome.runtime.sendMessage({
      action: "click",
      query: query.value,
      interval: interval.value,
    });
  };

  button.addEventListener("click", handleClick);

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.isRunning) {
      updateButton(button, changes.isRunning.newValue);
      toggleShowElement(status, changes.isRunning.newValue);
    }

    if (changes.query) {
      updateField(query, changes.query.newValue);
    }

    if (changes.interval) {
      updateField(interval, changes.interval.newValue);
    }
  });
});
