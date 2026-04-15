chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error(error));
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'countdown_alarm') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png', /* Fallback native icon if missing */
      title: 'TeNo Timer',
      message: 'Your countdown has finished!',
      priority: 2
    });
    chrome.storage.local.remove(['countdownEnd', 'timerState', 'accumulatedMs', 'startTime', 'targetDuration']);
  }
});
