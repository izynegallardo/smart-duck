const INFO_ICON_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 16v-4"></path>
        <path d="M12 8h.01"></path>
    </svg>
`

const CLOSE_ICON_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
        <path d="M18 6 6 18"></path>
        <path d="m6 6 12 12"></path>
    </svg>
`

export function buildToastMarkup(classes) {
    return `
        <div class="${classes.body}">
            <span class="${classes.icon}" data-toast-icon aria-hidden="true">${INFO_ICON_SVG}</span>
            <span class="${classes.message}" data-toast-message></span>
            <button class="${classes.close}" data-toast-close type="button" aria-label="Dismiss">${CLOSE_ICON_SVG}</button>
        </div>
        <button class="${classes.action}" data-toast-action type="button" style="display: none;"></button>
        <div class="${classes.track}">
            <div class="${classes.bar}" data-toast-bar></div>
        </div>
    `
}

export function attachToastBehavior(toastEl) {
    const messageEl = toastEl.querySelector('[data-toast-message]')
    const barEl = toastEl.querySelector('[data-toast-bar]')
    const actionBtnEl = toastEl.querySelector('[data-toast-action]')
    const closeBtnEl = toastEl.querySelector('[data-toast-close]')

    let hideTimeoutId = null

    function hide() {
        clearTimeout(hideTimeoutId)
        hideTimeoutId = null
        toastEl.removeAttribute('data-visible')
    }

    closeBtnEl.addEventListener('click', hide)

    function updateActionButton(actionLabel, onAction) {
        if (!actionLabel || !onAction) {
            actionBtnEl.style.display = 'none'
            actionBtnEl.onclick = null
            return
        }

        actionBtnEl.textContent = actionLabel
        actionBtnEl.style.display = ''
        actionBtnEl.onclick = onAction
    }

    function show(message, { duration = 10000, actionLabel, onAction } = {}) {
        messageEl.textContent = message
        updateActionButton(actionLabel, onAction)
        toastEl.setAttribute('data-visible', '')

        if (hideTimeoutId != null) return

        barEl.style.transition = 'none'
        barEl.style.transform = 'scaleX(1)'
        void barEl.offsetWidth
        barEl.style.transition = `transform ${duration}ms linear`
        barEl.style.transform = 'scaleX(0)'

        hideTimeoutId = setTimeout(hide, duration)
    }

    return { show, hide }
}
