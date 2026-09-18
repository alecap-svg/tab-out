/**
 * background.js — Service Worker for Badge Updates
 *
 * Chrome's "always-on" background script for Tab Out.
 * Its only job: keep the toolbar badge showing the current open tab count.
 *
 * Since we no longer have a server, we query chrome.tabs directly.
 * The badge counts real web tabs (skipping chrome:// and extension pages).
 *
 * Color coding gives a quick at-a-glance health signal:
 *   Green  (#3d7a4a) → 1–10 tabs  (focused, manageable)
 *   Amber  (#b8892e) → 11–20 tabs (getting busy)
 *   Red    (#b35a5a) → 21+ tabs   (time to cull!)
 */

// ─── Badge updater ────────────────────────────────────────────────────────────

/**
 * updateBadge()
 *
 * Counts open real-web tabs and updates the extension's toolbar badge.
 * "Real" tabs = not chrome://, not extension pages, not about:blank.
 */
async function updateBadge() {
  try {
    const tabs = await chrome.tabs.query({});

    // Only count actual web pages — skip browser internals and extension pages
    const count = tabs.filter(t => {
      const url = t.url || '';
      return (
        !url.startsWith('chrome://') &&
        !url.startsWith('chrome-extension://') &&
        !url.startsWith('about:') &&
        !url.startsWith('edge://') &&
        !url.startsWith('brave://')
      );
    }).length;

    // Don't show "0" — an empty badge is cleaner
    await chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });

    if (count === 0) return;

    // Pick badge color based on workload level
    let color;
    if (count <= 10) {
      color = '#3d7a4a'; // Green — you're in control
    } else if (count <= 20) {
      color = '#b8892e'; // Amber — things are piling up
    } else {
      color = '#b35a5a'; // Red — time to focus and close some tabs
    }

    await chrome.action.setBadgeBackgroundColor({ color });

  } catch {
    // If something goes wrong, clear the badge rather than show stale data
    chrome.action.setBadgeText({ text: '' });
  }
}

// ─── Opera "Speed Dial" redirect workaround ───────────────────────────────────
//
// Opera does NOT support the standard "chrome_url_overrides.newtab" manifest
// key, so new tabs still load Opera's internal Speed Dial page instead of
// index.html. Opera's internal URL for that page is "chrome://startpageshared/"
// (confirmed via runtime logging — some older Opera docs/forums reference
// "chrome://startpage/" instead, so both variants are matched below for
// compatibility across Opera versions).
//
// Workaround: watch for tabs landing on that URL and immediately redirect
// them to our own newtab page. This has no effect in Chrome/Edge/Brave,
// where the manifest override already does the job and tabs never show
// this URL in the first place — so it's safe to leave in for everyone.

const OWN_NEWTAB_URL = chrome.runtime.getURL('index.html');

const STARTPAGE_PATTERNS = [
  'chrome://startpageshared/', // confirmed for this Opera build
  'chrome://startpage/',       // older/alternate Opera builds
];

function looksLikeStartpage(url) {
  if (!url) return false;
  return STARTPAGE_PATTERNS.some((p) => url.startsWith(p));
}

function redirectIfOperaStartpage(tabId, url) {
  if (looksLikeStartpage(url)) {
    chrome.tabs.update(tabId, { url: OWN_NEWTAB_URL });
  }
}

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.id !== undefined) {
    redirectIfOperaStartpage(tab.id, tab.url || tab.pendingUrl);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  redirectIfOperaStartpage(tabId, changeInfo.url || tab.url || tab.pendingUrl);
});

// ─── Event listeners ──────────────────────────────────────────────────────────

// Update badge when the extension is first installed
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
});

// Update badge when Chrome starts up
chrome.runtime.onStartup.addListener(() => {
  updateBadge();
});

// Update badge whenever a tab is opened
chrome.tabs.onCreated.addListener(() => {
  updateBadge();
});

// Update badge whenever a tab is closed
chrome.tabs.onRemoved.addListener(() => {
  updateBadge();
});

// Update badge when a tab's URL changes (e.g. navigating to/from chrome://)
chrome.tabs.onUpdated.addListener(() => {
  updateBadge();
});

// ─── Initial run ─────────────────────────────────────────────────────────────

// Run once immediately when the service worker first loads
updateBadge();
