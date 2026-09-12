import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

// jsdom lacks matchMedia; components use it for reduced-motion checks
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// jsdom lacks ResizeObserver (three/drei imports may touch it)
if (typeof globalThis.ResizeObserver === 'undefined') {
  class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  ;(globalThis as any).ResizeObserver = RO
}

// PointerEvent is not implemented in jsdom
if (typeof globalThis.PointerEvent === 'undefined') {
  ;(globalThis as any).PointerEvent = class PointerEvent extends MouseEvent {}
}

// IntersectionObserver is not implemented in jsdom (framer-motion viewport)
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IO {
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds: ReadonlyArray<number> = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  ;(globalThis as any).IntersectionObserver = IO
}
