export function toVolumeMultiplier(duckLevel) {
    return Math.min(1, Math.max(0, duckLevel / 100))
}

export function toBackgroundVolume(currentValue, useOppositeSemantics) {
    return useOppositeSemantics ? 100 - currentValue : currentValue
}

export function findMediaElements(root = document) {
    return [...root.querySelectorAll('audio, video')]
}

const original = new WeakMap()
const activeFades = new WeakMap()
const FADE_STEP_MS = 50
const VOLUME_EPSILON = 0.001

function cancelFade(element) {
    const fade = activeFades.get(element)
    if (fade) {
        clearTimeout(fade.timeoutId)
        activeFades.delete(element)
    }
}

function fadeVolume(element, targetVolume, fadeDurationSeconds) {
    const existingFade = activeFades.get(element)

    if (existingFade && Math.abs(existingFade.targetVolume - targetVolume) < VOLUME_EPSILON) return
    if (!existingFade && Math.abs(element.volume - targetVolume) < VOLUME_EPSILON) return

    cancelFade(element)

    if (!fadeDurationSeconds || fadeDurationSeconds <= 0) {
        element.volume = targetVolume
        return
    }

    const startVolume = element.volume
    const startTime = performance.now()
    const durationMs = fadeDurationSeconds * 1000

    function step() {
        const progress = Math.min((performance.now() - startTime) / durationMs, 1)
        element.volume = startVolume + (targetVolume - startVolume) * progress

        if (progress < 1) {
            activeFades.set(element, { timeoutId: setTimeout(step, FADE_STEP_MS), targetVolume })
        } else {
            activeFades.delete(element)
        }
    }

    activeFades.set(element, { timeoutId: setTimeout(step, FADE_STEP_MS), targetVolume })
}

export function duck(element, duckLevel, fadeDurationSeconds = 0) {
    if (!original.has(element)) {
        original.set(element, element.volume)
    }

    const targetVolume = original.get(element) * toVolumeMultiplier(duckLevel)
    fadeVolume(element, targetVolume, fadeDurationSeconds)
}

export function unduck(element, fadeDurationSeconds = 0) {
    if (original.has(element)) {
        const targetVolume = original.get(element)
        fadeVolume(element, targetVolume, fadeDurationSeconds)
        original.delete(element)
    }
}

export function describeMedia(element, index) {
    return {
        index,
        tag: element.tagName.toLowerCase(),
        playing: !element.paused,
        volume: element.volume,
        src: element.currentSrc || element.src,
    }
}
