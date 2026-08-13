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

                <div class='${styles['top-div-group']} ${styles['no-wrap']}' role='group' aria-labelledby='accent-theme-label'>
                    <span class='${styles['hidden']}'>Choose an accent theme that layers on top of light or dark mode</span>
                    <label class='${styles['top-div-mode-label']}' id='accent-theme-label' for='accent-theme-select'>Accent:</label>
                    <select id='accent-theme-select' name='accentTheme' class='${styles['top-div-select']}'>
                        <option value='none'>None</option>
                        <option value='mist'>Mist</option>
                        <option value='night'>Night</option>
                        <option value='sunset'>Sunset</option>
                        <option value='abyss'>Abyss</option>
                        <option value='twilight'>Twilight</option>
                    </select>
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
                        <input id='volume-fade-duration' type='number' min='0' max='20' step='1' value='0' />
                        ${InfoButton({
                            title: 'Set how long the volume fade lasts when switching tabs',
                            ariaLabel: 'More information about fade duration',
                        })}
                    </div>
                </div>

                <div class='${styles['center-div-group']}' role='group' aria-describedby='primary-audible-toggle-desc'>
                    <span id='primary-audible-toggle-desc' class='${styles['hidden']}'>Only duck background tabs while the active tab is itself playing audio</span>
                    <label for='checkbox-primary-audible' class='${styles['center-div-sematics-label']}'>Duck only when tab is playing:</label>
                    <div class='${styles['checkbox-container']}'>
                        <label class='${styles['checkbox-switch']}'>
                            <input id='checkbox-primary-audible' type='checkbox'/>
                            <span class='${styles['checkbox-slider']}'></span>
                        </label>
                    </div>
                    ${InfoButton({
                        title: 'Background tabs are only ducked while your active tab is actually making sound. If your active tab is silent, background tabs play at full volume.',
                        ariaLabel:
                            'More information about only ducking when the active tab is playing',
                    })}
                </div>
            </div>
        </section>
        
        <section class='${styles['bottom']}'>
            <h1>Troubleshooting</h1>
            <div class='${styles['section-container']}'>
            <div class='${styles['bottom-div']}'>
                    <ul>
                        <li>Disable/enable "Auto Duck" or adjust the volume slider</li>
                        <li>Refresh the tab where the issue occurs</li>
                        <li>Check if any settings are enabled/disabled</li>
                        <li>Disable other installed audio extensions</li>
                        <li>Restart or close the browser</li>
                        <li>Reinstall the extension</li>
                    </ul>
                </div>
            </div>
        </section>
    `

    updateIcons(root)
    root.className = styles['main']
}
