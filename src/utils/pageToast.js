import { buildToastMarkup, attachToastBehavior } from './toast'

const CLASSES = {
    body: 'body',
    icon: 'icon',
    message: 'message',
    close: 'close',
    action: 'action',
    track: 'track',
    bar: 'bar',
}

const TOAST_CSS = `
    .toast {
        width: min(360px, 90vw);
        background: #101e25;
        color: #e8eaf0;
        border: 1px solid rgba(0, 136, 204, 0.45);
        border-radius: 10px;
        box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 136, 204, 0.08);
        font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
        overflow: hidden;
        opacity: 0;
        transform: translateY(-8px);
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .toast[data-visible] {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }
    .body {
        display: flex;
        align-items: flex-start;
        gap: 0.6em;
        padding: 0.8em 0.75em 0.75em 0.8em;
    }
    .icon {
        flex: none;
        display: flex;
        justify-content: center;
        margin-top: 2px;
        color: #0088cc;
    }
    .message {
        flex: 1;
        font-size: 14px;
        line-height: 1.45;
    }
    .close {
        flex: none;
        background: none;
        border: none;
        padding: 2px;
        margin: 2px 2px 0 0;
        color: rgba(232, 234, 240, 0.6);
        cursor: pointer;
        border-radius: 4px;
        display: flex;
    }
    .close:hover {
        color: #e8eaf0;
        background: rgba(255, 255, 255, 0.08);
    }
    .action {
        display: block;
        width: calc(100% - 1.6em);
        margin: 0 0.8em 0.75em 0.8em;
        padding: 0.6em 0;
        border: none;
        border-radius: 999px;
        background: rgba(0, 136, 204, 0.18);
        color: #4fb8f0;
        font-weight: 600;
        font-size: 13.5px;
        font-family: inherit;
        cursor: pointer;
        transition: background 0.15s ease;
    }
    .action:hover {
        background: rgba(0, 136, 204, 0.28);
    }
    .track {
        height: 3px;
        background: rgba(255, 255, 255, 0.08);
    }
    .bar {
        height: 100%;
        width: 100%;
        background: #0088cc;
        transform-origin: left;
        transition: transform linear;
    }
`

let hostEl = null
let controller = null

function ensureToast() {
    if (hostEl && document.documentElement.contains(hostEl)) return controller

    hostEl = document.createElement('div')
    hostEl.style.cssText = `
        all: initial;
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2147483647;
        pointer-events: none;
    `

    const shadow = hostEl.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = TOAST_CSS
    shadow.appendChild(style)

    const el = document.createElement('div')
    el.className = 'toast'
    el.setAttribute('role', 'status')
    el.innerHTML = buildToastMarkup(CLASSES)
    shadow.appendChild(el)
    ;(document.body ?? document.documentElement).appendChild(hostEl)

    controller = attachToastBehavior(el)
    return controller
}

export default function showPageToast(message, options) {
    ensureToast().show(message, options)
}
