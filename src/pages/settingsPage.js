import Layout from '@/layouts/default'
import Header from '@/components/settings/header'
import Main from '@/components/settings/main'
import Footer from '@/components/footer/footer'
// import Events from '@/components/home/event'

export default function SettingsPage() {
    const { header, main, footer } = Layout(this.root)

    Header(header)
    Main(main)
    Footer(footer)

    // Events()
}
