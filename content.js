let timeout = null;

const handleFound = async () => {
  await chrome.runtime.sendMessage({ action: "found" });
};

const checkMissionBoard = (query, interval) => {
  let found = false;

  const container = document.querySelector("div#darktide-mission-board")
    .children[1];

  for (let mission of container.children) {
    if (mission.innerHTML.toLowerCase().includes(query.toLowerCase())) {
      found = true;
      mission.style.border = "2px solid red";
    }
  }

  if (found) {
    handleFound();

    return;
  }

  timeout = setTimeout(() => checkMissionBoard(query, interval), interval);
};

chrome.runtime.onMessage.addListener((req, _, sendResponse) => {
  if (req.action === "start") {
    checkMissionBoard(req.query, req.interval * 1000);
    sendResponse({ success: true });
  }

  if (req.action === "stop") {
    if (timeout) {
      clearTimeout(timeout);
    }

    sendResponse({ success: true });
  }
});
