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

export default class FormManager {
  constructor(document) {
    this.mission = {
      name: document.getElementById('mission-name'),
      type: document.getElementById('mission-type'),
      threat: document.getElementById('mission-threat'),
      condition: document.getElementById('mission-condition'),
      books: document.getElementById('mission-books'),
    };

    this.notifications = {
      chrome: document.getElementById('notification-chrome'),
      sound: document.getElementById('notification-sound'),
    };

    this.status = document.getElementById('status');
    this.button = document.getElementById('button');
  }

  init(data, onClick) {
    const { isRunning, mission, notifications } = data;

    for (const key of Object.keys(this.mission)) {
      const options = MAP_FIELD_OPTIONS[key];
      this.setFieldOptions(this.mission[key], options);
      this.setFieldValue(this.mission[key], mission[key]);
    }

    for (const key of Object.keys(this.notifications)) {
      this.setCheckboxValue(this.notifications[key], notifications[key]);
    }

    this.toggleShowStatus(isRunning);
    this.setButtonText(isRunning);
    this.toggleFields(isRunning);

    this.button.addEventListener('click', () => {
      const { mission, notifications } = this.getFormData();

      onClick({ mission, notifications });
    });
  }

  setButtonText(isRunning) {
    this.button.textContent = isRunning ? 'STOP' : 'START';
  }

  setFieldValue(field, value) {
    field.value = value;
  }

  setCheckboxValue(field, value) {
    field.checked = value;
  }

  toggleShowStatus(show) {
    this.status.style.display = show ? 'block' : 'none';
  }

  setFieldOptions(field, options) {
    for (const el of options) {
      const option = document.createElement('option');
      option.value = el;
      option.text = el;
      field.appendChild(option);
    }
  }

  toggleFields(isDisabled) {
    for (const field of Object.values(this.mission)) {
      field.disabled = isDisabled;
    }

    for (const field of Object.values(this.notifications)) {
      field.disabled = isDisabled;
    }
  }

  getFormData() {
    const mission = Object.fromEntries(
      Object.entries(this.mission).map(([key, element]) => [
        key,
        element.value,
      ]),
    );

    const notifications = Object.fromEntries(
      Object.entries(this.notifications).map(([key, element]) => [
        key,
        element.checked,
      ]),
    );

    return { mission, notifications };
  }

  handleChanges(changes) {
    if (changes.isRunning) {
      const isRunning = changes.isRunning.newValue;

      this.setButtonText(isRunning);
      this.toggleShowStatus(isRunning);
      this.toggleFields(isRunning);
    }

    if (changes.mission) {
      for (const key of Object.keys(changes.mission.newValue)) {
        this.setFieldValue(this.mission[key], changes.mission.newValue[key]);
      }
    }

    if (changes.notifications) {
      for (const key of Object.keys(changes.notifications.newValue)) {
        this.setCheckboxValue(
          this.notifications[key],
          changes.notifications.newValue[key],
        );
      }
    }
  }
}
