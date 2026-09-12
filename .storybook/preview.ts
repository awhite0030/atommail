import type { Preview } from '@storybook/react-webpack5'
import '../app/styles/tokens.css'
import '../app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'void',
      values: [{ name: 'void', value: '#06040d' }],
    },
  },
}

export default preview
