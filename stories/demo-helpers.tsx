import { Label } from '../components/ui/panel'
import { EmptyState, ExpiredState, ErrorState, SkeletonRows } from '../components/ui/states'

/**
 * Render helpers for stories. Story files themselves must stay JSX-free:
 * Storybook 10.6's vite export parser chokes on JSX in *.stories.tsx.
 */

export function PanelGlassDemo() {
  return (
    <div className="p-6">
      <Label>start a session</Label>
      <p className="mt-4 text-body text-prism-mist">
        A frosted glass panel with a hairline edge.
      </p>
    </div>
  )
}

export function PanelSolidDemo() {
  return (
    <div className="p-6">
      <Label>message detail</Label>
      <p className="mt-4 text-body text-prism-mist">An opaque surface panel.</p>
    </div>
  )
}

export function EmptyDemo() {
  return (
    <ul className="border-y border-strong">
      <EmptyState />
    </ul>
  )
}

export function ExpiredDemo() {
  return <ExpiredState onRenew={() => {}} />
}

export function ErrorDemo() {
  return <ErrorState message="Network error. Please try again." />
}

export function SkeletonDemo() {
  return <SkeletonRows />
}
