import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '../components/ui/badge'

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
}
export default meta

type Story = StoryObj<typeof Badge>

export const Default: Story = { args: { children: 'no signup' } }
export const Accent: Story = { args: { children: 'private delivery station', tone: 'accent' } }
export const Danger: Story = { args: { children: 'expired', tone: 'danger' } }
export const Success: Story = { args: { children: 'inbox ready', tone: 'success' } }
