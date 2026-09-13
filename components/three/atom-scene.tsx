'use client'

/**
 * Decorative atom rendered with composited CSS layers instead of a WebGL
 * canvas. The previous transmission shader could make the browser renderer
 * process crash on some GPUs; this keeps the glass-object art direction with
 * a near-zero runtime cost and can never intercept the inbox controls.
 */
export default function AtomScene() {
  return (
    <div aria-hidden className="scene-holder atom-art">
      <div className="atom-art__assembly">
        <span className="atom-art__orbit atom-art__orbit--one" />
        <span className="atom-art__orbit atom-art__orbit--two" />
        <span className="atom-art__orbit atom-art__orbit--three" />
        <span className="atom-art__electron atom-art__electron--one" />
        <span className="atom-art__electron atom-art__electron--two" />
        <span className="atom-art__electron atom-art__electron--three" />
        <div className="atom-art__core" />
      </div>
    </div>
  )
}
