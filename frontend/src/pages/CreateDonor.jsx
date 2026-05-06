import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

const INITIAL = {
  first_name: '', last_name: '', address: '', phone: '', alt_phone: '',
  gender: '', occupation: '', donor_type: '', type_date: '', food: '',
  mother_name: '', mother_birthday: '',
  father_name: '', father_birthday: '',
  child_name:  '', child_birthday:  '',
  wife_name:   '', wife_birthday:   '', wife_anniversary: '',
  parents_anniversary: '',
}

/* ── Floating Particle Background ─────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w = canvas.width = canvas.offsetWidth
    let h = canvas.height = canvas.offsetHeight
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.35,
      dy: -(Math.random() * 0.4 + 0.1),
      opacity: Math.random() * 0.4 + 0.1,
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
        if (p.x < -5) p.x = w + 5
        if (p.x > w + 5) p.x = -5
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => {
      w = canvas.width = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }} />
}

/* ── Input Components ─────────────────────────────────────────── */
const inputCls = `
  w-full px-4 py-3 rounded-2xl text-sm
  bg-white/10 backdrop-blur-sm
  border border-white/20
  text-white placeholder-white/40
  focus:outline-none focus:border-emerald-400/60 focus:bg-white/15
  transition-all duration-300
  hover:bg-white/12
`

const InputField = ({ label, required, children, hint }) => (
  <div className="group">
    <label className="block text-xs font-semibold tracking-widest uppercase text-emerald-300/80 mb-2">
      {label}
      {required && <span className="text-rose-400 ml-1">✦</span>}
      {hint && <span className="normal-case tracking-normal text-white/30 ml-1 font-normal">({hint})</span>}
    </label>
    {children}
  </div>
)

/* ── Section Header ───────────────────────────────────────────── */
const Section = ({ title, icon, optional, delay = 0 }) => (
  <div className="flex items-center gap-4 mt-10 mb-5" style={{ animationDelay: `${delay}ms` }}>
    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
      <span className="material-symbols-outlined text-emerald-300" style={{ fontSize: 18 }}>{icon}</span>
    </div>
    <div className="flex items-center gap-3">
      <h3 className="font-bold text-base text-white tracking-wide">{title}</h3>
      {optional && (
        <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400/60 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
          Optional
        </span>
      )}
    </div>
    <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent" />
  </div>
)

/* ── Family Card ──────────────────────────────────────────────── */
const FamilyCard = ({ emoji, label, color, children }) => {
  const colors = {
    pink:   'from-pink-500/10 to-rose-500/5 border-pink-400/20',
    blue:   'from-blue-500/10 to-cyan-500/5 border-blue-400/20',
    rose:   'from-rose-500/10 to-pink-500/5 border-rose-400/20',
    amber:  'from-amber-500/10 to-orange-500/5 border-amber-400/20',
    purple: 'from-purple-500/10 to-violet-500/5 border-purple-400/20',
  }
  const textColors = {
    pink: 'text-pink-300', blue: 'text-blue-300', rose: 'text-rose-300',
    amber: 'text-amber-300', purple: 'text-purple-300',
  }
  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${colors[color]} border backdrop-blur-sm`}>
      <p className={`text-xs font-bold tracking-widest uppercase ${textColors[color]} mb-4 flex items-center gap-2`}>
        <span style={{ fontSize: 15 }}>{emoji}</span> {label}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

/* ── Main Component ───────────────────────────────────────────── */
export default function CreateDonor() {
  const [form,    setForm]    = useState(INITIAL)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess(false)
    const payload = {}
    for (const [k, v] of Object.entries(form)) { payload[k] = v === '' ? null : v }
    try {
      await api.post('/donors/', payload)
      setSuccess(true)
      setForm(INITIAL)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(135deg, #020d07 0%, #041a10 40%, #071f13 70%, #030e08 100%)' }}>
      <ParticleField />

      {/* Ambient orbs */}
      <div style={{ position:'fixed', top:'-10%', left:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'-10%', right:'-5%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">

        {/* ── Hero Header ───────────────────────────────────────── */}
        <div
          className="mb-12 text-center"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-24px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)' }}
        >
          {/* Glow ring icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 relative" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.3)', boxShadow: '0 0 40px rgba(16,185,129,0.2), inset 0 0 20px rgba(16,185,129,0.05)' }}>
            <span className="material-symbols-outlined text-emerald-300" style={{ fontSize: 36, fontVariationSettings: "'FILL' 1" }}>person_add</span>
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-3xl animate-ping" style={{ background: 'rgba(16,185,129,0.08)', animationDuration: '2.5s' }} />
          </div>

          <h1 className="text-4xl font-black tracking-tight mb-2" style={{ background: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #a7f3d0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Create Donor
          </h1>
          <p className="text-white/40 text-sm tracking-wide">Add a new donor to the Sevagan Trust family</p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-500/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-500/40" />
          </div>
        </div>

        {/* ── Alerts ────────────────────────────────────────────── */}
        {success && (
          <div
            className="mb-6 p-4 rounded-2xl flex items-center gap-4"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(52,211,153,0.3)', animation: 'slideDown 0.5s cubic-bezier(0.16,1,0.3,1)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-emerald-300" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div>
              <p className="font-bold text-emerald-300 text-sm">Donor created successfully!</p>
              <p className="text-emerald-400/60 text-xs mt-0.5">The donor has been added to the list.</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-2xl text-rose-300 text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)' }}>
            {error}
          </div>
        )}

        {/* ── Glass Form Card ───────────────────────────────────── */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 28,
            backdropFilter: 'blur(20px)',
            padding: '2.5rem',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(32px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s',
            boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <form onSubmit={handleSubmit}>

            {/* ── Personal Info ──────────────────────────────────── */}
            <Section title="Personal Information" icon="badge" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <InputField label="First Name" required>
                <input type="text" value={form.first_name} onChange={set('first_name')} required placeholder="Ramesh" className={inputCls} />
              </InputField>

              <InputField label="Last Name" required>
                <input type="text" value={form.last_name} onChange={set('last_name')} required placeholder="Kumar" className={inputCls} />
              </InputField>

              <InputField label="Phone Number" required>
                <input type="tel" value={form.phone} onChange={set('phone')} required placeholder="+91 98765 43210" className={inputCls} />
              </InputField>

              <InputField label="Alternative Phone" required>
                <input type="tel" value={form.alt_phone} onChange={set('alt_phone')} required placeholder="+91 98765 00000" className={inputCls} />
              </InputField>

              <InputField label="Gender" required>
                <select value={form.gender} onChange={set('gender')} required className={inputCls}>
                  <option value="" style={{ background: '#071a10' }}>Select Gender</option>
                  <option value="male" style={{ background: '#071a10' }}>Male</option>
                  <option value="female" style={{ background: '#071a10' }}>Female</option>
                  <option value="other" style={{ background: '#071a10' }}>Other</option>
                </select>
              </InputField>

              <InputField label="Occupation" required>
                <input type="text" value={form.occupation} onChange={set('occupation')} required placeholder="Business / Farmer / etc." className={inputCls} />
              </InputField>

              <div className="md:col-span-2">
                <InputField label="Address" required>
                  <textarea value={form.address} onChange={set('address')} required rows={3} placeholder="Full address..." className={inputCls} style={{ resize: 'none' }} />
                </InputField>
              </div>
            </div>

            {/* ── Donor Type ────────────────────────────────────── */}
            <Section title="Donation Type & Occasion" icon="event" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <InputField label="Occasion Type" required>
                <select value={form.donor_type} onChange={set('donor_type')} required className={inputCls}>
                  <option value="" style={{ background: '#071a10' }}>Birthday / Anniversary / Memorial</option>
                  <option value="birthday" style={{ background: '#071a10' }}>🎂 Birthday</option>
                  <option value="anniversary" style={{ background: '#071a10' }}>💍 Anniversary</option>
                  <option value="memorial" style={{ background: '#071a10' }}>🌸 Memorial</option>
                </select>
              </InputField>

              {form.donor_type && (
                <InputField label={form.donor_type === 'birthday' ? 'Birth Date' : form.donor_type === 'anniversary' ? 'Anniversary Date' : 'Memorial Date'} required>
                  <input type="date" value={form.type_date} onChange={set('type_date')} required className={inputCls} />
                </InputField>
              )}

              <InputField label="Food Preference" required>
                <select value={form.food} onChange={set('food')} required className={inputCls}>
                  <option value="" style={{ background: '#071a10' }}>Select Meal Time</option>
                  <option value="morning" style={{ background: '#071a10' }}>🌅 Morning</option>
                  <option value="afternoon" style={{ background: '#071a10' }}>☀️ Afternoon</option>
                  <option value="night" style={{ background: '#071a10' }}>🌙 Night</option>
                </select>
              </InputField>
            </div>

            {/* ── Family Details ─────────────────────────────────── */}
            <Section title="Family Details" icon="family_restroom" optional />
            <div className="space-y-4">

              {/* Mother */}
              <FamilyCard emoji="🌸" label="Mother" color="pink">
                <InputField label="Mother's Name">
                  <input type="text" value={form.mother_name} onChange={set('mother_name')} placeholder="Name" className={inputCls} />
                </InputField>
                <InputField label="Mother's Birthday">
                  <input type="date" value={form.mother_birthday} onChange={set('mother_birthday')} className={inputCls} />
                </InputField>
              </FamilyCard>

              {/* Father */}
              <FamilyCard emoji="🌊" label="Father" color="blue">
                <InputField label="Father's Name">
                  <input type="text" value={form.father_name} onChange={set('father_name')} placeholder="Name" className={inputCls} />
                </InputField>
                <InputField label="Father's Birthday">
                  <input type="date" value={form.father_birthday} onChange={set('father_birthday')} className={inputCls} />
                </InputField>
              </FamilyCard>

              {/* Wife */}
              <div className={`p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/5 border border-rose-400/20 backdrop-blur-sm`}>
                <p className="text-xs font-bold tracking-widest uppercase text-rose-300 mb-4 flex items-center gap-2">
                  <span style={{ fontSize: 15 }}>💕</span> Wife
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="Wife's Name">
                    <input type="text" value={form.wife_name} onChange={set('wife_name')} placeholder="Name" className={inputCls} />
                  </InputField>
                  <InputField label="Wife's Birthday">
                    <input type="date" value={form.wife_birthday} onChange={set('wife_birthday')} className={inputCls} />
                  </InputField>
                  <InputField label="Wife's Anniversary">
                    <input type="date" value={form.wife_anniversary} onChange={set('wife_anniversary')} className={inputCls} />
                  </InputField>
                </div>
              </div>

              {/* Child */}
              <FamilyCard emoji="⭐" label="Child" color="amber">
                <InputField label="Child's Name">
                  <input type="text" value={form.child_name} onChange={set('child_name')} placeholder="Name" className={inputCls} />
                </InputField>
                <InputField label="Child's Birthday">
                  <input type="date" value={form.child_birthday} onChange={set('child_birthday')} className={inputCls} />
                </InputField>
              </FamilyCard>

              {/* Parents Anniversary */}
              <FamilyCard emoji="💜" label="Parents Anniversary" color="purple">
                <InputField label="Parents' Anniversary Date">
                  <input type="date" value={form.parents_anniversary} onChange={set('parents_anniversary')} className={inputCls} />
                </InputField>
              </FamilyCard>
            </div>

            {/* ── Submit Button ──────────────────────────────────── */}
            <div className="mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-base relative overflow-hidden group transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
                  boxShadow: '0 8px 32px rgba(5,150,105,0.35), 0 2px 8px rgba(0,0,0,0.3)',
                  color: 'white',
                  letterSpacing: '0.05em',
                }}
              >
                {/* Shine sweep */}
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />

                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Saving…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person_add</span>
                    CREATE DONOR
                  </span>
                )}
              </button>

              <p className="text-center text-white/20 text-xs mt-4 tracking-wide">
                All required fields must be filled before submission
              </p>
            </div>

          </form>
        </div>

        {/* Bottom padding */}
        <div className="h-16" />
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.7) sepia(1) saturate(2) hue-rotate(100deg);
          opacity: 0.6;
          cursor: pointer;
        }
        select option { color: #d1fae5; background: #071a10; }
        ::selection { background: rgba(52,211,153,0.3); color: white; }
        * { -webkit-font-smoothing: antialiased; }
      `}</style>
    </div>
  )
}