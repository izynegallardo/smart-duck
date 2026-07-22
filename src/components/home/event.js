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
        const checkboxDectection = document.getElementById('checkbox-detection')

        checkboxDectection.addEventListener('change', (e) => {
            if (e.target.checked) {
                console.log('Voice Detection Enable')
            } else {
                console.log('Voice Detection Disabled')
            }
        })
    }

    handleAutoDuck()
    updateRange()
    handleDuckLevel()
    handleVoiceDetection()
}
