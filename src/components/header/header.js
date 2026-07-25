import styles from './component.module.css'

/**
 * Shared header for every page in the popup.
 *
 * @param {HTMLElement} root
 * @param {Object} options
 * @param {string} options.title
 * @param {string} [options.subtitle]
 * @param {string} [options.backHref] - if set, renders a back arrow instead of the logo
 * @param {boolean} [options.showSettingsLink] - if true, renders the gear icon on the right
 */
export default function Header(
    root,
    { title = '', subtitle = '', backHref = null, showSettingsLink = false } = {},
) {
    const left = backHref
        ? `
            <div>
                <a class='${styles['left-a']}' href='${backHref}' aria-label='Back'>
                    <i class="fa-solid fa-angle-left"></i>
                </a>
            </div>
            <div>
                <h1>${title}</h1>
            </div>
        `
        : `
            <div>
                <i class="fa-solid fa-volume"></i>
            </div>
            <div>
                <h1>${title}</h1>
                ${subtitle ? `<p>${subtitle}</p>` : ''}
            </div>
        `

    const settingsLink = showSettingsLink
        ? `
            <a class='${styles['right-a']}' href='#/settings' aria-label='Settings'>
                <i class="fa-solid fa-gear"></i>
            </a>
        `
        : ''

    root.innerHTML = `
        <section class='${styles['left']}'>
            ${left}
        </section>

        <section class='${styles['right']}'>
            <button id='theme-toggle' class='${styles['right-button']}' aria-label='Toggle theme'>
                <i class='fa-solid fa-moon' style='color: rgb(255, 212, 59);'></i>
            </button>
            ${settingsLink}
        </section>
    `
    root.className = styles['header']
}
