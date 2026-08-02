import { createIcons, Speech, Origami, Settings, Sun, Volume2, VolumeX } from 'lucide'

// Register all icons application will ever use here
const availableIcons = {
    Speech,
    Settings,
    Origami,
    Sun,
    Volume2,
    VolumeX,
}

/**
 * Sweeps a specific HTML element or sub-tree to turn <i data-lucide="..."> into SVGs.
 * @param {HTMLElement} element - The root component element to scope the icon replacement.
 */
export function updateIcons(element = document) {
    createIcons({
        icons: availableIcons,
        nameAttr: 'data-lucide',
    })
}
