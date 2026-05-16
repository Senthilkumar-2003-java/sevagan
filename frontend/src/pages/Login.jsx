import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ParticleField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w = canvas.width = canvas.offsetWidth
    let h = canvas.height = canvas.offsetHeight
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -(Math.random() * 0.45 + 0.1),
      opacity: Math.random() * 0.45 + 0.1,
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(134,239,172,${p.opacity})`; ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w }
        if (p.x < -5) p.x = w + 5
        if (p.x > w + 5) p.x = -5
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }} />
}

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [mounted,  setMounted]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password); navigate('/dashboard')}
    catch { setError('Invalid email or password. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'linear-gradient(135deg, #020d07 0%, #041a10 40%, #071f13 70%, #030e08 100%)' }}>
      <ParticleField />
      <div style={{ position:'fixed', top:'-10%', left:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'-10%', right:'-5%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(253,203,82,0.05) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      <header className="sticky top-0 z-50" style={{ background: 'rgba(2,13,7,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <nav className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl" style={{ color: '#fdcb52', fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <span className="text-xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sevagan Trust</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Home','About','Services','Contact'].map(link => (
              <a key={link} href="#" className="text-sm font-medium text-white/40 hover:text-emerald-300 transition-colors duration-300 tracking-wide">{link}</a>
            ))}
          </div>
          <button className="px-5 py-2 rounded-xl text-sm font-bold text-emerald-300 transition-all hover:scale-105 active:scale-95" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>Login</button>
        </nav>
      </header>

      <main className="flex-1 relative z-10 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md" style={{ opacity: mounted?1:0, transform: mounted?'translateY(0) scale(1)':'translateY(32px) scale(0.97)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
          <div className="p-10 rounded-3xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 relative" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.3)', boxShadow: '0 0 40px rgba(16,185,129,0.2)' }}>
                <span className="material-symbols-outlined text-3xl" style={{ color: '#fdcb52', fontVariationSettings: "'FILL' 1" }}>favorite</span>
                <span className="absolute inset-0 rounded-3xl animate-ping" style={{ background: 'rgba(16,185,129,0.08)', animationDuration: '2.5s' }} />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">Compassion First</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-2" style={{ background: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #a7f3d0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome Back</h1>
              <p className="text-white/35 text-sm">Sign in to manage Sevagan Trust donors</p>
            </div>

            <div className="space-y-5">
              {error && (
                <div className="p-4 rounded-2xl flex items-center gap-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', animation: 'slideDown 0.4s ease' }}>
                  <span className="material-symbols-outlined text-red-400" style={{ fontSize: 18 }}>error</span>
                  <span className="text-red-300">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-emerald-300/70 mb-2">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/50" style={{ fontSize: 18 }}>mail</span>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="sevagan.senthil@gmail.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm text-white transition-all duration-300 focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e=>e.target.style.border='1px solid rgba(52,211,153,0.5)'}
                    onBlur={e=>e.target.style.border='1px solid rgba(255,255,255,0.1)'} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-emerald-300/70 mb-2">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/50" style={{ fontSize: 18 }}>lock</span>
                  <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm text-white transition-all duration-300 focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e=>e.target.style.border='1px solid rgba(52,211,153,0.5)'}
                    onBlur={e=>e.target.style.border='1px solid rgba(255,255,255,0.1)'} />
                  <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{showPass?'visibility_off':'visibility'}</span>
                  </button>
                </div>
              </div>

              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-base relative overflow-hidden group transition-all duration-300 active:scale-[0.98] disabled:opacity-50 mt-2"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)', boxShadow: '0 8px 32px rgba(5,150,105,0.35)', color: 'white', letterSpacing: '0.05em' }}>
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Signing In…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">SIGN IN <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span></span>
                )}
              </button>
            </div>

            <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="material-symbols-outlined text-emerald-400/50 mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
              <p className="text-white/30 italic text-sm">"Here, we don't just add years to life, we add life to years."</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(2,13,7,0.6)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ color: '#fdcb52', fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <span className="font-bold text-white/60 text-sm">Sevagan Trust</span>
          </div>
          <p className="text-white/25 text-xs">© 2024 Sevagan Trust. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }
        input::placeholder { color: rgba(255,255,255,0.25); }
        * { -webkit-font-smoothing: antialiased; }
        ::selection { background: rgba(52,211,153,0.3); color: white; }
      `}</style>
    </div>
  )
}