export default function toggleTheme() {
    const themeButton = document.getElementById('theme-toggle')

    if (!themeButton) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function applyTheme(isDark) {
        document.body.classList.toggle('dark', isDark)

        themeButton.innerHTML = isDark
            ? `<i class="fa-solid fa-sun" style="color: rgb(255, 212, 59);"></i>`
            : `<i class="fa-solid fa-moon" style="color: rgb(255, 212, 59);"></i>`
    }

    applyTheme(mediaQuery.matches)

    themeButton.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark')
        applyTheme(isDark)
    })

    mediaQuery.addEventListener('change', (e) => {
        applyTheme(e.matches)
    })
}
