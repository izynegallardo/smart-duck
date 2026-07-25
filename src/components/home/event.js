import toggleTheme from '@/utils/toggleTheme'
import rate from '@/utils/rate'

export default function Event() {
    try {
        const centerButtomDiv = document.getElementById('center-bottom-tab-div')
        const range = document.getElementById('range')

        function handleAutoDuck() {
            const checkboxDuck = document.getElementById('checkbox-duck')

            function updateUI() {
                if (checkboxDuck.checked) {
                    console.log('Auto Ducking Enabled')
                    centerButtomDiv.style.opacity = '0.4'
                } else {
                    console.log('Auto Ducking Disabled')
                    centerButtomDiv.style.opacity = '1'
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

        function renderActiveTabs() {}

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
