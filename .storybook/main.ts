import type { StorybookConfig } from '@storybook/react-vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-themes'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: [],
  viteConfig: {
    resolve: {
      alias: {
        '@': path.resolve(dirname, '..'),
      },
    },
  },
}

export default config
