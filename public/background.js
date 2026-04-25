chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error(error));
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'add_current_website') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        // Save to storage so the React app can pick it up
        await chrome.storage.local.set({
          pendingWebsiteAdd: {
            url: activeTab.url,
            title: activeTab.title,
            timestamp: Date.now()
          }
        });
        
        // Open the side panel if it isn't open already
        if (chrome.sidePanel && chrome.sidePanel.open) {
          chrome.sidePanel.open({ windowId: activeTab.windowId }).catch(console.error);
        }
      }
    });
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
