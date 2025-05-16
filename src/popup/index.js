import { ACTIONS } from '../constants';
import { redirectToTab } from '../utils/redirect';
import FormManager from '../utils/form-manager';

document.addEventListener('DOMContentLoaded', async () => {
  redirectToTab();

  const onClick = async ({ mission, notifications }) => {
    await chrome.runtime.sendMessage({
      action: ACTIONS.CLICK,
      mission,
      notifications,
    });
  };

  const formManager = new FormManager(document);

  const initialFormData = await chrome.storage.local.get();
  formManager.init(initialFormData, onClick);

  chrome.storage.onChanged.addListener(changes => {
    formManager.handleChanges(changes);
  });
});
