import { useEffect, useRef } from 'react'

/* ── Universe Background Component ─────────────────────────────────
   Replaces ParticleField on ALL pages.
   Drop-in: <UniverseBackground />
   It renders a fixed full-screen canvas behind everything (z-index: 0).
──────────────────────────────────────────────────────────────────── */
export default function UniverseBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    let particles = [], comets = [], planets = []
    let animId

    class Planet {
      constructor(index, total) {
        this.distFactor = 0.12 + (index / total) * 0.75
        this.radius = 4 + Math.random() * 12
        this.speed = (0.003 / (index + 1)) * 0.35
        this.angle = Math.random() * Math.PI * 2
        const hues = [200, 30, 180, 5, 280, 150, 45, 210, 330, 20]
        this.color = `hsl(${hues[index % hues.length]}, 70%, 60%)`
      }
      update() {
        this.angle += this.speed
        const cx = canvas.width / 2
        const cy = canvas.height / 2
        const orbitRadius = Math.max(canvas.width, canvas.height) * this.distFactor
        const x = cx + Math.cos(this.angle) * orbitRadius
        const y = cy + Math.sin(this.angle) * orbitRadius

        ctx.strokeStyle = 'rgba(255,255,255,0.05)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2)
        ctx.stroke()

        ctx.shadowBlur = 20
        ctx.shadowColor = this.color
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(x, y, this.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    function createComet() {
      const sides = ['top', 'bottom', 'left', 'right']
      const side = sides[Math.floor(Math.random() * 4)]
      let x, y, vx, vy
      const speed = 0.4 + Math.random() * 0.3
      if (side === 'top')    { x = Math.random() * canvas.width;  y = -100; vx = 0.1; vy = speed }
      else if (side === 'bottom') { x = Math.random() * canvas.width;  y = canvas.height + 100; vx = -0.1; vy = -speed }
      else if (side === 'left')   { x = -100; y = Math.random() * canvas.height; vx = speed; vy = 0.1 }
      else                        { x = canvas.width + 100; y = Math.random() * canvas.height; vx = -speed; vy = -0.1 }
      return { x, y, vx, vy, history: [], tailLength: 130 }
    }

    function init() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight

      // Astro-Plexus nodes
      particles = Array.from({ length: 55 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      }))

      planets = Array.from({ length: 10 }, (_, i) => new Planet(i, 10))
      comets  = Array.from({ length: 3 }, createComet)
    }

    function draw() {
      // Dark space background
      ctx.fillStyle = '#0a0e14'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const colorAccent = '76, 201, 240'

      // 1. Central Sun
      ctx.shadowBlur  = 50
      ctx.shadowColor = '#ffcc00'
      ctx.fillStyle   = '#ffcc00'
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, 35, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // 2. Planets
      planets.forEach(p => p.update())

      // 3. Astro-Plexus nodes + connections
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.fillStyle = `rgba(${colorAccent}, 0.8)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2)
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(p.x - particles[j].x, p.y - particles[j].y)
          if (dist < 220) {
            ctx.strokeStyle = `rgba(${colorAccent}, ${0.15 * (1 - dist / 220)})`
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      })

      // 4. Comets
      comets.forEach((c, i) => {
        c.x += c.vx; c.y += c.vy
        c.history.push({ x: c.x, y: c.y })
        if (c.history.length > c.tailLength) c.history.shift()
        if (c.x < -200 || c.x > canvas.width + 200 || c.y < -200 || c.y > canvas.height + 200)
          comets[i] = createComet()
        c.history.forEach((h, idx) => {
          ctx.fillStyle = `rgba(${colorAccent}, ${(idx / c.history.length) * 0.3})`
          ctx.beginPath()
          ctx.arc(h.x, h.y, (idx / c.history.length) * 3, 0, Math.PI * 2)
          ctx.fill()
        })
      })

      animId = requestAnimationFrame(draw)
    }

    const onResize = () => init()
    window.addEventListener('resize', onResize)
    init()
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block',
      }}
    />
  )
}