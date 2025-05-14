import {
  MISSION_NAMES,
  MISSION_TYPES,
  MISSION_THREATS,
  MISSION_CONDITIONS,
  MISSION_BOOKS,
} from '../constants/mission';

const MAP_FIELD_OPTIONS = {
  name: MISSION_NAMES,
  type: MISSION_TYPES,
  threat: MISSION_THREATS,
  condition: MISSION_CONDITIONS,
  books: MISSION_BOOKS,
};

export const setButtonText = (button, isRunning) => {
  button.textContent = isRunning ? 'STOP' : 'START';
};

export const setFieldValue = (field, value) => {
  field.value = value;
};

export const setCheckboxValue = (field, value) => {
  field.checked = value;
};

export const toggleShowStatus = (element, isShown) => {
  if (isShown) {
    element.style.display = 'block';

    return;
  }

  element.style.display = 'none';
};

const setFieldOptions = (field, options) => {
  for (const el of options) {
    const option = document.createElement('option');
    option.value = el;
    option.text = el;
    field.appendChild(option);
  }
};

export const toggleFields = (isDisabled, ...groups) => {
  for (const group of groups) {
    for (const field of Object.values(group)) {
      field.disabled = isDisabled;
    }
  }
};

export const initForm = (form, data) => {
  const { isRunning, mission, notifications } = data;

  for (const key of Object.keys(form.mission)) {
    const options = MAP_FIELD_OPTIONS[key];
    setFieldOptions(form.mission[key], options);
    setFieldValue(form.mission[key], mission[key]);
  }

  for (const key of Object.keys(form.notifications)) {
    setCheckboxValue(form.notifications[key], notifications[key]);
  }

  toggleShowStatus(form.status, isRunning);
  setButtonText(form.button, isRunning);

  toggleFields(isRunning, form.mission, form.notifications);
};
