import { getSettings, updateSettings } from '@/core/storage'

const ACCENT_CLASSES = ['mist', 'night', 'sunset', 'abyss', 'twilight']

export default async function toggleAccentTheme() {
    const accentThemeSelect = document.querySelector('select[name="accentTheme"]')

    function applyAccentTheme(accentTheme) {
        ACCENT_CLASSES.forEach((className) => document.body.classList.remove(className))

        if (accentTheme !== 'none') {
            document.body.classList.add(accentTheme)
        }
    }

    const settings = await getSettings()
    const currentAccentTheme = settings.accentTheme ?? 'none'

    applyAccentTheme(currentAccentTheme)

    if (!accentThemeSelect) return

    accentThemeSelect.value = currentAccentTheme
    accentThemeSelect.addEventListener('change', async (event) => {
        const selectedValue = event.target.value
        applyAccentTheme(selectedValue)
        await updateSettings({ accentTheme: selectedValue })
    })
}
