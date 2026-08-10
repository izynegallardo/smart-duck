import { storage } from '@wxt-dev/storage'

const DEFAULT_SETTINGS = {
    duckLevel: 20,
    fadeDuration: 0,
    autoDuckEnabled: true,
    theme: 'system',
    accentTheme: 'none',
    hideRatingsEnabled: false,
    useOppositeSematics: false,
}

export const settingsStorage = storage.defineItem('local:settings', {
    fallback: DEFAULT_SETTINGS,
    version: 1,
})

export async function getSettings() {
    return settingsStorage.getValue()
}

/**
 * Read-modify-write: reads the current settings, merges `patch` on top,
 * and persists the merged result.
 *
 * @param {Partial<typeof DEFAULT_SETTINGS>} patch - only the fields that changed, e.g. { duckLevel: 40 }
 */
export async function updateSettings(patch) {
    const current = await settingsStorage.getValue()
    const next = { ...current, ...patch }
    await settingsStorage.setValue(next)
    return next
}

/**
 * @param {(newSettings: typeof DEFAULT_SETTINGS, oldSettings: typeof DEFAULT_SETTINGS) => void} callback
 * @returns {() => void} unwatch function
 */
export function watchSettings(callback) {
    return settingsStorage.watch(callback)
}
