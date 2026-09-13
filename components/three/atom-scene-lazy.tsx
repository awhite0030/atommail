import AtomScene from './atom-scene'

/**
 * The visual is now CSS-only, so it is safe to paint immediately instead of
 * waiting for an idle WebGL import. Keep this wrapper to avoid changing page
 * composition call sites.
 */
export default function AtomSceneLazy() {
  return <AtomScene />
}
