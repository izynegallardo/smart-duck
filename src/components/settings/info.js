import styles from './component.module.css'

export default function InfoButton({ title, ariaLabel }) {
    return `
        <button class='${styles['info-button']}' type='button' title='${title}' aria-label='${ariaLabel}'>
            <i data-lucide='info'></i>
        </button>
    `
}
