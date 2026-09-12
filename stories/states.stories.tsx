import { createElement } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyDemo, ExpiredDemo, ErrorDemo, SkeletonDemo } from './demo-helpers'

const meta: Meta = {
  title: 'Molecules/States',
}
export default meta

type Story = StoryObj

export const Empty: Story = { render: () => createElement(EmptyDemo) }
export const ExpiredInbox: Story = { render: () => createElement(ExpiredDemo) }
export const Error: Story = { render: () => createElement(ErrorDemo) }
export const Skeleton: Story = { render: () => createElement(SkeletonDemo) }
