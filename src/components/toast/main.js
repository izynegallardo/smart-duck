import styles from './component.module.css'
import { buildToastMarkup, attachToastBehavior } from '@/utils/toast'

let controller = null

function Toast() {
    const element = document.createElement('div')
    element.className = styles.toast
    element.setAttribute('role', 'status')
    element.innerHTML = buildToastMarkup(styles)

    document.body.appendChild(element)

    return attachToastBehavior(element)
}

function ensureToast() {
    if (!controller) {
        controller = Toast()
    }

    return controller
}

export default function showToast(message, options) {
    ensureToast().show(message, options)
}
