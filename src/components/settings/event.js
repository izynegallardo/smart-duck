import toggleTheme from '@/utils/toggleTheme'

export default function Event() {
    try {
        // TODO: Features
        // Theme color picker
        // Hide ratings section
        // Use Duck Level (duck strength) instead of Background Volume. Using opposite semantics.
        // Other extensions by developer section
        toggleTheme()
    } catch (error) {
        console.log('Settings Event:', error)
    }
}
