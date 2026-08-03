import styles from './component.module.css'

export default function IconContainer({ icon, color = 'transparent', label = '' }) {
    const isImage =
        typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:'))
    const iconMarkup = isImage
        ? `<img src="${icon}" alt="" width="16" height="16" />`
        : `<i class="${icon || 'fa-solid fa-globe'}" aria-hidden="true"></i>`

    return `
        <div
            class="${styles['icon-container']}"
            style="background-color: ${color}"
            aria-label="${label}"
        >
            ${iconMarkup}
        </div>
    `
}
