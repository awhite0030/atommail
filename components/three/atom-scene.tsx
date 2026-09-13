'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Environment,
  Float,
  MeshTransmissionMaterial,
  ContactShadows,
  Sparkles,
  Trail,
} from '@react-three/drei'
import * as THREE from 'three'

/**
 * "Glass atom" — premium edition. A crystal core orbited by three smoke-grey
 * electrons that leave light trails, drifting through a fine dust of
 * particles. The whole object follows the cursor with soft parallax and
 * breathes on the page like a product film still.
 */

/** Smoothed pointer → parallax for the whole atom group. */
function PointerParallax({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null)
  const target = useRef({ x: 0, y: 0 })

  useFrame((state) => {
    if (!group.current) return
    // NDC pointer (-1..1) → gentle tilt; lerped for weighty, physical motion
    target.current.x = state.pointer.x * 0.28
    target.current.y = state.pointer.y * 0.18
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, target.current.x, 0.045)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -target.current.y, 0.045)
  })

  return <group ref={group}>{children}</group>
}

/** Slow cinematic drift of the camera, independent of the pointer. */
function CameraDrift() {
  const { camera } = useThree()
  const t0 = useRef<number | null>(null)

  useFrame((state) => {
    if (t0.current === null) t0.current = state.clock.elapsedTime
    const t = (state.clock.elapsedTime - t0.current) * 0.12
    camera.position.x = Math.sin(t) * 0.5
    camera.position.y = 0.4 + Math.cos(t * 0.7) * 0.25
    camera.lookAt(0, 0, 0)
  })

  return null
}

/** Scale-in entrance: the atom arrives like a product being placed. */
function Entrance({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null)
  const progress = useRef(0)

  useFrame((_, delta) => {
    if (!group.current) return
    // easeOutCubic over ~1.6s, once
    progress.current = Math.min(1, progress.current + delta / 1.6)
    const e = 1 - Math.pow(1 - progress.current, 3)
    const overshoot = e < 1 ? 1 + Math.sin(e * Math.PI) * 0.06 : 1
    group.current.scale.setScalar(THREE.MathUtils.lerp(0.6, 1, e) * overshoot)
  })

  return <group ref={group}>{children}</group>
}

function Core() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.12
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.25) * 0.08
  })
  return (
    <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.7}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1, 12]} />
        <MeshTransmissionMaterial
          thickness={0.9}
          roughness={0.08}
          transmission={1}
          ior={1.45}
          chromaticAberration={0.1}
          anisotropicBlur={0.3}
          distortion={0.24}
          distortionScale={0.4}
          temporalDistortion={0.06}
          samples={6}
          resolution={512}
        />
      </mesh>
    </Float>
  )
}

function Electron({
  radius,
  tilt,
  speed,
  phase,
  trailColor,
}: {
  radius: number
  tilt: [number, number, number]
  speed: number
  phase: number
  trailColor: string
}) {
  const electron = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase
    if (electron.current) {
      electron.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius)
    }
  })

  const ringGeo = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius)
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(128))
  }, [radius])

  return (
    <group rotation={tilt}>
      <line>
        <primitive object={ringGeo} attach="geometry" />
        <lineBasicMaterial color="#8f8d88" transparent opacity={0.3} />
      </line>
      <Trail
        width={1.6}
        length={4.5}
        color={new THREE.Color(trailColor)}
        attenuation={(width) => width}
      >
        <mesh ref={electron}>
          <sphereGeometry args={[0.07, 24, 24]} />
          <meshPhysicalMaterial color="#231f20" roughness={0.35} metalness={0.1} />
        </mesh>
      </Trail>
    </group>
  )
}

function AtomScene() {
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 4]} intensity={1.6} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#e8e6e3" />

      {/* Fine studio dust catching the light */}
      <Sparkles
        count={90}
        scale={[14, 8, 8]}
        size={1.4}
        speed={0.25}
        opacity={0.35}
        color="#8f8d88"
      />

      <PointerParallax>
        <Entrance>
          <Core />
          <Electron radius={2.0} tilt={[1.15, 0.2, 0]} speed={0.6} phase={0} trailColor="#b9b7b2" />
          <Electron radius={2.55} tilt={[1.9, -0.4, 0.3]} speed={0.44} phase={2.1} trailColor="#a8a49e" />
          <Electron radius={3.1} tilt={[0.8, 0.5, -0.5]} speed={0.34} phase={4.2} trailColor="#c4c2bd" />
        </Entrance>
      </PointerParallax>

      <ContactShadows position={[0, -3.4, 0]} opacity={0.18} scale={14} blur={2.6} far={5} color="#231f20" />

      <CameraDrift />
      <Environment preset="city" />
    </>
  )
}

export default function AtomScene3D() {
  return (
    <div
      aria-hidden
      className="scene-holder pointer-events-none fixed inset-0 z-scene opacity-80"
    >
      <Canvas
        camera={{ position: [0, 0.4, 7.2], fov: 42 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <AtomScene />
        </Suspense>
      </Canvas>
    </div>
  )
}
