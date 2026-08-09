import { browser } from 'wxt/browser'
import { MSG, sendMessage, sendTabMessage } from '@/core/messaging'
import truncate from '@/utils/truncate'

const tabState = new Map()
const tabOverrides = new Map()
let focusedWindowId = null
let primaryTabId = null

const captureStateByTab = new Map()
const PENDING_CAPTURE_TIMEOUT_MS = 8000
let offscreenReadyPromise = null

async function ensureOffscreenDocument() {
    if (offscreenReadyPromise) return offscreenReadyPromise

    offscreenReadyPromise = (async () => {
        const existingContexts = await browser.runtime.getContexts({
            contextTypes: ['OFFSCREEN_DOCUMENT'],
        })

        if (existingContexts.length > 0) return

        await browser.offscreen.createDocument({
            url: '/offscreen.html',
            reasons: ['USER_MEDIA'],
            justification: `Re-routes captured tab audio through a GainNode so 
                background tabs can be volume-adjusted even when
                the page controls its own audio via the Web Audio API.`,
        })
    })()

    return offscreenReadyPromise
}

async function requestCaptureForTab(tabId) {
    const state = captureStateByTab.get(tabId)

    if (state?.status === 'pending' || state?.status === 'active') return

    const generation = (state?.generation ?? 0) + 1

    const timeoutId = setTimeout(() => {
        const current = captureStateByTab.get(tabId)

        if (!current || current.generation !== generation || current.status !== 'pending') return

        captureStateByTab.set(tabId, {
            status: 'idle',
            generation,
        })
    }, PENDING_CAPTURE_TIMEOUT_MS)

    captureStateByTab.set(tabId, {
        status: 'pending',
        generation,
        timeoutId,
    })

    try {
        const streamId = await browser.tabCapture.getMediaStreamId({ targetTabId: tabId })
        await ensureOffscreenDocument()
        sendMessage(MSG.CAPTURE_STREAM, { tabId, streamId, generation })
    } catch (error) {
        clearTimeout(timeoutId)
        captureStateByTab.set(tabId, {
            status: 'idle',
            generation,
        })
    }
}

function computeSummary() {
    const states = [...tabState.values()]

    return {
        tabs: tabState.size,
        playing: states.filter(
            (state) => state.elements.some((element) => element.playing) || state.audible,
        ).length,
        ducked: states.filter((state) => state.ducked).length,
        list: [...tabState.entries()].map(([id, state]) => ({
            id,
            icon: state.favIconUrl,
            name: truncate(state.title, 50),
            domain: new URL(state.url).hostname,
            url: state.url,
            status:
                state.elements.some((element) => element.playing) || state.audible
                    ? 'playing'
                    : 'stopped',
            ducked: state.ducked,
            muted: state.muted,
            volume: state.volume,
            pinned: tabOverrides.get(id)?.pinned ?? false,
        })),
    }
}

function broadcastSummary() {
    sendMessage(MSG.SUMMARY_CHANGED, computeSummary()).catch(() => {})
}

export default defineBackground(() => {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === MSG.MEDIA_STATE_CHANGED && sender.tab) {
            if (message.payload.url !== sender.tab.url) return

            if (message.payload.elements.length === 0 && !sender.tab.audible) {
                tabState.delete(sender.tab.id)
            } else {
                tabState.set(sender.tab.id, {
                    ...message.payload,
                    title: sender.tab.title,
                    url: sender.tab.url,
                    favIconUrl: sender.tab.favIconUrl,
                    audible: sender.tab.audible,
                })
                // console.log('set', tabState)
            }

            broadcastSummary()
        }

        if (message.type === MSG.GET_SUMMARY) {
            sendResponse(computeSummary())
        }

        if (message.type === MSG.GET_PRIMARY) {
            sendResponse({
                isPrimary: sender.tab?.id === primaryTabId,
            })
        }

        if (message.type === MSG.GET_TAB_OVERRIDE) {
            sendResponse(tabOverrides.get(sender.tab?.id) ?? { muted: false })
        }

        if (message.type === MSG.SET_TAB_OVERRIDE) {
            const { tabId, patch } = message.payload
            const current = tabOverrides.get(tabId) ?? {}
            const next = { ...current, ...patch }

            tabOverrides.set(tabId, next)

            sendTabMessage(tabId, MSG.TAB_OVERRIDE_CHANGED, next).catch(() => {})

            broadcastSummary()
        }

        if (message.type === MSG.GET_CAPTURE_STATE) {
            sendResponse({
                isCaptured: captureStateByTab.get(sender.tab?.id)?.status === 'active',
            })
        }

        if (message.type === MSG.REQUEST_CAPTURE) {
            if (message.payload?.tabId) {
                requestCaptureForTab(message.payload.tabId)
            } else {
                tabState.forEach((state, tabId) => {
                    requestCaptureForTab(tabId)
                })
            }
        }

        if (message.type === MSG.CAPTURE_READY) {
            const { tabId, generation, success, reason } = message.payload
            const entry = captureStateByTab.get(tabId)

            if (!entry || entry.status !== 'pending' || entry.generation !== generation) return

            clearTimeout(entry.timeoutId)

            if (success) {
                captureStateByTab.set(tabId, {
                    status: 'active',
                    generation,
                })

                sendTabMessage(tabId, MSG.CAPTURE_STATE_CHANGED, { isCaptured: true }).catch(
                    () => {},
                )
            } else {
                captureStateByTab.set(tabId, { status: 'idle', generation })
            }
        }

        if (message.type === MSG.CAPTURE_ENDED) {
            const { tabId, generation, success, reason } = message.payload
            const entry = captureStateByTab.get(tabId)

            if (!entry || entry.status !== 'active' || entry.generation !== generation) return

            captureStateByTab.set(tabId, { status: 'idle', generation })

            sendTabMessage(tabId, MSG.CAPTURE_STATE_CHANGED, {
                isCaptured: false,
            }).catch(() => {})
        }

        if (message.type === MSG.SET_CAPTURED_VOLUME) {
            const { volume, fadeDuration } = message.payload
            const tabId = sender.tab?.id

            if (tabId == null) return

            const entry = captureStateByTab.get(tabId)

            if (!entry || entry.status !== 'active') return

            sendMessage(MSG.SET_CAPTURED_VOLUME, {
                tabId: sender.tab.id,
                volume,
                fadeDuration,
            }).catch(() => {})
        }
    })

    browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
        tabState.delete(tabId)
        tabOverrides.delete(tabId)
        // console.log('remove', tabState)
        const entry = captureStateByTab.get(tabId)

        if (entry) {
            if (entry.timeoutId) {
                clearTimeout(entry.timeoutId)
            }

            sendMessage(MSG.STOP_CAPTURE, { tabId }).catch(() => {})

            captureStateByTab.delete(tabId)
        }

        broadcastSummary()
    })

    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'loading' && changeInfo.url) {
            tabState.delete(tabId)
            broadcastSummary()
        }

        if (changeInfo.audible !== undefined) {
            const current = tabState.get(tabId)

            if (!changeInfo.audible && (!current || current.elements.length === 0)) {
                tabState.delete(tabId)
            } else {
                tabState.set(tabId, {
                    elements: [],
                    ducked: false,
                    muted: tabOverrides.get(tabId)?.muted ?? false,
                    volume: tabOverrides.get(tabId)?.volume ?? null,
                    ...current,
                    title: tab.title,
                    url: tab.url,
                    favIconUrl: tab.favIconUrl,
                    audible: changeInfo.audible,
                })
            }

            broadcastSummary()
        }
    })

    function setPrimaryTab(tabId) {
        if (tabId === primaryTabId) return

        const oldTabId = primaryTabId
        primaryTabId = tabId

        if (oldTabId != null) {
            sendTabMessage(oldTabId, MSG.PRIMARY_CHANGED, { isPrimary: false }).catch(() => {})
        }

        sendTabMessage(primaryTabId, MSG.PRIMARY_CHANGED, { isPrimary: true }).catch(() => {})
    }

    ;(async () => {
        const [activeTab] = await browser.tabs.query({ active: true, lastFocusedWindow: true })
        if (activeTab) {
            focusedWindowId = activeTab.windowId
            setPrimaryTab(activeTab.id)
        }
    })()

    browser.windows.onFocusChanged.addListener(async (windowId) => {
        if (windowId === browser.windows.WINDOW_ID_NONE) return
        focusedWindowId = windowId

        const [activeTab] = await browser.tabs.query({ active: true, windowId })

        if (activeTab) setPrimaryTab(activeTab.id)

        // console.log(activeTab)
    })

    browser.tabs.onActivated.addListener(({ tabId, windowId }) => {
        if (windowId === focusedWindowId) setPrimaryTab(tabId)
    })
})
