import styles from './component.module.css'
import IconContainer from './icon'
import toggleTheme from '@/utils/toggleTheme'
import rate from '@/utils/rate'

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

        let tabs = [
            {
                icon: 'browser.tab.favicon',
                name: 'Youtube',
                domain: 'youtube.com',
                status: 'stopped', // stopped, playing, ducked
                currentVol: 20,
                isPrimary: false,
                isPinned: false,
                order: 3,
            },
            {
                icon: 'browser.tab.favicon',
                name: 'Spotify',
                domain: 'open.spotify.com',
                status: 'ducked', // stopped, playing, ducked
                currentVol: 20,
                isPrimary: false,
                isPinned: true,
                order: 2,
            },
            {
                icon: 'browser.tab.favicon',
                name: 'Scrimba',
                domain: 'scrimba.com',
                status: 'playing', // stopped, playing, ducked
                currentVol: 80,
                isPrimary: true,
                isPinned: true,
                order: 1,
            },
        ]
        function renderActiveTabs() {
            let container = ''

            if (!tabs.length) return

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
                    <div class='${styles['center-bottom-tabs']}'>
                        <section class='${styles['center-bottom-tabs-left']}'>
                            ${IconContainer({
                                icon: tab.icon,
                                color: 'red',
                                label: `${tab.name} icon`,
                            })}
                        </section>
                        
                        <section class='${styles['center-bottom-tabs-center']}'>
                            <div class='${styles['center-bottom-tabs-center-top']}'>
                                <div style='width:100%'>
                                    <label for='range'>${tab.name}</label>
                                    <p style='opacity: 0.8'>${tab.domain}</p>
                                </div>
                                ${waveBars}
                            </div>
                            <div class='${styles['center-bottom-tabs-center-bottom']}'>
                                <input id='range' type="range" min="0" max="100" value="${tab.currentVol}">
                            </div>
                        </section>
                        
                        <section class='${styles['center-bottom-tabs-right']}'>
                                <i class="fa-solid fa-volume"></i>
                                <span id="value">${tab.currentVol}%</span>
                        </section>
                    </div>
                `
            })

            centerButtom.innerHTML = container
        }

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
        renderActiveTabs()
        handleVoiceDetection()
    } catch (error) {
        console.log('Home Event:', error)
    }
}
