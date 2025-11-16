import { defineConfig, configDefaults } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        environment: 'node',
        clearMocks: true,
        exclude: [
            ...configDefaults.exclude,
            '**/ecosystem.config.test.cjs'
        ]
    },
})