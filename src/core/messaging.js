export const MSG = {
    // your code here
    GET_STATE: 'GET_STATE',
    MEDIA_STATE_CHANGED: 'MEDIA_STATE_CHANGED',
    SETTINGS_UPDATED: 'SETTINGS_UPDATED',
}

export function sendMessage(type, payload) {
    // your code here
    return browser.runtime.sendMessage({ type, payload })
}
