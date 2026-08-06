import { browser } from 'wxt/browser'
import { findMediaElements, duck, unduck, describeMedia, toBackgroundVolume } from '@/core/ducking'
import { getSettings, watchSettings } from '@/core/storage'
import { MSG, sendMessage } from '@/core/messaging'
import debounce from '@/utils/debounce'

export default defineContentScript({
    matches: ['<all_urls>'],
    async main() {
        let settings = await getSettings()
        let isPrimary = (await sendMessage(MSG.GET_PRIMARY)).isPrimary
        let isDucked = false
        let {
            muted: isMuted,
            pinned: isPinned,
            volume: tabVolume,
        } = await sendMessage(MSG.GET_TAB_OVERRIDE)

        function applyDuckState(shouldFade = true) {
            let mediaElements = findMediaElements()
            isDucked = settings.autoDuckEnabled && !isPrimary

            const rawLevel = isMuted
                ? 0
                : settings.autoDuckEnabled
                  ? isDucked
                      ? settings.duckLevel
                      : null
                  : tabVolume != null
                    ? tabVolume
                    : null

            const targetDuckLevel =
                !isMuted && rawLevel !== null
                    ? toBackgroundVolume(rawLevel, settings.useOppositeSematics)
                    : rawLevel

            const fadeDuration = shouldFade ? settings.fadeDuration : 0

            mediaElements.forEach((element) => {
                if (targetDuckLevel !== null) {
                    duck(element, targetDuckLevel, fadeDuration)
                } else {
                    unduck(element, fadeDuration)
                }
            })

            sendMessage(MSG.MEDIA_STATE_CHANGED, {
                ducked: isDucked,
                muted: isMuted,
                pinned: isPinned,
                elements: mediaElements.map(describeMedia),
                volume: tabVolume,
                url: location.href,
            })
        }

        applyDuckState(false)

        const observer = new MutationObserver(debounce(() => applyDuckState(), 250))
        observer.observe(document.body, { childList: true, subtree: true })

        document.addEventListener('visibilitychange', () => applyDuckState(true))

        watchSettings((newSettings) => {
            const duckLevelChanged = newSettings.duckLevel !== settings.duckLevel
            settings = newSettings
            applyDuckState(!duckLevelChanged)
        })

        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === MSG.GET_STATE) {
                sendResponse({
                    ducked: isDucked,
                    muted: isMuted,
                    elements: findMediaElements().map(describeMedia),
                    volume: tabVolume,
                })
            }

            if (message.type === MSG.PRIMARY_CHANGED) {
                isPrimary = message.payload.isPrimary
                applyDuckState(true)
            }

            if (message.type === MSG.TAB_OVERRIDE_CHANGED) {
                isMuted = message.payload.muted
                tabVolume = message.payload.volume
                applyDuckState(false)
            }
        })
    },
})
