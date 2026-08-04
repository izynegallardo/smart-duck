import styles from '@/components/footer/component.module.css'

export default function hideRatingsSection(hideRatingsEnabled) {
    const ratingsSection = document.getElementById('footer-ratings')
    if (!ratingsSection) return

    ratingsSection.classList.toggle(styles['hidden'], hideRatingsEnabled)
}
