export const updateButtonText = (button, isRunning) => {
  button.textContent = isRunning ? 'STOP' : 'START';
};

export const updateFieldValue = (field, value) => {
  field.value = value;
};

export const updateCheckboxValue = (field, value) => {
  field.checked = value;
};

export const toggleShowMessage = (element, isShown) => {
  if (isShown) {
    element.style.display = 'block';

    return;
  }

  element.style.display = 'none';
};

export const generateOptions = (field, options) => {
  for (const el of options) {
    const option = document.createElement('option');
    option.value = el;
    option.text = el;
    field.appendChild(option);
  }
};

export const toggleFields = (fields, isDisabled) => {
  for (const field of Object.values(fields)) {
    field.disabled = isDisabled;
  }
};
