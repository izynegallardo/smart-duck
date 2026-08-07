export const MSG = {
    GET_STATE: 'GET_STATE',
    MEDIA_STATE_CHANGED: 'MEDIA_STATE_CHANGED',
    SETTINGS_UPDATED: 'SETTINGS_UPDATED',

    GET_SUMMARY: 'GET_SUMMARY',

    SUMMARY_CHANGED: 'SUMMARY_CHANGED',

    GET_PRIMARY: 'GET_PRIMARY',
    PRIMARY_CHANGED: 'PRIMARY_CHANGED',

    GET_TAB_OVERRIDE: 'GET_TAB_OVERRIDE',
    SET_TAB_OVERRIDE: 'SET_TAB_OVERRIDE',
    TAB_OVERRIDE_CHANGED: 'TAB_OVERRIDE_CHANGED',

    REQUEST_CAPTURE: 'REQUEST_CAPTURE',

    CAPTURE_STREAM: 'CAPTURE_STREAM',

    CAPTURE_READY: 'CAPTURE_READY',

    CAPTURE_ENDED: 'CAPTURE_ENDED',

    CAPTURE_STATE_CHANGED: 'CAPTURE_STATE_CHANGED',

    SET_CAPTURED_VOLUME: 'SET_CAPTURED_VOLUME',

    STOP_CAPTURE: 'STOP_CAPTURE',
}

export function sendMessage(type, payload) {
    return browser.runtime.sendMessage({ type, payload })
}

/**
 * Like sendMessage, but targeted at ONE specific tab's content script
 * instead of broadcasting runtime-wide. Nothing else is listening for a
 * message sent this way — only the content script running in `tabId`.
 */
export function sendTabMessage(tabId, type, payload) {
    return browser.tabs.sendMessage(tabId, { type, payload })
}
