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

const validate = (query, error) => {
  if (!query.value) {
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
  const button = document.getElementById("button");

  const { isRunning, query: queryValue } = await chrome.storage.local.get();

  updateButton(button, isRunning);
  updateField(query, queryValue);
  toggleShowElement(status, isRunning);

  const handleClick = async () => {
    if (!isRunning && !validate(query, error)) {
      return;
    }

    await chrome.runtime.sendMessage({
      action: "click",
      query: query.value,
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
  });
});
