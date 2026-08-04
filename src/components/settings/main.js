import styles from './component.module.css'

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
                    <div>
                        <label for='volume-fade-duration' class='${styles['center-div-fade-label']}'>Fade duration (seconds)</label>
                        <input id='volume-fade-duration' type='number' min='0' step='1' value='0' />
                    </div>
                </div>
            </div>
        </section>
        
        <section class='${styles['bottom']}'>
            <h1>My other extensions</h1>
            <div class='${styles['section-container']}'>

            </div>
        </section>
    `
    root.className = styles['main']
}
