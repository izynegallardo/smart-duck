import styles from './component.module.css'
import ChromeExtensionLogo from '@/assets/google_chrome_web_store_icon_2022.svg.webp'
import InfoButton from './info'
import { updateIcons } from '@/helpers/lucide'

export default function Main(root) {
    root.innerHTML = `
        <section class='${styles['top']}'>
            <h1>Appearance</h1>
            <div class='${styles['section-container']}'>
                <div class='${styles['top-div-group']}' role='radiogroup' aria-labelledby='theme-mode-label'>
                    <span class='${styles['hidden']}'>Choose theme mode: system, light, or dark mode</span>
                    <label class='${styles['top-div-mode-label']}' id='theme-mode-label'>Mode:</label>
                    <label class='${styles['top-div-mode-option']}'>
                        <input type='radio' name='themeMode' value='system' checked />
                        <span>System</span>
                    </label>
                    <label class='${styles['top-div-mode-option']}'>
                        <input type='radio' name='themeMode' value='light' />
                        <span>Light</span>
                    </label>
                    <label class='${styles['top-div-mode-option']}'>
                        <input type='radio' name='themeMode' value='dark' />
                        <span>Dark</span>
                    </label>
                </div>
                <div class='${styles['top-div-group']}' role='group' aria-describedby='ratings-toggle-desc'>
                    <span id='ratings-toggle-desc' class='${styles['hidden']}'>Show or hide the ratings section on the home page</span>
                    <label for='checkbox-ratings' class='${styles['top-div-rating-label']}'>Hide ratings section: </label>
                    <div class='${styles['checkbox-container']}'>
                        <label class='${styles['checkbox-switch']}'>
                            <input id='checkbox-ratings' type='checkbox'/>
                            <span class='${styles['checkbox-slider']}'></span>
                        </label>
                    </div>
                    ${InfoButton({
                        title: 'Hide the ratings section on the footer',
                        ariaLabel: 'More information about hiding the ratings section',
                    })}
                </div>
            </div>
        </section>
        
        <section class='${styles['center']}'>
            <h1>Audio</h1>
            <div class='${styles['section-container']}'>
                <div class='${styles['center-div-group']}' role='group' aria-describedby='semantics-toggle-desc'>
                    <span id='semantics-toggle-desc' class='${styles['hidden']}'>Use Duck Level (duck strength) instead of Background Volume. Using opposite semantics</span>
                    <label for='checkbox-semantics' class='${styles['center-div-sematics-label']}'>Use opposite semantics:</label>
                    <div class='${styles['checkbox-container']}'>
                        <label class='${styles['checkbox-switch']}'>
                            <input id='checkbox-semantics' type='checkbox'/>
                            <span class='${styles['checkbox-slider']}'></span>
                        </label>
                    </div>
                    ${InfoButton({
                        title: 'Use Duck Strength (how strong ducking will apply) instead of Background Volume',
                        ariaLabel: 'More information about opposite semantics',
                    })}
                    <div class='${styles['number-container']}'>
                        <label for='volume-fade-duration' class='${styles['center-div-fade-label']}'>Fade duration (seconds)</label>
                        <input id='volume-fade-duration' type='number' min='0' step='1' value='0' />
                        ${InfoButton({
                            title: 'Set how long the volume fade lasts when switching tabs',
                            ariaLabel: 'More information about fade duration',
                        })}
                    </div>
                </div>
            </div>
        </section>
        
        <section class='${styles['bottom']}'>
            <h1>My other extensions</h1>
            <div class='${styles['section-container']}'>
                <div class='${styles['bottom-div']}'>
                    <a class='${styles['bottom-a']}' href='#' target='_blank'>
                        <img class='${styles['chrome-extension-logo']}' src='${ChromeExtensionLogo}' alt='chrome extension logo'>
                        <div class='${styles['bottom-div-span-paragraph']}'>
                            <span>Available in the</span>
                            <p>Chrome Web Store</p>
                        </div>
                    </a>
                <div>
            </div>
        </section>
    `

    updateIcons(root)
    root.className = styles['main']
}
