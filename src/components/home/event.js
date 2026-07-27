import styles from './component.module.css'
import IconContainer from './icon'
import toggleTheme from '@/utils/toggleTheme'
import rate from '@/utils/rate'
import { MSG, sendMessage } from '@/core/messaging'

export default function Event() {
    try {
        const centerButtom = document.getElementById('center-bottom')
        const range = document.getElementById('range')

        function handleAutoDuck() {
            const checkboxDuck = document.getElementById('checkbox-duck')

            function updateUI() {
                if (checkboxDuck.checked) {
                    console.log('Auto Ducking Enabled')
                    centerButtom.style.opacity = '0.4'
                } else {
                    console.log('Auto Ducking Disabled')
                    centerButtom.style.opacity = '1'
                }
            }

            updateUI()

            checkboxDuck.addEventListener('change', updateUI)
        }

        function updateRange() {
            const value = range.value
            const max = range.max
            const percent = (value / max) * 100

            range.style.background = `linear-gradient(to right,
                #5b6dff 0%,
                #5b6dff ${percent}%,
                #555 ${percent}%,
                #555 100%)`
        }

        range.addEventListener('input', updateRange)

        function handleDuckLevel() {
            const value = document.getElementById('value')

            range.addEventListener('input', () => {
                value.textContent = `${range.value}%`
            })
        }

        function renderStats(summary) {
            document.getElementById('stat-tabs').textContent = summary.tabs
            document.getElementById('stat-playing').textContent = summary.playing
            document.getElementById('stat-ducked').textContent = summary.ducked
        }

        function renderActiveTabs(tabs) {
            let container = ''

            tabs.map((tab) => {
                let waveBars = ''

                if (tab.status === 'playing') {
                    waveBars = `
                        <div class='${styles['liveBadge']}'>
                            <span class='${styles['waveBars']}'>
                                <span class='${styles['wave-bar']}'></span>
                                <span class='${styles['wave-bar']}'></span>
                                <span class='${styles['wave-bar']}'></span>
                            </span>
                            LIVE
                        </div>
                    `
                }

                container += `
                        <div class="${styles['center-bottom-tabs']} ${tab.status === 'playing' ? styles.playing : ''}">
                        <section class='${styles['center-bottom-tabs-left']}'>
                            ${IconContainer({
                                icon: tab.icon,
                                label: `${tab.name} icon`,
                            })}
                        </section>
                        
                        <section class='${styles['center-bottom-tabs-center']}'>
                            <div class='${styles['center-bottom-tabs-center-top']}'>
                                <div style='width:80%'>
                                    <label for='${tab.id}'>${tab.name}</label>
                                    <p style='opacity: 0.8'>${tab.domain}</p>
                                </div>
                                ${waveBars}
                            </div>
                            <div class='${styles['center-bottom-tabs-center-bottom']}'>
                                <input id='${tab.id}' type="range" min="0" max="100" value="20">
                            </div>
                        </section>
                        
                        <section class='${styles['center-bottom-tabs-right']}'>
                                <i class="fa-solid fa-volume"></i>
                                <span>20%</span>
                        </section>
                    </div>
                `
            })

            centerButtom.innerHTML = tabs.length
                ? container
                : `<p class='${styles['center-bottom-p']}'>No active tabs</p>`
        }

        function renderSummary(summary) {
            renderStats(summary)
            renderActiveTabs(summary.list)
        }

        sendMessage(MSG.GET_SUMMARY).then(renderSummary)

        browser.runtime.onMessage.addListener((message) => {
            if (message.type === MSG.SUMMARY_CHANGED) {
                renderSummary(message.payload)
            }
        })

        function handleVoiceDetection() {
            const checkboxDetection = document.getElementById('checkbox-detection')
            const bottomLeft = document.getElementById('bottom-left')

            function updateUI() {
                if (checkboxDetection.checked) {
                    console.log('Voice Detection Enabled')
                    bottomLeft.style.opacity = '1'
                } else {
                    console.log('Voice Detection Disabled')
                    bottomLeft.style.opacity = '0.4'
                }
            }

            updateUI()

            checkboxDetection.addEventListener('change', updateUI)
        }

        toggleTheme()
        rate()
        handleAutoDuck()
        updateRange()
        handleDuckLevel()
        handleVoiceDetection()
    } catch (error) {
        console.log('Home Event:', error)
    }
}
