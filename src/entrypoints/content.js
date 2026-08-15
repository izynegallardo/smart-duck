import { browser } from 'wxt/browser'
import { findMediaElements, duck, unduck, describeMedia, toBackgroundVolume } from '@/core/ducking'
import { getSettings, watchSettings } from '@/core/storage'
import { MSG, sendMessage } from '@/core/messaging'
import debounce from '@/utils/debounce'
import showPageToast from '@/utils/pageToast'

const SLIDER_FADE_DURATION = 0.1

export default defineContentScript({
    matches: ['<all_urls>'],
    allFrames: true,
    async main() {
        let settings = await getSettings()
        let { isPrimary, isPrimaryAudible } = await sendMessage(MSG.GET_PRIMARY)
        let isCaptured = (await sendMessage(MSG.GET_CAPTURE_STATE)).isCaptured
        let isDucked = false
        let {
            muted: isMuted,
            pinned: isPinned,
            volume: tabVolume,
        } = await sendMessage(MSG.GET_TAB_OVERRIDE)

        function applyDuckState(shouldFade = true, fadeDurationOverride = null) {
            let mediaElements = findMediaElements()
            isDucked =
                settings.autoDuckEnabled &&
                !isPrimary &&
                (!settings.duckOnlyWhenPrimaryAudible || isPrimaryAudible)

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

            const fadeDuration = shouldFade ? (fadeDurationOverride ?? settings.fadeDuration) : 0

            if (isCaptured) {
                sendMessage(MSG.SET_CAPTURED_VOLUME, {
                    volume: targetDuckLevel ?? 100,
                    fadeDuration,
                })
            } else {
                for (const media of mediaElements) {
                    if (targetDuckLevel !== null) {
                        duck(media, targetDuckLevel, fadeDuration)
                    } else {
                        unduck(media, fadeDuration)
                    }
                }
            }

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

            applyDuckState(true, duckLevelChanged ? SLIDER_FADE_DURATION : null)
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
                isPrimaryAudible = message.payload.isPrimaryAudible
                applyDuckState(true)
            }

            if (message.type === MSG.PRIMARY_AUDIBLE_CHANGED) {
                isPrimaryAudible = message.payload.isPrimaryAudible
                applyDuckState(true)
            }

            if (message.type === MSG.TAB_OVERRIDE_CHANGED) {
                const volumeChanged = message.payload.volume !== tabVolume

                isMuted = message.payload.muted
                tabVolume = message.payload.volume

                applyDuckState(volumeChanged, volumeChanged ? SLIDER_FADE_DURATION : null)
            }

            if (message.type === MSG.CAPTURE_STATE_CHANGED) {
                isCaptured = message.payload.isCaptured
                applyDuckState(false)
            }

            if (message.type === MSG.SHOW_TOAST) {
                if (window.self !== window.top) return

                const {
                    message: toastMessage,
                    tabId,
                    blockedCount,
                    actionPosition,
                } = message.payload

                const actionLabel =
                    tabId == null
                        ? undefined
                        : blockedCount > 1
                          ? `Go to Page (${actionPosition} of ${blockedCount})`
                          : 'Go to Page'

                showPageToast(toastMessage, {
                    actionLabel,
                    onAction:
                        tabId != null ? () => sendMessage(MSG.GO_TO_TAB, { tabId }) : undefined,
                })
            }
        })
    },
})
