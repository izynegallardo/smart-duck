import styles from './component.module.css'
import IconContainer from './icon'
import toggleTheme from '@/utils/toggleTheme'
import rate from '@/utils/rate'
import hideRatingsSection from '@/utils/hideRatings'
import { MSG, sendMessage } from '@/core/messaging'
import { getSettings, updateSettings } from '@/core/storage'
import { updateIcons } from '@/helpers/lucide'

export default function Event() {
    try {
        const centerButtom = document.getElementById('center-bottom')
        const topRangeEl = document.getElementById('top-range')
        let autoDuckEnabled = true
        let lastTabs = []

        // mute
        centerButtom.addEventListener('click', (event) => {
            const target = event.target.closest('[data-tab-mute-id]')

            if (!target) return

            const tabId = Number(target.dataset.tabMuteId)
            const isMuted = target.dataset.muted === 'true'
            sendMessage(MSG.SET_TAB_OVERRIDE, { tabId, patch: { muted: !isMuted } })
        })

        // pin
        centerButtom.addEventListener('click', (event) => {
            const target = event.target.closest('[data-tab-pin-id]')
            if (!target) return

            const tabId = Number(target.dataset.tabPinId)
            const isPinned = target.dataset.pinned === 'true'

            sendMessage(MSG.SET_TAB_OVERRIDE, { tabId, patch: { pinned: !isPinned } })
        })

        // tab volume slider UI
        centerButtom.addEventListener('input', (event) => {
            if (event.target.type !== 'range') return

            const target = event.target.closest(`.${styles['center-bottom-tabs']}`)
            const rightSection = target.querySelector(`.${styles['center-bottom-tabs-right']}`)
            const volumeSpan = rightSection?.querySelector('span')

            if (volumeSpan) {
                volumeSpan.textContent = `${event.target.value}%`
            }
        })

        // tab volume slider messanger
        centerButtom.addEventListener('change', (event) => {
            if (event.target.type !== 'range') return

            const tabId = Number(event.target.id)
            sendMessage(MSG.SET_TAB_OVERRIDE, {
                tabId,
                patch: { volume: Number(event.target.value) },
            })
        })

        // auto duck
        function handleAutoDuck(settings) {
            const topSection = document.getElementById('top')
            const checkboxDuck = document.getElementById('checkbox-duck')
            const checkboxLabel = document.getElementById('checkbox-switch')
            const topRangeDiv = document.getElementById('top-div-range')

            checkboxDuck.checked = settings.autoDuckEnabled
            autoDuckEnabled = settings.autoDuckEnabled

            renderActiveTabs(lastTabs)

            function updateUI() {
                const hiddenClassName = styles['hidden'] || 'hidden'
                topSection.classList.toggle(hiddenClassName, !checkboxDuck.checked)
                topRangeDiv.classList.toggle(hiddenClassName, !checkboxDuck.checked)
                autoDuckEnabled = checkboxDuck.checked

                checkboxLabel.title = autoDuckEnabled
                    ? 'Disable automatic ducking'
                    : 'Enable automatic ducking'

                renderActiveTabs(lastTabs)
            }

            updateUI()

            checkboxDuck.addEventListener('change', () => {
                updateUI()
                updateSettings({ autoDuckEnabled: checkboxDuck.checked })
                autoDuckEnabled = checkboxDuck.checked
                renderActiveTabs(lastTabs)
            })
        }

        // top range
        function handleDuckLevel(settings) {
            const topRangeSpan = document.getElementById('top-range-span')
            const topRangeLabel = document.getElementById('top-range-label')

            topRangeEl.value = settings.duckLevel

            if (settings.useOppositeSematics) topRangeLabel.textContent = 'Duck Strength'

            function updateRange() {
                const value = topRangeEl.value
                const max = topRangeEl.max || 100
                const percent = (value / max) * 100

                topRangeEl.style.background = `linear-gradient(to right,
                    #5b6dff 0%,
                    #5b6dff ${percent}%,
                    #555 ${percent}%,
                    #555 100%)
                `

                topRangeSpan.textContent = `${value}%`
            }

            updateRange()

            topRangeEl.addEventListener('input', updateRange)

            topRangeEl.addEventListener('change', () => {
                updateSettings({ duckLevel: Number(topRangeEl.value) })
            })
        }

        // top stats
        function renderStats(summary) {
            document.getElementById('stat-tabs').textContent = summary.tabs
            document.getElementById('stat-playing').textContent = summary.playing
            document.getElementById('stat-ducked').textContent = summary.ducked
        }

        // tabs section
        function renderActiveTabs(tabs) {
            lastTabs = tabs

            const sortedTabs = [...tabs].sort((a, b) => {
                if (a.pinned === b.pinned) return 0
                return a.pinned ? -1 : 1
            })

            let container = ''

            sortedTabs.forEach((tab) => {
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
                            
                            <section id='center-bottom-tabs-center' class='${styles['center-bottom-tabs-center']} ${autoDuckEnabled ? styles['hidden'] : ''}'>
                                <div class='${styles['center-bottom-tabs-center-top']}'>
                                    <div style='width:80%'>
                                        <label for='${tab.id}'>${tab.name}</label>
                                        <p style='opacity: 0.8'>${tab.domain}</p>
                                    </div>
                                    ${waveBars}
                                </div>
                                <div class='${styles['center-bottom-tabs-center-bottom']} ${autoDuckEnabled ? styles['hidden'] : ''}'>
                                    <input id='${tab.id}' type="range" min="0" max="100" value='${tab.volume ?? 100}' ${autoDuckEnabled ? 'disabled' : ''}>
                                </div>
                            </section>
                            
                            <section class='${styles['center-bottom-tabs-right']}'>
                                    <i
                                        class='bi ${styles['pin-icon']} ${tab.pinned ? `bi-pin-angle-fill ${styles['pinned']}` : 'bi-pin-angle'}'
                                        data-tab-pin-id='${tab.id}'
                                        data-pinned='${tab.pinned}'
                                        title='${tab.pinned ? 'Unpin' : 'Pin'} ${tab.name}'
                                    ></i>
                                    <i
                                        data-lucide='${tab.muted ? 'volume-x' : 'volume-2'}'
                                        data-tab-mute-id='${tab.id}'
                                        data-muted='${tab.muted}'
                                        title='${tab.muted ? 'Unmute' : 'Mute'} ${tab.name}'
                                    ></i>
                                    <span class='${styles['center-bottom-tabs-right-span']}' style='${autoDuckEnabled ? 'display: none' : ''}'>${tab.volume ?? 100}%</span>
                            </section>
                        </div>
                    `
            })

            centerButtom.innerHTML = tabs.length
                ? container
                : `<p class='${styles['center-bottom-p']}'>No active tabs</p>`

            updateIcons(centerButtom)
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
                    bottomLeft.style.opacity = '1'
                } else {
                    bottomLeft.style.opacity = '0.4'
                }
            }

            updateUI()

            checkboxDetection.addEventListener('change', updateUI)
        }

        toggleTheme()
        rate()
        handleVoiceDetection()
        getSettings().then((settings) => {
            handleAutoDuck(settings)
            handleDuckLevel(settings)
            hideRatingsSection(settings.hideRatingsEnabled)
        })
    } catch (error) {
        console.log('Home Event:', error)
    }
}
