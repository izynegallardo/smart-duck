import { updateIcons } from '@/helpers/lucide'
import { getSettings, updateSettings } from '@/core/storage'

export default async function toggleTheme() {
    const themeButton = document.getElementById('theme-toggle')

    if (!themeButton) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function applyTheme(isDark) {
        document.body.classList.toggle('dark', isDark)

        themeButton.innerHTML = isDark
            ? `<i data-lucide="sun"></i>`
            : `<i class="fa-solid fa-moon" style="color: rgb(255, 212, 59);"></i>`

        updateIcons(themeButton)
    }

    applyTheme(mediaQuery.matches)

    const settings = await getSettings()
    let currentTheme = settings.theme ?? 'system'

    if (currentTheme === 'system') {
        applyTheme(mediaQuery.matches)
    } else if (currentTheme === 'dark') {
        applyTheme(true)
    } else {
        applyTheme(false)
    }

    themeButton.addEventListener('click', async () => {
        const isDark = !document.body.classList.contains('dark')

        applyTheme(isDark)

        currentTheme = isDark ? 'dark' : 'light'

        await updateSettings({ theme: currentTheme })
    })

    mediaQuery.addEventListener('change', (e) => {
        if (currentTheme === 'system') applyTheme(e.matches)
    })
}
