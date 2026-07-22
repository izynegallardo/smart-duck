class SPA {
    routes = {}

    constructor(config = {}) {
        this.context = {
            root: config?.root || document.querySelector('#app'),
        }
        this.defaultRoute = () => {}
    }

    add(path, cb) {
        this.routes[path] = cb.bind(this.context)
    }

    setDefault(cb) {
        this.defaultRoute = cb.bind(this.context)
    }

    execute(hashPath) {
        // Formats "#/settings" to "/settings", or default to "/"
        const cleanPath = hashPath.replace(/^#/, '') || '/'
        const routeCallback = this.routes[cleanPath] || this.defaultRoute
        routeCallback()
    }

    pushRoute(path) {
        window.location.hash = path.startsWith('/') ? path : `/${path}`
    }

    handleClick(e) {
        const anchor = e.target.closest('a')
        if (!anchor || !anchor.href) return

        try {
            const targetUrl = new URL(anchor.href)
            if (targetUrl.origin === window.location.origin) {
                e.preventDefault()
                const targetHash = targetUrl.hash || '/'
                this.pushRoute(targetHash.replace(/^#/, ''))
            }
        } catch (err) {
            console.error('spa: error parsing link', err)
        }
    }

    handleRouteChanges() {
        window.addEventListener('hashchange', () => this.execute(window.location.hash))
        document.addEventListener('click', this.handleClick.bind(this))
        this.execute(window.location.hash) // Run on load
    }
}

export default SPA
