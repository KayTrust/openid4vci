import { defineConfig, configDefaults } from 'vitest/config'
// import { defineWorkspace } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.ts'],
    environment: 'node',
    exclude: [...configDefaults.exclude, '**/lib/**', '**/node_modules/**'],
    include: ["__tests__/**/*.ts", "src/**/*.{spec,test}.ts"]
  },
})