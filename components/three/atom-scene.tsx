'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Environment,
  Float,
  MeshTransmissionMaterial,
} from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

/**
 * "Prismatic Atom": a glass core orbited by three iridescent electron
 * rings. The scene is decorative — pointer-events pass through it.
 */

function Core() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.18
  })
  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.9}>
      <mesh ref={ref} castShadow>
        <icosahedronGeometry args={[1, 12]} />
        <MeshTransmissionMaterial
          thickness={0.9}
          roughness={0.06}
          transmission={1}
          ior={1.45}
          chromaticAberration={0.28}
          anisotropicBlur={0.3}
          distortion={0.32}
          distortionScale={0.4}
          temporalDistortion={0.12}
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
  color,
}: {
  radius: number
  tilt: [number, number, number]
  speed: number
  phase: number
  color: string
}) {
  const group = useRef<THREE.Group>(null)
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
    <group ref={group} rotation={tilt}>
      <line>
        <primitive object={ringGeo} attach="geometry" />
        <lineBasicMaterial color={color} transparent opacity={0.22} />
      </line>
      <mesh ref={electron}>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.9}
          roughness={0.15}
          iridescence={1}
          iridescenceIOR={1.8}
          iridescenceThicknessRange={[120, 620]}
        />
      </mesh>
    </group>
  )
}

function AtomScene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 4, 6]} intensity={60} color="#8b5cf6" distance={30} />
      <pointLight position={[-6, -3, -4]} intensity={40} color="#22d3ee" distance={30} />
      <pointLight position={[0, 6, -6]} intensity={30} color="#f472b6" distance={30} />

      <Core />
      <OrbitRing radius={2.0} tilt={[1.15, 0.2, 0]} speed={0.7} phase={0} color="#8b5cf6" />
      <OrbitRing radius={2.55} tilt={[1.9, -0.4, 0.3]} speed={0.5} phase={2.1} color="#22d3ee" />
      <OrbitRing radius={3.1} tilt={[0.8, 0.5, -0.5]} speed={0.38} phase={4.2} color="#f472b6" />

      <Environment preset="night" />

      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={0.9}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.5}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.18} darkness={0.72} />
      </EffectComposer>
    </>
  )
}

export default function AtomScene3D() {
  return (
    <div
      aria-hidden
      className="scene-holder pointer-events-none fixed inset-0 z-scene opacity-90"
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
