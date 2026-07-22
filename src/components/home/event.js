export default function Event() {
    function handleAutoDuck() {
        const checkboxDuck = document.getElementById('checkbox-duck')

        checkboxDuck.addEventListener('change', (e) => {
            if (e.target.checked) {
                console.log('Enable')
            } else {
                console.log('Disabled')
            }
        })
    }

    const range = document.getElementById('range')

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

    handleAutoDuck()
    updateRange()
    handleDuckLevel()
    handleVoiceDetection()
}
