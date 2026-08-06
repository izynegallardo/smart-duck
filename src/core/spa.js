class SPA {
    routes = {}
    currentCleanup = null

    constructor(config = {}) {
        this.context = {
            root: config?.root || document.querySelector('#app'),
        }
        this.defaultRoute = config?.defaultRoute ? config.defaultRoute.bind(this.context) : () => {}
    }

    add(path, cb) {
        this.routes[path] = cb.bind(this.context)
    }

    setDefault(cb) {
        this.defaultRoute = cb.bind(this.context)
    }

    execute(hashPath) {
        // Tear down whatever the previous route registered (e.g. a
        // browser.runtime.onMessage listener) before rendering the next
        // one. Without this, page-scoped listeners from a route you've
        // already left keep running forever and can throw when they try
        // to touch DOM elements that belonged to that old page.
        if (typeof this.currentCleanup === 'function') {
            try {
                this.currentCleanup()
            } catch (error) {
                // A bug in one route's cleanup should never be able to
                // block navigation to the next route -- log it and move on.
                console.error('spa: error during route cleanup', error)
            }
            this.currentCleanup = null
        }

        // Formats "#/settings" to "/settings", or default to "/"
        const cleanPath = hashPath.replace(/^#/, '') || '/'
        const routeCallback = this.routes[cleanPath] || this.defaultRoute
        const cleanup = routeCallback()

        // A route can optionally return its own cleanup function, which we
        // hold onto until the NEXT navigation.
        if (typeof cleanup === 'function') {
            this.currentCleanup = cleanup
        }
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
