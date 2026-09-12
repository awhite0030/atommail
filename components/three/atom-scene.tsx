'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Environment,
  Float,
  MeshTransmissionMaterial,
  ContactShadows,
} from '@react-three/drei'
import * as THREE from 'three'

/**
 * "Glass atom": a crystal core orbited by three smoke-grey rings —
 * a still-life object on the paper background, studio-lit. No bloom,
 * no neon: the reference site's calm product photography, in 3D.
 */

function Core() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.12
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

function OrbitRing({
  radius,
  tilt,
  speed,
  phase,
}: {
  radius: number
  tilt: [number, number, number]
  speed: number
  phase: number
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
        <lineBasicMaterial color="#8f8d88" transparent opacity={0.35} />
      </line>
      <mesh ref={electron}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshPhysicalMaterial color="#231f20" roughness={0.35} metalness={0.1} />
      </mesh>
    </group>
  )
}

function AtomScene() {
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 4]} intensity={1.6} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#e8e6e3" />

      <Core />
      <OrbitRing radius={2.0} tilt={[1.15, 0.2, 0]} speed={0.6} phase={0} />
      <OrbitRing radius={2.55} tilt={[1.9, -0.4, 0.3]} speed={0.44} phase={2.1} />
      <OrbitRing radius={3.1} tilt={[0.8, 0.5, -0.5]} speed={0.34} phase={4.2} />

      <ContactShadows position={[0, -3.4, 0]} opacity={0.18} scale={14} blur={2.6} far={5} color="#231f20" />

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
