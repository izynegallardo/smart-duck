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

// const app = new SPA({
//     root: (document.querySelector('#app').innerHTML = `
//     <div>
//       <h1>Smart Duck</h1>
//       <a href="/settings" target="_blank">
//         <img src="${wxtLogo}" class="logo" alt="WXT logo" />
//       </a>
//       <a href="https://www.typescriptlang.org/" target="_blank">
//         <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//       </a>
//       <div class="card">
//         <button id="counter" type="button"></button>
//       </div>
//       <p class="read-the-docs">
//         Click on the WXT and TypeScript logos to learn more
//       </p>
//     </div>
//   `),
// })
// setupCounter(document.querySelector('#counter'))
