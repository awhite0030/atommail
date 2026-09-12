import { createElement } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Panel, type PanelProps } from '../components/ui/panel'
import { PanelGlassDemo, PanelSolidDemo } from './demo-helpers'

const meta: Meta<typeof Panel> = {
  title: 'Atoms/Panel',
  component: Panel,
}
export default meta

type Story = StoryObj<typeof Panel>

const glassRender = (args: PanelProps) =>
  createElement(Panel, args, createElement(PanelGlassDemo))
const solidRender = (args: PanelProps) =>
  createElement(Panel, args, createElement(PanelSolidDemo))

export const Glass: Story = {
  args: { glass: true, className: 'max-w-md' },
  render: glassRender,
}

export const Solid: Story = {
  args: { glass: false, className: 'max-w-md' },
  render: solidRender,
}
