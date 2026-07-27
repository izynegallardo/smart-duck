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
}

export function sendMessage(type, payload) {
    return browser.runtime.sendMessage({ type, payload })
}

export function sendTabMessage(tabId, type, payload) {
    return browser.tabs.sendMessage(tabId, { type, payload })
}
