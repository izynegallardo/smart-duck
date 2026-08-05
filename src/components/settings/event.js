import { getSettings, updateSettings, watchSettings } from '@/core/storage'
import toggleTheme from '@/utils/toggleTheme'
import debounce from '@/utils/debounce'
import hideRatingsSection from '@/utils/hideRatings'
import rate from '@/utils/rate'

export default function Event() {
    try {
        // TODO: Features
        // Theme color picker
        // Hide ratings section
        // Use Duck Level (duck strength) instead of Background Volume. Using opposite semantics.
        // Other extensions by developer section

        const cleanupFns = []

        function registerCleanup(cleanup) {
            cleanupFns.push(cleanup)
        }

        let onRatingsChange = null
        let onSemanticsChange = null
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

        getSettings().then((settings) => {
            handleHideRatings(settings)
            handleSwitchSemantics(settings)
            updateFadeDuration(settings)
        })

        const unwatchSettings = watchSettings((settings) => {
            toggleTheme()
            handleHideRatings(settings)
            handleSwitchSemantics(settings)
            updateFadeDuration(settings)
        })

        return () => {
            cleanupFns.forEach((cleanup) => cleanup())
            unwatchSettings()
        }
    } catch (error) {
        console.log('Settings Event:', error)
    }
}
