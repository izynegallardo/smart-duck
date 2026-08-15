import styles from './component.module.css'
import SmartDuckLogo from '@/assets/logo.svg'
import { updateIcons } from '@/helpers/lucide'
import pkg from '../../../package.json'

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
            <div class='${styles['left-div']}'>
                <h1>${title}</h1>
                <span>v${pkg.version}</span>
            </div>
        `
        : `
            <div class='${styles['logo-div']}'>
                <img class='${styles['logo-svg']}' src='${SmartDuckLogo}' alt='Ducker logo, a pixel yellow duck producing sound waves in its beak'>  
            </div>
            <div>
                <h1>${title}</h1>
                ${subtitle ? `<p>${subtitle}</p>` : ''}
            </div>
        `

    const settingsLink = showSettingsLink
        ? `
            <a class='${styles['right-a']}' href='#/settings' aria-label='Settings'>
                <i data-lucide="settings"></i>  
            </a>
        `
        : ''

    root.innerHTML = `
        <section class='${styles['left']}'>
            ${left}
        </section>

        <section class='${styles['right']}'>
            ${settingsLink}
        </section>
    `
    updateIcons(root)
    root.className = styles['header']
}
