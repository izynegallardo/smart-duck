import { getSettings, updateSettings, watchSettings } from '@/core/storage'
import toggleTheme from '@/utils/toggleTheme'
import toggleAccentTheme from '@/utils/toggleAccentTheme'
import debounce from '@/utils/debounce'
import hideRatingsSection from '@/utils/hideRatings'
import rate from '@/utils/rate'

export default function Event() {
    try {
        const cleanupFns = []

        function registerCleanup(cleanup) {
            cleanupFns.push(cleanup)
        }

        let onRatingsChange = null
        let onSemanticsChange = null
        let onPrimaryAudibleChange = null
        let onVolumeInput = null
        let debouncedUpdate = null

        // hide ratings sections
        function handleHideRatings(settings) {
            const checkboxRatingsEl = document.getElementById('checkbox-ratings')
            if (!checkboxRatingsEl) return

            if (!onRatingsChange) {
                onRatingsChange = () => {
                    hideRatingsSection(checkboxRatingsEl.checked)
                    updateSettings({ hideRatingsEnabled: checkboxRatingsEl.checked })
                }

                checkboxRatingsEl.addEventListener('change', onRatingsChange)
                registerCleanup(() => {
                    checkboxRatingsEl.removeEventListener('change', onRatingsChange)
                })
            }

            checkboxRatingsEl.checked = settings.hideRatingsEnabled
            hideRatingsSection(settings.hideRatingsEnabled)
        }

        function handleSwitchSemantics(settings) {
            const checkboxSemanticsEl = document.getElementById('checkbox-semantics')
            if (!checkboxSemanticsEl) return

            if (!onSemanticsChange) {
                onSemanticsChange = () => {
                    updateSettings({ useOppositeSematics: checkboxSemanticsEl.checked })
                }

                checkboxSemanticsEl.addEventListener('change', onSemanticsChange)
                registerCleanup(() => {
                    checkboxSemanticsEl.removeEventListener('change', onSemanticsChange)
                })
            }

            checkboxSemanticsEl.checked = settings.useOppositeSematics
        }

        function handleDuckOnlyWhenPrimaryAudible(settings) {
            const checkboxPrimaryAudibleEl = document.getElementById('checkbox-primary-audible')
            if (!checkboxPrimaryAudibleEl) return

            if (!onPrimaryAudibleChange) {
                onPrimaryAudibleChange = () => {
                    updateSettings({
                        duckOnlyWhenPrimaryAudible: checkboxPrimaryAudibleEl.checked,
                    })
                }

                checkboxPrimaryAudibleEl.addEventListener('change', onPrimaryAudibleChange)
                registerCleanup(() => {
                    checkboxPrimaryAudibleEl.removeEventListener('change', onPrimaryAudibleChange)
                })
            }

            checkboxPrimaryAudibleEl.checked = settings.duckOnlyWhenPrimaryAudible
        }

        function updateFadeDuration(settings) {
            const volumeFadeDurationEl = document.getElementById('volume-fade-duration')
            if (!volumeFadeDurationEl) return

            if (!debouncedUpdate) {
                debouncedUpdate = debounce((value) => {
                    // console.log(`debounce value saved to settings -> ${value}`)
                    updateSettings({ fadeDuration: value })
                }, 250)
            }

            if (!onVolumeInput) {
                onVolumeInput = (event) => {
                    // console.log(`raw input: ${event.target.valueAsNumber}`)
                    if (volumeFadeDurationEl.value < 0) {
                        volumeFadeDurationEl.valueAsNumber = 1
                    } else if (volumeFadeDurationEl.value > 20) {
                        volumeFadeDurationEl.valueAsNumber = 20
                    }

                    debouncedUpdate(event.target.valueAsNumber)
                }

                volumeFadeDurationEl.addEventListener('input', onVolumeInput)
                registerCleanup(() => {
                    volumeFadeDurationEl.removeEventListener('input', onVolumeInput)
                    debouncedUpdate.cancel()
                })
            }

            volumeFadeDurationEl.valueAsNumber = settings.fadeDuration
        }

        rate()
        toggleTheme()
        toggleAccentTheme()

        getSettings().then((settings) => {
            handleHideRatings(settings)
            handleSwitchSemantics(settings)
            updateFadeDuration(settings)
            handleDuckOnlyWhenPrimaryAudible(settings)
        })

        const unwatchSettings = watchSettings((settings) => {
            toggleTheme()
            toggleAccentTheme()
            handleHideRatings(settings)
            handleSwitchSemantics(settings)
            updateFadeDuration(settings)
            handleDuckOnlyWhenPrimaryAudible(settings)
        })

        return () => {
            cleanupFns.forEach((cleanup) => cleanup())
            unwatchSettings()
        }
    } catch (error) {
        console.log('Settings Event:', error)
    }
}
