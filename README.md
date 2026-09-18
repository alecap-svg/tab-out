# Tab Out (Opera-compatible fork)

**Keep tabs on your tabs.**

Tab Out is a browser extension that replaces your new tab page with a dashboard of everything you have open. Tabs are grouped by domain, with homepages (Gmail, X, LinkedIn, etc.) pulled into their own group. Close tabs with a satisfying swoosh + confetti.

No server. No account. No external API calls. Just a browser extension.

This is a fork of [zarazhangrui/tab-out](https://github.com/zarazhangrui/tab-out) with one addition: it also works on **Opera**, which doesn't support the standard `chrome_url_overrides.newtab` manifest key that Chrome, Edge, and Brave use. See [Opera compatibility](#opera-compatibility) below for details. All credit for the original extension goes to [Zara](https://x.com/zarazhangrui).

---

## Install with a coding agent

Send your coding agent (Claude Code, Codex, etc.) this repo and say **"install this"**:

```
https://github.com/alecap-svg/tab-out
```

The agent will walk you through it. Takes about 1 minute.

---

## Features

- **See all your tabs at a glance** on a clean grid, grouped by domain
- **Homepages group** pulls Gmail inbox, X home, YouTube, LinkedIn, GitHub homepages into one card
- **Close tabs with style** with swoosh sound + confetti burst
- **Duplicate detection** flags when you have the same page open twice, with one-click cleanup
- **Click any tab to jump to it** across windows, no new tab opened
- **Save for later** bookmark tabs to a checklist before closing them
- **Localhost grouping** shows port numbers next to each tab so you can tell your vibe coding projects apart
- **Expandable groups** show the first 8 tabs with a clickable "+N more"
- **100% local** your data never leaves your machine
- **Pure browser extension** no server, no Node.js, no npm, no setup beyond loading the extension

---

## Manual Setup

**1. Clone the repo**

```bash
git clone https://github.com/alecap-svg/tab-out.git
```

**2. Load the extension**

Chrome / Edge / Brave:
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Navigate to the `extension/` folder inside the cloned repo and select it

Opera:
1. Go to `opera://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Navigate to the `extension/` folder inside the cloned repo and select it

**3. Open a new tab**

You'll see Tab Out.

---

## How it works

```
You open a new tab
  -> Tab Out shows your open tabs grouped by domain
  -> Homepages (Gmail, X, etc.) get their own group at the top
  -> Click any tab title to jump to it
  -> Close groups you're done with (swoosh + confetti)
  -> Save tabs for later before closing them
```

Everything runs inside the browser extension. No external server, no API calls, no data sent anywhere. Saved tabs are stored in `chrome.storage.local`.

---

## Opera compatibility

Opera doesn't support the `chrome_url_overrides.newtab` manifest key that Chrome-family browsers use to replace the new tab page, so a stock Manifest V3 extension using that key silently does nothing in Opera — it keeps showing Opera's own Speed Dial page.

The fix in this fork lives entirely in `extension/background.js`: the service worker watches for tabs that land on Opera's internal Speed Dial URL (`chrome://startpageshared/`, with `chrome://startpage/` also matched as a fallback for older Opera versions) and immediately redirects them to the extension's own `index.html` via `chrome.tabs.update`. This has no effect in Chrome, Edge, or Brave — the manifest override already handles those, and tabs there never show Opera's internal URL in the first place — so the same build works across all four browsers.

One side effect: on Opera you'll briefly see a flash of Speed Dial before the redirect kicks in, since this is a runtime redirect rather than a native override.

---

## Tech stack

| What | How |
|------|-----|
| Extension | Manifest V3 |
| Storage | chrome.storage.local |
| Sound | Web Audio API (synthesized, no files) |
| Animations | CSS transitions + JS confetti particles |

---

## License

MIT — see [LICENSE](LICENSE). Original work Copyright (c) 2026 Zara Zhang.

---

Built by [Zara](https://x.com/zarazhangrui). Opera compatibility fork by Alessia Cappello.
