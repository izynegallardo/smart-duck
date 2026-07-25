import toggleTheme from '@/utils/toggleTheme'

export default function Event() {
    try {
        toggleTheme()
    } catch (error) {
        console.log('Settings Event:', error)
    }
}
