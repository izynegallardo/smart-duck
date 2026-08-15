# Ducker — Privacy Policy

**Last updated:** August 2026

Ducker ("the extension") is a browser extension that automatically lowers the volume of background tabs so the tab you're actively focused on stays clearly audible.

## Data collection

Ducker does **not** collect, store, transmit, or sell any personal data, browsing history, or user activity to any external server, third party, or analytics service. Ducker has no backend server — it runs entirely on your device.

## What data the extension reads, and why

To function, Ducker reads certain information **locally, within your browser only**:

| Data                                                                                          | Purpose                                                                 | Leaves your device?                                             |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| Tab title, favicon, and URL                                                                   | Displayed in the popup so you can identify which tabs are playing audio | No                                                              |
| Whether a tab is currently playing audio (`audible` state)                                    | Used to detect which tabs need ducking                                  | No                                                              |
| Volume/state of `<audio>`/`<video>` elements on a page                                        | Used to lower ("duck") background tab volume                            | No                                                              |
| Captured tab audio stream (for sites like Spotify where standard volume control doesn't work) | Routed through a local Web Audio `GainNode` to adjust volume            | No — processed in-memory and discarded, never recorded or saved |
| Extension settings (theme, ducking level, fade duration, muted/pinned tabs)                   | Saved so your preferences persist between sessions                      | No — stored only in your browser's local extension storage      |

None of the above is ever transmitted off your device, sold, shared with third parties, or used for advertising, analytics, or any purpose other than making the extension work.

## Permissions

Ducker requests the following browser permissions, used only as described:

- **`storage`** — save your settings locally in the browser.
- **`tabs`** — read basic tab info (title, favicon, audible state) to show a list of playing tabs and detect your active tab.
- **`scripting`** — inject the script that finds and adjusts audio/video elements on a page.
- **`tabCapture`** — capture a tab's audio stream for sites where normal volume control doesn't work (e.g. Spotify), so volume can be adjusted via a local Web Audio graph instead.
- **`offscreen`** — required to host the Web Audio processing (`AudioContext`/`GainNode`) used by `tabCapture`, since the background service worker has no DOM.
- **Host permission (`<all_urls>`)** — needed because background tabs playing audio can be on any website; the extension only reads/adjusts media playback, never page content, forms, or personal data.

## Third parties

Ducker does not use any third-party analytics, advertising, or tracking services.

## Changes to this policy

If this policy changes, the "Last updated" date above will be revised accordingly.

## Contact

Questions about this policy can be directed to: **izynehowiedev@gmail.com**
