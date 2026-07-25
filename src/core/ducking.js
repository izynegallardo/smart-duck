export function toVolumeMultiplier(duckLevel) {
    return Math.min(1, Math.max(0, duckLevel / 100))
}

export function findMediaElements(root = document) {
    // your code here
    return [...root.querySelectorAll('audio, video')]
}

const original = new WeakMap()

export function duck(el, duckLevel) {
    // your code here
    if (!original.has(el)) {
        original.set(el, el.volume)
    }
    el.volume = original.get(el) * toVolumeMultiplier(duckLevel)
}

export function unduck(el) {
    // your code here
    if (original.has(el)) {
        el.volume = original.get(el)
        original.delete(el)
    }
}

export function describeMedia(el, index) {
    // your code here
    return {
        index,
        tag: el.tagName.toLowerCase(),
        playing: !el.paused,
        volume: el.volume,
        src: el.currentSrc || el.src,
    }
}
