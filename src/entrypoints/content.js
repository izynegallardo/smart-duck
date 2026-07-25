import { findMediaElements, duck, unduck } from '@/core/ducking'
import { getSettings, watchSettings } from '@/core/storage'
import debounce from '@/utils/debounce'

export default defineContentScript({
    matches: ['<all_urls>'],
    async main() {
        let settings = await getSettings()

        function applyDuckState() {
            let mediaElements = findMediaElements()
            let shouldDuck = false

            if (settings.autoDuckEnabled && document.visibilityState !== 'visible') {
                shouldDuck = true
            }

            mediaElements.forEach((element) => {
                if (shouldDuck) {
                    duck(element, settings.duckLevel)
                } else {
                    unduck(element)
                }
            })
        }

        applyDuckState()

        const observer = new MutationObserver(debounce(() => applyDuckState(), 250))
        observer.observe(document.body, { childList: true, subtree: true })

        document.addEventListener('visibilitychange', applyDuckState)

        watchSettings((newSettings) => {
            settings = newSettings
            applyDuckState()
        })
    },
})
