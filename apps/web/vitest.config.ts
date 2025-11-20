import { defineConfig, configDefaults } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        clearMocks: true,
        exclude: [
            ...configDefaults.exclude,
            '**/ecosystem.config.test.js'
        ],
        setupFiles: ['src/test/setup/react-shim.ts'],
        environment: 'jsdom',
    },
})