import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Solar System Canvas — FULL SCREEN ────────────────────────────────────────
function SolarSystemBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let planets = [], comets = [], starField = [], rafId

    class Planet {
      constructor(index, total) {
        // distFactor uses Math.max so orbits cover entire screen diagonally
        this.distFactor = 0.10 + (index / (total - 1)) * 0.60
        this.radius     = 4 + Math.random() * 10
        this.speed      = (0.004 / (index + 1)) * 0.6
        this.angle      = (index / total) * Math.PI * 2 + Math.random() * 0.5
        const hues      = [200, 30, 180, 5, 280, 150, 45, 210, 330, 60]
        this.color      = `hsl(${hues[index % hues.length]}, 85%, 65%)`
        this.glowColor  = `hsl(${hues[index % hues.length]}, 85%, 75%)`
      }

      update() {
        this.angle += this.speed
        const cx     = canvas.width  / 2
        const cy     = canvas.height / 2
        // KEY FIX: Math.max covers full screen including corners
        const maxDim = Math.max(canvas.width, canvas.height)
        const orbitR = maxDim * this.distFactor
        const x = cx + Math.cos(this.angle) * orbitR
        const y = cy + Math.sin(this.angle) * orbitR

        // Orbit ring — subtle dashed look via low opacity
        ctx.strokeStyle = 'rgba(255,255,255,0.07)'
        ctx.lineWidth   = 1
        ctx.setLineDash([4, 8])
        ctx.beginPath()
        ctx.arc(cx, cy, orbitR, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])

        // Planet outer glow
        const grd = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 4)
        grd.addColorStop(0,   this.glowColor.replace(')', ', 0.6)').replace('hsl', 'hsla'))
        grd.addColorStop(0.4, this.glowColor.replace(')', ', 0.15)').replace('hsl', 'hsla'))
        grd.addColorStop(1,   'transparent')
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(x, y, this.radius * 4, 0, Math.PI * 2)
        ctx.fill()

        // Planet solid
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(x, y, this.radius, 0, Math.PI * 2)
        ctx.fill()

        // Specular highlight
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.beginPath()
        ctx.arc(x - this.radius * 0.3, y - this.radius * 0.3, this.radius * 0.35, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function createComet() {
      const sides = ['top', 'bottom', 'left', 'right']
      const side  = sides[Math.floor(Math.random() * 4)]
      let x, y, vx, vy
      const speed = 0.6 + Math.random() * 0.5
      const drift = (Math.random() - 0.5) * 0.3
      if      (side === 'top')    { x = Math.random() * canvas.width;  y = -120;                vx = drift;  vy =  speed }
      else if (side === 'bottom') { x = Math.random() * canvas.width;  y = canvas.height + 120; vx = drift;  vy = -speed }
      else if (side === 'left')   { x = -120;                          y = Math.random() * canvas.height; vx =  speed; vy = drift }
      else                        { x = canvas.width + 120;            y = Math.random() * canvas.height; vx = -speed; vy = drift }
      return { x, y, vx, vy, history: [], tailLength: 120 }
    }

    function init() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight

      // Star field
      starField = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        opacity: Math.random() * 0.5 + 0.1,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.01 + Math.random() * 0.02,
      }))

      planets = Array.from({ length: 10 }, (_, i) => new Planet(i, 10))
      comets  = Array.from({ length: 5 }, createComet)
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width  / 2
      const cy = canvas.height / 2

      // Twinkling stars
      starField.forEach(s => {
        s.twinkle += s.twinkleSpeed
        const alpha = s.opacity * (0.6 + 0.4 * Math.sin(s.twinkle))
        ctx.fillStyle = `rgba(200,220,255,${alpha})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      })

      // Sun outer corona
      const corona = ctx.createRadialGradient(cx, cy, 0, cx, cy, 130)
      corona.addColorStop(0,    'rgba(255,230,80,0.9)')
      corona.addColorStop(0.25, 'rgba(255,180,30,0.45)')
      corona.addColorStop(0.6,  'rgba(255,120,0,0.12)')
      corona.addColorStop(1,    'transparent')
      ctx.fillStyle = corona
      ctx.beginPath()
      ctx.arc(cx, cy, 130, 0, Math.PI * 2)
      ctx.fill()

      // Sun solid core
      const sunCore = ctx.createRadialGradient(cx - 8, cy - 8, 2, cx, cy, 30)
      sunCore.addColorStop(0, '#fff7aa')
      sunCore.addColorStop(1, '#ffcc00')
      ctx.fillStyle = sunCore
      ctx.beginPath()
      ctx.arc(cx, cy, 30, 0, Math.PI * 2)
      ctx.fill()

      // Planets + orbit rings
      planets.forEach(p => p.update())

      // Comets with glowing tail
      comets.forEach((c, i) => {
        c.x += c.vx
        c.y += c.vy
        c.history.push({ x: c.x, y: c.y })
        if (c.history.length > c.tailLength) c.history.shift()

        const oob = c.x < -350 || c.x > canvas.width + 350 || c.y < -350 || c.y > canvas.height + 350
        if (oob) comets[i] = createComet()

        // Tail
        c.history.forEach((h, idx) => {
          const t = idx / c.history.length
          ctx.fillStyle = `rgba(120,230,255,${t * 0.55})`
          ctx.beginPath()
          ctx.arc(h.x, h.y, t * 2.8, 0, Math.PI * 2)
          ctx.fill()
        })

        // Head glow
        const headGlow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 10)
        headGlow.addColorStop(0, 'rgba(220,248,255,0.95)')
        headGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = headGlow
        ctx.beginPath()
        ctx.arc(c.x, c.y, 10, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = 'rgba(255,255,255,0.95)'
        ctx.beginPath()
        ctx.arc(c.x, c.y, 2.5, 0, Math.PI * 2)
        ctx.fill()
      })

      rafId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', init)
    init()
    draw()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', init)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
    />
  )
}

// ── Green Rising Particles ───────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let w = canvas.width  = window.innerWidth
    let h = canvas.height = window.innerHeight

    const particles = Array.from({ length: 80 }, () => ({
      x:       Math.random() * w,
      y:       Math.random() * h,
      r:       Math.random() * 2 + 0.4,
      dx:      (Math.random() - 0.5) * 0.25,
      dy:      -(Math.random() * 0.38 + 0.07),
      opacity: Math.random() * 0.35 + 0.08,
    }))

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(134,239,172,${p.opacity})`
        ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w }
        if (p.x < -5)   p.x = w + 5
        if (p.x > w + 5) p.x = -5
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => {
      w = canvas.width  = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
    />
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────
const stats = [
  { icon: 'elderly',            value: '120+', label: 'Elders Cared For' },
  { icon: 'volunteer_activism', value: '50+',  label: 'Volunteers' },
  { icon: 'calendar_month',     value: '10+',  label: 'Years of Service' },
  { icon: 'favorite',           value: '500+', label: 'Donors & Supporters' },
]

const services = [
  { icon: 'medical_services', title: 'Medical Care',      desc: 'Regular health check-ups, medicines, and emergency care for every resident.' },
  { icon: 'restaurant',       title: 'Nutritious Meals',  desc: 'Three balanced meals daily, prepared with love and care for elderly needs.' },
  { icon: 'self_improvement', title: 'Wellness Programs', desc: 'Yoga, meditation, and light exercises to keep minds and bodies active.' },
  { icon: 'celebration',      title: 'Joyful Activities', desc: 'Cultural events, festivals, and group activities to nurture community spirit.' },
  { icon: 'psychology',       title: 'Counselling',       desc: 'Emotional support and counselling sessions for mental well-being.' },
  { icon: 'home_heart',       title: 'Safe Shelter',      desc: 'Clean, comfortable, and secure living spaces designed for the elderly.' },
]

// ── Main Component ────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ background: 'linear-gradient(135deg, #020d07 0%, #041a10 40%, #071f13 70%, #030e08 100%)' }}
    >

      {/* ── BACKGROUND LAYERS ── */}
      <SolarSystemBackground />   {/* zIndex 1 — solar system, full screen */}
      <ParticleField />           {/* zIndex 2 — green rising dots */}

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 3 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(253,203,82,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 3 }} />

      {/* ── NAVBAR ── */}
      <header className="sticky top-0" style={{ zIndex: 50, background: 'rgba(2,13,7,0.80)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <nav className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl" style={{ color: '#fdcb52', fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <span className="text-xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sevagan Trust</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Home', 'About', 'Services', 'Contact'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`}
                className="text-sm font-medium text-white/40 hover:text-emerald-300 transition-colors duration-300 tracking-wide">
                {link}
              </a>
            ))}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-xl text-sm font-bold text-emerald-300 transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
            Login
          </button>
        </nav>
      </header>

      {/* ── CONTENT (above all canvas layers) ── */}
      <main className="flex-1 relative" style={{ zIndex: 10 }}>

        {/* ── HERO ── */}
        <section id="home"
          className="flex flex-col items-center justify-center text-center py-28 px-4"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(32px)', transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)' }}>

          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-8 relative"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.3)', boxShadow: '0 0 60px rgba(16,185,129,0.25)' }}>
            <span className="material-symbols-outlined text-5xl" style={{ color: '#fdcb52', fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <span className="absolute inset-0 rounded-3xl animate-ping" style={{ background: 'rgba(16,185,129,0.08)', animationDuration: '2.5s' }} />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">Compassion First • Salem, Tamil Nadu</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-3xl leading-tight"
            style={{ background: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #a7f3d0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Care Beyond<br />Family
          </h1>

          <p className="text-white/40 text-lg max-w-xl leading-relaxed mb-10">
            Sevagan Trust provides a warm, loving home for the elderly — offering medical care, nutritious meals, and joyful companionship.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', boxShadow: '0 8px 32px rgba(5,150,105,0.4)', color: 'white', letterSpacing: '0.05em' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
              Manage Donors
            </button>
            <a href="#services"
              className="px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 text-emerald-300"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_downward</span>
              Our Services
            </a>
          </div>
        </section>

        {/* ── STATS ── */}
        <section id="about" className="py-16 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ icon, value, label }) => (
              <div key={label} className="flex flex-col items-center p-6 rounded-2xl text-center"
                style={{ background: 'rgba(4,26,16,0.78)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
                <span className="material-symbols-outlined text-3xl mb-3" style={{ color: '#fdcb52', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                <span className="text-3xl font-black" style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</span>
                <span className="text-white/40 text-xs mt-1 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">What We Offer</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight"
                style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Our Services
              </h2>
              <p className="text-white/35 mt-3 max-w-md mx-auto">Every resident deserves dignity, comfort, and joy — we make it happen every single day.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {services.map(({ icon, title, desc }) => (
                <div key={title}
                  className="p-6 rounded-2xl group hover:scale-[1.02] transition-all duration-300"
                  style={{ background: 'rgba(4,26,16,0.78)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.25)' }}>
                    <span className="material-symbols-outlined text-xl" style={{ color: '#34d399', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <h3 className="font-bold text-white/80 mb-2">{title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT / CTA ── */}
        <section id="contact" className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl"
            style={{ background: 'rgba(4,26,16,0.78)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
            <span className="material-symbols-outlined text-4xl mb-4 block" style={{ color: '#fdcb52', fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
            <h2 className="text-3xl font-black tracking-tight mb-3"
              style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Join Our Mission
            </h2>
            <p className="text-white/35 mb-8 leading-relaxed">
              Your support — big or small — makes a real difference in the lives of our beloved elders.<br />Contact us to donate or volunteer.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="mailto:sevagan.senthil@gmail.com"
                className="px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 text-emerald-300 transition-all hover:scale-105"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>mail</span>
                sevagan.senthil@gmail.com
              </a>
            </div>
          </div>
        </section>

        {/* ── QUOTE ── */}
        <div className="text-center py-10">
          <span className="material-symbols-outlined text-emerald-400/40 block mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
          <p className="text-white/25 italic text-sm">"Here, we don't just add years to life, we add life to years."</p>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative" style={{ zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(2,13,7,0.88)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ color: '#fdcb52', fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <span className="font-bold text-white/60 text-sm">Sevagan Trust</span>
          </div>
          <p className="text-white/25 text-xs">© 2024 Sevagan Trust. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        * { -webkit-font-smoothing: antialiased; }
        ::selection { background: rgba(52,211,153,0.3); color: white; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}