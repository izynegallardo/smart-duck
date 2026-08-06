import { createIcons, Speech, Origami, Settings, Volume2, VolumeX, Info } from 'lucide'

// Register all icons application will ever use here
const availableIcons = {
    Speech,
    Settings,
    Origami,
    Volume2,
    VolumeX,
    Info,
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
