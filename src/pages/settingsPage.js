import Layout from '@/layouts/default'
import Header from '@/components/header/header'
import Main from '@/components/settings/main'
import Footer from '@/components/footer/footer'
import Events from '@/components/settings/event'

export default function SettingsPage() {
    const { header, main, footer } = Layout(this.root)

    Header(header, { title: 'Settings', backHref: '#/' })
    Main(main)
    Footer(footer)

    Events()
}
