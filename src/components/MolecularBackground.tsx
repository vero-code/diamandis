import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  isGold: boolean
  hasRing: boolean
  phase: number
}

export function MolecularBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId = 0
    let width = window.innerWidth
    let height = window.innerHeight
    const mouse = { x: -1000, y: -1000 }

    function resize() {
      if (!canvas || !ctx) return
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()

    const count = Math.min(Math.floor((width * height) / 22000), 48)
    const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
      x:
        width > 900
          ? i % 2 === 0
            ? Math.random() * ((width - 860) / 2)
            : width - Math.random() * ((width - 860) / 2)
          : Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: 1.8 + Math.random() * 2.2,
      isGold: i % 3 !== 0,
      hasRing: i % 4 === 0,
      phase: Math.random() * Math.PI * 2,
    }))

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    function onMouseLeave() {
      mouse.x = -1000
      mouse.y = -1000
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    let time = 0
    const maxDist = 155

    function render() {
      if (!ctx) return
      time += 0.01
      ctx.clearRect(0, 0, width, height)

      // Ambient drifting gold & emerald glows
      const glow1X = width * (0.25 + Math.sin(time * 0.5) * 0.1)
      const glow1Y = height * (0.3 + Math.cos(time * 0.4) * 0.1)
      const grad1 = ctx.createRadialGradient(glow1X, glow1Y, 0, glow1X, glow1Y, 360)
      grad1.addColorStop(0, 'rgba(197, 160, 89, 0.10)')
      grad1.addColorStop(1, 'rgba(197, 160, 89, 0)')
      ctx.fillStyle = grad1
      ctx.fillRect(0, 0, width, height)

      const glow2X = width * (0.75 + Math.cos(time * 0.4) * 0.1)
      const glow2Y = height * (0.7 + Math.sin(time * 0.5) * 0.1)
      const grad2 = ctx.createRadialGradient(glow2X, glow2Y, 0, glow2X, glow2Y, 420)
      grad2.addColorStop(0, 'rgba(11, 59, 44, 0.06)')
      grad2.addColorStop(1, 'rgba(11, 59, 44, 0)')
      ctx.fillStyle = grad2
      ctx.fillRect(0, 0, width, height)

      // Update positions
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        const dxm = mouse.x - p.x
        const dym = mouse.y - p.y
        const distMouse = Math.hypot(dxm, dym)
        if (distMouse < 180 && distMouse > 1) {
          p.x -= (dxm / distMouse) * 0.25
          p.y -= (dym / distMouse) * 0.25
        }
      }

      // Draw golden lattice connections
      ctx.lineWidth = 0.8
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.28
            ctx.strokeStyle = `rgba(197, 160, 89, ${alpha.toFixed(3)})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // Draw molecular droplets and cellular rings
      for (const p of particles) {
        const pulse = 1 + Math.sin(time * 2 + p.phase) * 0.2

        if (p.hasRing) {
          ctx.strokeStyle = 'rgba(11, 59, 44, 0.22)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius * 3.2 * pulse, 0, Math.PI * 2)
          ctx.stroke()
        }

        ctx.fillStyle = p.isGold
          ? 'rgba(212, 175, 55, 0.65)'
          : 'rgba(11, 59, 44, 0.45)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2)
        ctx.fill()
      }

      animationId = window.requestAnimationFrame(render)
    }

    animationId = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="molecular-canvas" aria-hidden="true" />
}