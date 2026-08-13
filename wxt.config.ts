import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
    imports: false,
    srcDir: 'src',
    publicDir: 'src/public',

    manifest: {
        name: 'Smart Duck',
        description:
            'Automatically lowers the volume of background tabs so the tab that matters stays audible.',
        version: '1.0.1',
        permissions: ['storage', 'tabs', 'scripting', 'tabCapture', 'offscreen'],
        host_permissions: ['<all_urls>'],
        icons: {
            16: 'icons/16.png',
            32: 'icons/32.png',
            48: 'icons/48.png',
            96: 'icons/96.png',
            128: 'icons/128.png',
        },
    },

    vite: () => ({
        build: {
            modulePreload: false,
        },
    }),
})
