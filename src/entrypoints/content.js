import { browser } from 'wxt/browser'
import { findMediaElements, duck, unduck, describeMedia } from '@/core/ducking'
import { getSettings, watchSettings } from '@/core/storage'
import { MSG, sendMessage } from '@/core/messaging'
import debounce from '@/utils/debounce'

export default defineContentScript({
    matches: ['<all_urls>'],
    async main() {
        let settings = await getSettings()
        let isPrimary = (await sendMessage(MSG.GET_PRIMARY)).isPrimary

        let isDucked = false

        function applyDuckState() {
            let mediaElements = findMediaElements()

            isDucked = settings.autoDuckEnabled && !isPrimary

            mediaElements.forEach((element) => {
                if (isDucked) {
                    duck(element, settings.duckLevel)
                } else {
                    unduck(element)
                }
            })

            sendMessage(MSG.MEDIA_STATE_CHANGED, {
                ducked: isDucked,
                elements: mediaElements.map(describeMedia),
                url: location.href,
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

        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === MSG.GET_STATE) {
                sendResponse({
                    ducked: isDucked,
                    elements: findMediaElements().map(describeMedia),
                })
            }

            if (message.type === MSG.PRIMARY_CHANGED) {
                isPrimary = message.payload.isPrimary
                applyDuckState()
            }
        })
    },
})
