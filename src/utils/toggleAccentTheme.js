import { getSettings, updateSettings } from '@/core/storage'

const ACCENT_CLASSES = ['sunset', 'underwater']

export default async function toggleAccentTheme() {
    const accentThemeRadioBtns = document.querySelectorAll('input[name="accentTheme"]')

    function applyAccentTheme(accentTheme) {
        ACCENT_CLASSES.forEach((className) => document.body.classList.remove(className))

        if (accentTheme !== 'none') {
            document.body.classList.add(accentTheme)
        }
    }

    const settings = await getSettings()
    const currentAccentTheme = settings.accentTheme ?? 'none'

    applyAccentTheme(currentAccentTheme)

    accentThemeRadioBtns.forEach((radio) => {
        radio.checked = radio.value === currentAccentTheme

        radio.addEventListener('change', async (event) => {
            if (event.target.checked) {
                const selectedValue = event.target.value
                applyAccentTheme(selectedValue)
                await updateSettings({ accentTheme: selectedValue })
            }
        })
    })
}
