import { browser } from 'wxt/browser'
import { MSG, sendMessage, sendTabMessage } from '@/core/messaging'
import truncate from '@/utils/truncate'

const tabState = new Map()
const tabOverrides = new Map()
let focusedWindowId = null
let primaryTabId = null

function computeSummary() {
    const states = [...tabState.values()]

    return {
        tabs: tabState.size,
        playing: states.filter((state) => state.elements.some((element) => element.playing)).length,
        ducked: states.filter((state) => state.ducked).length,
        list: [...tabState.entries()].map(([id, state]) => ({
            id,
            icon: state.favIconUrl,
            name: truncate(state.title, 50),
            domain: new URL(state.url).hostname,
            url: state.url,
            status: state.elements.some((element) => element.playing) ? 'playing' : 'stopped',
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

            if (message.payload.elements.length === 0) {
                tabState.delete(sender.tab.id)
            } else {
                tabState.set(sender.tab.id, {
                    ...message.payload,
                    title: sender.tab.title,
                    url: sender.tab.url,
                    favIconUrl: sender.tab.favIconUrl,
                })
                console.log('set', tabState)
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
    })

    browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
        tabState.delete(tabId)
        tabOverrides.delete(tabId)
        console.log('remove', tabState)

        broadcastSummary()
    })

    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'loading' && changeInfo.url) {
            tabState.delete(tabId)
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
