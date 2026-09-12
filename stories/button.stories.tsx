import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '../components/ui/button'

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  args: { onClick: fn() },
}
export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = { args: { children: 'Create address' } }
export const PrimaryLarge: Story = { args: { children: 'Start a session', size: 'lg' } }
export const Secondary: Story = { args: { children: 'Copy address', variant: 'secondary' } }
export const Ghost: Story = { args: { children: 'New address', variant: 'ghost' } }
export const Disabled: Story = { args: { children: 'Creating…', disabled: true } }
