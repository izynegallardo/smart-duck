import { getSettings, updateSettings } from '@/core/storage'

export default async function toggleTheme() {
    const themeModeRadioBtns = document.querySelectorAll('input[name="themeMode"]')
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')

    function applyTheme(isDark) {
        document.body.classList.toggle('dark', isDark)
    }

    function determineThemeState(themeMode) {
        if (themeMode === 'system') {
            return mediaQueryList.matches
        }
        return themeMode === 'dark'
    }

    const settings = await getSettings()
    let currentTheme = settings.theme ?? 'system'

    applyTheme(determineThemeState(currentTheme))

    themeModeRadioBtns.forEach((radio) => {
        radio.checked = radio.value === currentTheme

        radio.addEventListener('change', async (event) => {
            if (event.target.checked) {
                const selectedValue = event.target.value
                currentTheme = selectedValue

                const targetIsDark = determineThemeState(selectedValue)
                applyTheme(targetIsDark)

                await updateSettings({ theme: selectedValue })
            }
        })
    })

    mediaQueryList.addEventListener('change', (event) => {
        if (currentTheme === 'system') applyTheme(event.matches)
    })
}
