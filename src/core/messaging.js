export const MSG = {
    GET_STATE: 'GET_STATE',
    MEDIA_STATE_CHANGED: 'MEDIA_STATE_CHANGED',
    SETTINGS_UPDATED: 'SETTINGS_UPDATED',
    GET_SUMMARY: 'GET_SUMMARY',
}

export function sendMessage(type, payload) {
    return browser.runtime.sendMessage({ type, payload })
}
