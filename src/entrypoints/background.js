import { browser } from 'wxt/browser'
import { MSG, sendMessage, sendTabMessage } from '@/core/messaging'
import truncate from '@/utils/truncate'

const tabState = new Map()
const tabOverrides = new Map()
let focusedWindowId = null
let primaryTabId = null
let lastPrimaryAudible = false

/**
 * @returns {boolean}
 */
function isPrimaryTabAudible() {
    return tabState.get(primaryTabId)?.audible ?? false
}

/**
 * @param {boolean} value
 * @param {number[]} [excludeTabIds=[]]
 * @returns {Promise<void>}
 */
async function broadcastPrimaryAudible(value, excludeTabIds = []) {
    const tabs = await browser.tabs.query({})

    for (const tab of tabs) {
        if (tab.id == null || excludeTabIds.includes(tab.id)) continue

        sendTabMessage(tab.id, MSG.PRIMARY_AUDIBLE_CHANGED, {
            isPrimaryAudible: value,
        }).catch(() => {})
    }
}

function checkPrimaryAudible() {
    const current = isPrimaryTabAudible()

    if (current === lastPrimaryAudible) return

    lastPrimaryAudible = current
    broadcastPrimaryAudible(current)
}

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

async function reconcileCaptureState() {
    const existingContexts = await browser.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
    })

    if (existingContexts.length === 0) return

    offscreenReadyPromise = Promise.resolve()

    let capturedTabs

    try {
        capturedTabs = await sendMessage(MSG.GET_CAPTURED_TABS)
    } catch (error) {
        return
    }

    if (!Array.isArray(capturedTabs)) return

    for (const { tabId, generation } of capturedTabs) {
        captureStateByTab.set(tabId, { status: 'active', generation })
        sendTabMessage(tabId, MSG.CAPTURE_STATE_CHANGED, { isCaptured: true }).catch(() => {})
    }
}

const captureReadyWaiters = new Map()

/**
 * @param {number} tabId
 * @returns {Promise<void>}
 */
function waitForCaptureSettled(tabId) {
    return new Promise((resolve) => {
        captureReadyWaiters.set(tabId, resolve)
    })
}

/**
 * @param {number} tabId
 * @returns {void}
 */
function notifyCaptureSettled(tabId) {
    /** @type {Map<number, () => void>} */
    const resolve = captureReadyWaiters.get(tabId)

    if (!resolve) return

    captureReadyWaiters.delete(tabId)
    resolve()
}

/**
 * @param {number} tabId
 * @returns {Promise<{
 *   status: 'active' | 'pending' | 'idle',
 *   reason?: 'tab_not_active' | 'error'
 * }>}
 */
async function requestCaptureForTab(tabId) {
    const state = captureStateByTab.get(tabId)

    if (state?.status === 'pending' || state?.status === 'active') {
        return { status: state.status }
    }

    let targetTab

    try {
        targetTab = await browser.tabs.get(tabId)
    } catch (error) {
        return { status: 'idle', reason: 'error' }
    }

    if (!targetTab.active) {
        return { status: 'idle', reason: 'tab_not_active' }
    }

    const generation = (state?.generation ?? 0) + 1

    const timeoutId = setTimeout(() => {
        const current = captureStateByTab.get(tabId)

        if (!current || current.generation !== generation || current.status !== 'pending') return

        captureStateByTab.set(tabId, {
            status: 'idle',
            generation,
        })

        notifyCaptureSettled(tabId)
    }, PENDING_CAPTURE_TIMEOUT_MS)

    captureStateByTab.set(tabId, {
        status: 'pending',
        generation,
        timeoutId,
    })

    try {
        const streamId = await browser.tabCapture.getMediaStreamId({ targetTabId: tabId })
        await ensureOffscreenDocument()

        const settled = waitForCaptureSettled(tabId)
        sendMessage(MSG.CAPTURE_STREAM, { tabId, streamId, generation })
        await settled

        const finalState = captureStateByTab.get(tabId)
        return finalState?.status === 'active'
            ? { status: 'active' }
            : { status: 'idle', reason: 'error' }
    } catch (error) {
        clearTimeout(timeoutId)
        captureStateByTab.set(tabId, {
            status: 'idle',
            generation,
        })
        notifyCaptureSettled(tabId)
        return { status: 'idle', reason: 'error' }
    }
}

/**
 * @returns {{
 *   tabs: number,
 *   playing: number,
 *   ducked: number,
 *   list: Array<{
 *     id: number,
 *     icon?: string,
 *     name: string,
 *     domain: string,
 *     url: string,
 *     status: 'playing' | 'stopped',
 *     ducked: boolean,
 *     muted: boolean,
 *     volume: number | null,
 *     pinned: boolean
 *   }>
 * }}
 */
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
            status: state.audible ? 'playing' : 'stopped',
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

const INJECTABLE_URL_PATTERN = /^https?:\/\//

async function hydrateAlreadyOpenTabs() {
    const tabs = await browser.tabs.query({})

    for (const tab of tabs) {
        if (tab.id == null || !tab.url || !INJECTABLE_URL_PATTERN.test(tab.url)) continue

        try {
            await browser.scripting.executeScript({
                target: { tabId: tab.id, allFrames: true },
                files: ['content-scripts/content.js'],
            })
        } catch (error) {
            continue
        }

        if (tab.audible && !tabState.has(tab.id)) {
            tabState.set(tab.id, {
                elements: [],
                ducked: false,
                muted: tabOverrides.get(tab.id)?.muted ?? false,
                volume: tabOverrides.get(tab.id)?.volume ?? null,
                title: tab.title,
                url: tab.url,
                favIconUrl: tab.favIconUrl,
                audible: true,
            })
        }
    }

    checkPrimaryAudible()
    broadcastSummary()
}

let lastOfferedBlockedTabId = null

/**
 * @param {number[]} blockedTabIds
 * @returns {{
 *   tabId: number,
 *   position: number,
 *   total: number
 * } | null}
 */
function pickNextBlockedTab(blockedTabIds) {
    if (blockedTabIds.length === 0) return null

    const ordered = [...blockedTabIds].reverse()
    const lastIndex = ordered.indexOf(lastOfferedBlockedTabId)
    const nextIndex = (lastIndex + 1) % ordered.length

    lastOfferedBlockedTabId = ordered[nextIndex]

    return { tabId: lastOfferedBlockedTabId, position: nextIndex + 1, total: ordered.length }
}

export default defineBackground(() => {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === MSG.MEDIA_STATE_CHANGED && sender.tab) {
            if (message.payload.url !== sender.tab.url) return

            if (!sender.tab.audible) {
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

            checkPrimaryAudible()
            broadcastSummary()
        }

        if (message.type === MSG.GET_SUMMARY) {
            sendResponse(computeSummary())
        }

        if (message.type === MSG.GET_PRIMARY) {
            sendResponse({
                isPrimary: sender.tab?.id === primaryTabId,
                isPrimaryAudible: isPrimaryTabAudible(),
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
            if (message.payload?.tabId != null) {
                const requestedTabId = message.payload.tabId

                requestCaptureForTab(requestedTabId).then(async (result) => {
                    let toastDelivered = false

                    if (result?.reason === 'tab_not_active' && primaryTabId != null) {
                        const rawTitle = tabState.get(requestedTabId)?.title
                        const label = rawTitle ? truncate(rawTitle, 50) : 'this tab'

                        try {
                            await sendTabMessage(primaryTabId, MSG.SHOW_TOAST, {
                                message: `Switch to "${label}" once to enable deep volume control for it — after that you can adjust it from anywhere.`,
                                tabId: requestedTabId,
                            })
                            toastDelivered = true
                        } catch (error) {}
                    }

                    sendResponse({ ...result, toastDelivered })
                })
            } else {
                const tabIds = [...tabState.keys()]

                Promise.all(tabIds.map((tabId) => requestCaptureForTab(tabId))).then(
                    async (results) => {
                        const blockedTabIds = tabIds.filter(
                            (_, index) => results[index]?.reason === 'tab_not_active',
                        )
                        const blockedCount = blockedTabIds.length
                        const picked = pickNextBlockedTab(blockedTabIds)

                        let toastDelivered = false

                        if (blockedCount > 0 && primaryTabId != null) {
                            const tabWord = blockedCount === 1 ? 'tab needs' : 'tabs need'

                            try {
                                await sendTabMessage(primaryTabId, MSG.SHOW_TOAST, {
                                    message: `${blockedCount} background ${tabWord} a quick visit before deep volume control works there.`,
                                    tabId: picked?.tabId,
                                    blockedCount,
                                    actionPosition: picked?.position,
                                })
                                toastDelivered = true
                            } catch (error) {
                                // ignored
                            }
                        }

                        sendResponse({
                            blockedCount,
                            blockedTabId: picked?.tabId,
                            actionPosition: picked?.position,
                            total: tabIds.length,
                            toastDelivered,
                        })
                    },
                )
            }

            return true
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

            notifyCaptureSettled(tabId)
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

        if (message.type === MSG.GO_TO_TAB) {
            const { tabId } = message.payload

            if (tabId == null) return
            ;(async () => {
                try {
                    const tab = await browser.tabs.get(tabId)
                    await browser.windows.update(tab.windowId, { focused: true })
                    await browser.tabs.update(tabId, { active: true })
                } catch (error) {
                    // Tab likely closed since the toast was shown — ignored.
                }
            })()
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

            if (!changeInfo.audible) {
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

            checkPrimaryAudible()
            broadcastSummary()
        }
    })

    /**
     * @param {number} tabId
     * @returns {void}
     */
    function setPrimaryTab(tabId) {
        if (tabId === primaryTabId) return

        const oldTabId = primaryTabId
        primaryTabId = tabId

        const audible = isPrimaryTabAudible()
        const audibleChanged = audible !== lastPrimaryAudible
        lastPrimaryAudible = audible

        if (oldTabId != null) {
            sendTabMessage(oldTabId, MSG.PRIMARY_CHANGED, {
                isPrimary: false,
                isPrimaryAudible: audible,
            }).catch(() => {})
        }

        sendTabMessage(primaryTabId, MSG.PRIMARY_CHANGED, {
            isPrimary: true,
            isPrimaryAudible: audible,
        }).catch(() => {})

        if (audibleChanged) {
            broadcastPrimaryAudible(audible, [oldTabId, primaryTabId])
        }
    }

    ;(async () => {
        const [activeTab] = await browser.tabs.query({ active: true, lastFocusedWindow: true })
        if (activeTab) {
            focusedWindowId = activeTab.windowId
            setPrimaryTab(activeTab.id)
        }
    })()

    reconcileCaptureState()

    browser.runtime.onInstalled.addListener(() => {
        hydrateAlreadyOpenTabs()
    })

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
