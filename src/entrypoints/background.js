import { MSG } from '@/core/messaging'

const tabState = new Map()

function computeSummary() {
    const states = [...tabState.values()]

    return {
        tabs: tabState.size,
        playing: states.filter((state) => state.elements.some((element) => element.playing)).length,
        ducked: states.filter((state) => state.ducked).length,
    }
}

export default defineBackground(() => {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === MSG.MEDIA_STATE_CHANGED && sender.tab) {
            if (message.payload.elements.length === 0) {
                tabState.delete(sender.tab.id)
            } else {
                tabState.set(sender.tab.id, message.payload)
            }

            // console.log('set', tabState)
            // console.log(computeSummary())
        }

        if (message.type === MSG.GET_SUMMARY) {
            sendResponse(computeSummary())
        }
    })

    browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
        tabState.delete(tabId)
        // console.log('remove', tabState)
    })
})
