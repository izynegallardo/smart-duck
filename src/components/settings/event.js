import { getSettings, updateSettings } from '@/core/storage'
import toggleTheme from '@/utils/toggleTheme'
import debounce from '@/utils/debounce'
import hideRatingsSection from '@/utils/hideRatings'

export default function Event() {
    try {
        // TODO: Features
        // Theme color picker
        // Hide ratings section
        // Use Duck Level (duck strength) instead of Background Volume. Using opposite semantics.
        // Other extensions by developer section

        // hide ratings sections
        function handleHideRatings(settings) {
            const checkboxRatingsEl = document.getElementById('checkbox-ratings')

            checkboxRatingsEl.checked = settings.hideRatingsEnabled
            hideRatingsSection(settings.hideRatingsEnabled)

            checkboxRatingsEl.addEventListener('change', (event) => {
                hideRatingsSection(checkboxRatingsEl.checked)
                updateSettings({ hideRatingsEnabled: checkboxRatingsEl.checked })
            })
        }

        function handleSwitchSemantics(settings) {
            const checkboxSemanticsEl = document.getElementById('checkbox-semantics')

            checkboxSemanticsEl.checked = settings.useOppositeSematics

            checkboxSemanticsEl.addEventListener('change', (event) => {
                updateSettings({ useOppositeSematics: checkboxSemanticsEl.checked })
            })
        }

        function updateFadeDuration(settings) {
            const volumeFadeDurationEl = document.getElementById('volume-fade-duration')
            volumeFadeDurationEl.valueAsNumber = settings.fadeDuration

            const debouncedUpdate = debounce((value) => {
                console.log(`debounce value saved to settings -> ${value}`)
                updateSettings({ fadeDuration: value })
            }, 250)

            volumeFadeDurationEl.addEventListener('input', (event) => {
                console.log(`raw input: ${event.target.valueAsNumber}`)
                debouncedUpdate(event.target.valueAsNumber)
            })
        }

        toggleTheme()
        getSettings().then((settings) => {
            handleHideRatings(settings)
            handleSwitchSemantics(settings)
            updateFadeDuration(settings)
        })
    } catch (error) {
        console.log('Settings Event:', error)
    }
}
