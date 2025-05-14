import { ACTIONS } from '../constants';
import { MAP_MISSION_TREAT } from '../constants/mission';

let timeout = null;

const handleFound = async () => {
  await chrome.runtime.sendMessage({ action: ACTIONS.FOUND });
};

const generateSearchParameters = mission => {
  let shouldIncludeAuric = false;
  const mappedParams = Object.keys(mission).map(key => {
    if (mission[key] === 'Any') {
      return null;
    }

    if (key === 'threat') {
      shouldIncludeAuric = mission[key].includes('[AURIC]');

      return MAP_MISSION_TREAT[mission[key]];
    }

    // Custom case because every element has this text
    if (key === 'books' && mission[key] === 'Grimoires') {
      return 'grimoire.png';
    }

    return mission[key];
  });

  if (shouldIncludeAuric) {
    mappedParams.push('auric');
  }

  return mappedParams.filter(param => !!param);
};

const matchesSearchParams = (data, params) =>
  params.every(param => data.includes(param));

const checkMissionBoard = (mission, interval) => {
  let found = false;

  const searchParams = generateSearchParameters(mission);

  const container = document.querySelector('div#darktide-mission-board')
    .children[1];

  for (const mission of container.children) {
    if (matchesSearchParams(mission.innerHTML, searchParams)) {
      found = true;
      mission.style.border = '2px solid red';
    }
  }

  if (found) {
    handleFound();

    return;
  }

  timeout = setTimeout(() => checkMissionBoard(mission, interval), interval);
};

chrome.runtime.onMessage.addListener((req, _, sendResponse) => {
  if (req.action === ACTIONS.START) {
    checkMissionBoard(req.mission, req.interval);
    sendResponse({ success: true });
  }

  if (req.action === ACTIONS.STOP) {
    if (timeout) {
      clearTimeout(timeout);
    }

    sendResponse({ success: true });
  }
});
