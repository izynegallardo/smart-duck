import styles from './component.module.css'

export default function IconContainer({ icon, color = '#303b73', label = '' }) {
    return `
        <div
            class="${styles['icon-container']}"
            style="background-color: ${color}"
            aria-label="${label}"
        >
            <i class="${icon}" aria-hidden="true"></i>
        </div>
    `
}
