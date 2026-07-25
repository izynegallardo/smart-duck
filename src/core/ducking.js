export function toVolumeMultiplier(duckLevel) {
    return Math.min(1, Math.max(0, duckLevel / 100))
}

export function findMediaElements(root = document) {
    return [...root.querySelectorAll('audio, video')]
}

const original = new WeakMap()

export function duck(element, duckLevel) {
    if (!original.has(element)) {
        original.set(element, element.volume)
    }
    element.volume = original.get(element) * toVolumeMultiplier(duckLevel)
}

export function unduck(element) {
    if (original.has(element)) {
        element.volume = original.get(element)
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
