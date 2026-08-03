import '@/styles/common.css'
import SPA from '@/core/spa.js'
import HomePage from '@/pages/homePage'
import SettingsPage from '@/pages/settingsPage'

const app = new SPA({
    root: document.querySelector('#app'),
    defaultRoute: HomePage,
})

window.app = app
app.add('/', HomePage)
app.add('/settings', SettingsPage)

app.handleRouteChanges()
