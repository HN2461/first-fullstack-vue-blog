import { drawScene } from './entranceCanvasDrawers'
import { seedScene } from './entranceCanvasSeeds'

export function createEntranceCanvasScene(canvas, options) {
  const ctx = canvas.getContext('2d')
  const scene = {
    canvas,
    ctx,
    options,
    width: 0,
    height: 0,
    dpr: 1,
    startTime: performance.now(),
    frameId: 0,
    resizeHandler: null,
    items: [],
    bursts: [],
    stop: () => {}
  }

  scene.resizeHandler = () => {
    resizeScene(scene)
    seedScene(scene)
  }
  scene.resizeHandler()
  window.addEventListener('resize', scene.resizeHandler)

  const tick = (now) => {
    drawScene(scene, Math.min(1, (now - scene.startTime) / (options.duration * 1000)), now)
    scene.frameId = window.requestAnimationFrame(tick)
  }

  scene.frameId = window.requestAnimationFrame(tick)
  scene.stop = () => {
    window.cancelAnimationFrame(scene.frameId)
    window.removeEventListener('resize', scene.resizeHandler)
  }

  return scene
}

function resizeScene(scene) {
  scene.dpr = Math.min(window.devicePixelRatio || 1, 2)
  scene.width = window.innerWidth
  scene.height = window.innerHeight
  scene.canvas.width = Math.floor(scene.width * scene.dpr)
  scene.canvas.height = Math.floor(scene.height * scene.dpr)
  scene.canvas.style.width = `${scene.width}px`
  scene.canvas.style.height = `${scene.height}px`
  scene.ctx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0)
}
