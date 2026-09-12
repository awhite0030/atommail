import type { Meta, StoryObj } from '@storybook/react-vite'
import { Timer } from '../components/ui/timer'

const meta: Meta<typeof Timer> = {
  title: 'Molecules/Timer',
  component: Timer,
}
export default meta

type Story = StoryObj<typeof Timer>

export const Running: Story = {
  args: { expiresAt: Date.now() + 600_000, expired: false },
}
export const Urgent: Story = {
  args: { expiresAt: Date.now() + 45_000, expired: false },
}
export const Expired: Story = {
  args: { expiresAt: 0, expired: true },
}
