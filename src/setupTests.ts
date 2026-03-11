import '@testing-library/jest-dom'
import { vi } from 'vitest'

// TESTING CONCEPT: Mocking browser APIs that don't work in jsdom
//
// rough.js (the library that draws the hand-drawn borders on buttons and
// text fields) uses the HTML Canvas API to draw. jsdom — the fake browser
// that Vitest uses — doesn't actually support canvas drawing.
//
// Without this mock, every component that uses TextField or HandDrawnButton
// would crash with: "Cannot read properties of null (reading 'save')"
//
// The fix: replace getContext('2d') with a fake object whose every method
// is a no-op (does nothing). We don't need to test the visual drawings —
// we just need the components to render without crashing.
const canvasMock = {
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  arc: vi.fn(),
  ellipse: vi.fn(),
  bezierCurveTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  setLineDash: vi.fn(),
  getLineDash: vi.fn(() => [] as number[]),
  measureText: vi.fn(() => ({ width: 0 })),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  transform: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  lineCap: '',
  lineJoin: '',
  miterLimit: 10,
}

HTMLCanvasElement.prototype.getContext = vi.fn(
  () => canvasMock,
) as unknown as typeof HTMLCanvasElement.prototype.getContext
