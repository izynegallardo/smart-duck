import { browser } from 'wxt/browser'
import { MSG, sendMessage } from '@/core/messaging'
import { toVolumeMultiplier } from '@/core/ducking'

const captureGraphs = new Map()

async function handleCaptureStream({ tabId, streamId, generation }) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId,
                },
            },
            video: false,
        })

        const audioContext = new AudioContext()
        const source = audioContext.createMediaStreamSource(stream)
        const gainNode = audioContext.createGain()

        source.connect(gainNode).connect(audioContext.destination)

        stream.getAudioTracks()[0].addEventListener('ended', () => {
            if (!captureGraphs.has(tabId)) return

            captureGraphs.delete(tabId)

            sendMessage(MSG.CAPTURE_ENDED, {
                tabId,
                generation,
                reason: 'track_ended',
            }).catch(() => {})
        })

        captureGraphs.set(tabId, { audioContext, gainNode, stream })

        sendMessage(MSG.CAPTURE_READY, { tabId, generation, success: true }).catch(() => {})
    } catch (error) {
        sendMessage(MSG.CAPTURE_READY, {
            tabId,
            generation,
            success: false,
            reason: 'setup_failed',
        }).catch(() => {})
    }
}

function handleSetCapturedVolume({ tabId, volume, fadeDuration }) {
    const entry = captureGraphs.get(tabId)

    if (!entry) return

    const { audioContext, gainNode } = entry

    const targetGain = toVolumeMultiplier(volume)

    gainNode.gain.cancelScheduledValues(audioContext.currentTime)

    if (fadeDuration > 0) {
        gainNode.gain.linearRampToValueAtTime(targetGain, audioContext.currentTime + fadeDuration)
    } else {
        gainNode.gain.value = targetGain
    }
}

function handleStopCapture({ tabId }) {
    const entry = captureGraphs.get(tabId)

    if (!entry) return

    captureGraphs.delete(tabId)

    entry.stream.getTracks().forEach((track) => {
        track.stop()
    })

    entry.audioContext.close()
}

browser.runtime.onMessage.addListener((message) => {
    if (message.type === MSG.CAPTURE_STREAM) {
        handleCaptureStream(message.payload)
    }

    if (message.type === MSG.SET_CAPTURED_VOLUME) {
        handleSetCapturedVolume(message.payload)
    }

    if (message.type === MSG.STOP_CAPTURE) {
        handleStopCapture(message.payload)
    }
})
