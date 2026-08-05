import styles from './component.module.css'
import IconContainer from './icon'
import toggleTheme from '@/utils/toggleTheme'
import rate from '@/utils/rate'
import hideRatingsSectionUI from '@/utils/hideRatings'
import { MSG, sendMessage } from '@/core/messaging'
import { getSettings, updateSettings, watchSettings } from '@/core/storage'
import { updateIcons } from '@/helpers/lucide'

export default function Event() {
    try {
        const checkboxDuck = document.getElementById('checkbox-duck')
        const centerButtom = document.getElementById('center-bottom')
        const topRangeEl = document.getElementById('top-range')
        let autoDuckEnabled = true
        let lastTabs = []
        const cleanupFns = []

        function registerCleanup(cleanup) {
            cleanupFns.push(cleanup)
        }

        function addEventListenerWithCleanup(target, eventName, handler) {
            target?.addEventListener(eventName, handler)
            registerCleanup(() => {
                target?.removeEventListener(eventName, handler)
            })
        }

        // mute
        const onMuteClick = (event) => {
            const target = event.target.closest('[data-tab-mute-id]')

            if (!target) return

            const tabId = Number(target.dataset.tabMuteId)
            const isMuted = target.dataset.muted === 'true'
            sendMessage(MSG.SET_TAB_OVERRIDE, { tabId, patch: { muted: !isMuted } })
        }
        addEventListenerWithCleanup(centerButtom, 'click', onMuteClick)

        // pin
        const onPinClick = (event) => {
            const target = event.target.closest('[data-tab-pin-id]')
            if (!target) return

            const tabId = Number(target.dataset.tabPinId)
            const isPinned = target.dataset.pinned === 'true'

            sendMessage(MSG.SET_TAB_OVERRIDE, { tabId, patch: { pinned: !isPinned } })
        }
        addEventListenerWithCleanup(centerButtom, 'click', onPinClick)

        // tab volume slider UI
        const onVolumeInput = (event) => {
            if (event.target.type !== 'range') return

            const target = event.target.closest(`.${styles['center-bottom-tabs']}`)
            const rightSection = target.querySelector(`.${styles['center-bottom-tabs-right']}`)
            const volumeSpan = rightSection?.querySelector('span')

            if (volumeSpan) {
                volumeSpan.textContent = `${event.target.value}%`
            }
        }
        addEventListenerWithCleanup(centerButtom, 'input', onVolumeInput)

        // tab volume slider messanger
        const onVolumeChange = (event) => {
            if (event.target.type !== 'range') return

            const tabId = Number(event.target.id)
            sendMessage(MSG.SET_TAB_OVERRIDE, {
                tabId,
                patch: { volume: Number(event.target.value) },
            })
        }
        addEventListenerWithCleanup(centerButtom, 'change', onVolumeChange)

        // auto duck
        function handleAutoDuckUI(settings) {
            const topSection = document.getElementById('top')
            const checkboxLabel = document.getElementById('checkbox-switch')
            const topRangeDiv = document.getElementById('top-div-range')
            const hiddenClassName = styles['hidden'] || 'hidden'

            checkboxDuck.checked = settings.autoDuckEnabled
            autoDuckEnabled = settings.autoDuckEnabled

            topSection.classList.toggle(hiddenClassName, !autoDuckEnabled)
            topRangeDiv.classList.toggle(hiddenClassName, !autoDuckEnabled)

            checkboxLabel.title = autoDuckEnabled
                ? 'Disable automatic ducking'
                : 'Enable automatic ducking'

            renderActiveTabs(lastTabs)
        }

        const onAutoDuckChange = () => {
            updateSettings({ autoDuckEnabled: checkboxDuck.checked })
        }
        addEventListenerWithCleanup(checkboxDuck, 'change', onAutoDuckChange)

        // top range
        function handleDuckLevelRangeUI(settings) {
            const topRangeLabel = document.getElementById('top-range-label')

            topRangeEl.value = settings.duckLevel
            topRangeLabel.textContent = settings.useOppositeSematics
                ? 'Duck Strength'
                : 'Background Volume'

            updateRangeGradient()
        }

        function updateRangeGradient() {
            const topRangeSpan = document.getElementById('top-range-span')
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

        addEventListenerWithCleanup(topRangeEl, 'input', updateRangeGradient)
        const onDuckLevelChange = () => {
            updateSettings({ duckLevel: Number(topRangeEl.value) })
        }
        addEventListenerWithCleanup(topRangeEl, 'change', onDuckLevelChange)

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

        function onSummaryChanged(message) {
            if (message.type === MSG.SUMMARY_CHANGED) {
                renderSummary(message.payload)
            }
        }

        browser.runtime.onMessage.addListener(onSummaryChanged)

        let onVoiceDetectionChange = null

        function handleVoiceDetectionUI(settings) {
            const checkboxDetection = document.getElementById('checkbox-detection')
            const bottomLeft = document.getElementById('bottom-left')

            if (!checkboxDetection || !bottomLeft) return

            checkboxDetection.checked = settings.voiceDetectionEnabled
            bottomLeft.style.opacity = checkboxDetection.checked ? '1' : '0.4'

            if (!onVoiceDetectionChange) {
                onVoiceDetectionChange = () => {
                    updateSettings({ voiceDetectionEnabled: checkboxDetection.checked })
                }

                addEventListenerWithCleanup(checkboxDetection, 'change', onVoiceDetectionChange)
            }
        }

        rate()
        toggleTheme()

        getSettings().then((settings) => {
            handleAutoDuckUI(settings)
            handleDuckLevelRangeUI(settings)
            handleVoiceDetectionUI(settings)
            hideRatingsSectionUI(settings.hideRatingsEnabled)
        })

        const unwatchSettings = watchSettings((settings) => {
            toggleTheme()
            handleAutoDuckUI(settings)
            handleDuckLevelRangeUI(settings)
            handleVoiceDetectionUI(settings)
            hideRatingsSectionUI(settings.hideRatingsEnabled)
        })

        return () => {
            cleanupFns.forEach((cleanup) => cleanup())
            browser.runtime.onMessage.removeListener(onSummaryChanged)
            unwatchSettings()
        }
    } catch (error) {
        console.log('Home Event:', error)
    }
}
