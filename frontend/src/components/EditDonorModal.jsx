import { useState, useEffect } from 'react'
import api from '../api/axios'

const inputCls = `w-full px-3 py-2.5 rounded-xl text-sm text-white transition-all duration-300 focus:outline-none`
const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }
const focusStyle = (e) => { e.target.style.border = '1px solid rgba(52,211,153,0.5)' }
const blurStyle  = (e) => { e.target.style.border = '1px solid rgba(255,255,255,0.1)' }

export default function EditDonorModal({ donor, onClose, onSaved }) {
  const [form,    setForm]    = useState({})
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const f = {}
    for (const [k, v] of Object.entries(donor)) { f[k] = v ?? '' }
    setForm(f)
  }, [donor])

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    const payload = {}
    for (const [k, v] of Object.entries(form)) { payload[k] = v === '' ? null : v }
    try { await api.put(`/donors/${donor.id}/`, payload); onSaved(); onClose() }
    catch { setError('Failed to update donor.') }
    finally { setLoading(false) }
  }

  const F = ({ label, k, type='text', required }) => (
    <div>
      <label className="block text-xs font-bold tracking-widest uppercase text-emerald-300/60 mb-1.5">
        {label}{required && <span className="text-rose-400 ml-1">✦</span>}
      </label>
      <input type={type} value={form[k] ?? ''} onChange={set(k)} required={required}
        className={inputCls} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
    </div>
  )

  const Sel = ({ label, k, options, required }) => (
    <div>
      <label className="block text-xs font-bold tracking-widest uppercase text-emerald-300/60 mb-1.5">
        {label}{required && <span className="text-rose-400 ml-1">✦</span>}
      </label>
      <select value={form[k] ?? ''} onChange={set(k)} required={required}
        className={inputCls} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
        <option value="" style={{ background:'#071a10' }}>Select…</option>
        {options.map(([v, l]) => <option key={v} value={v} style={{ background:'#071a10' }}>{l}</option>)}
      </select>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{ background: 'rgba(10,22,14,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)' }}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-7 py-5"
          style={{ background: 'rgba(10,22,14,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <span className="material-symbols-outlined text-emerald-300" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>edit</span>
            </div>
            <h2 className="font-black text-xl" style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Edit Donor #{donor.id}
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-7 space-y-6">
          {error && (
            <div className="p-3 rounded-2xl flex items-center gap-2 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <span className="material-symbols-outlined text-red-400" style={{ fontSize: 16 }}>error</span>
              <span className="text-red-300">{error}</span>
            </div>
          )}

          {/* Required */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 14 }}>badge</span>
              </div>
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-400/70">Required Information</span>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(52,211,153,0.2), transparent)' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <F label="First Name" k="first_name" required />
              <F label="Last Name"  k="last_name"  required />
              <F label="Phone"      k="phone"      required />
              <F label="Alt Phone"  k="alt_phone"  required />
              <Sel label="Gender" k="gender" required options={[['male','Male'],['female','Female'],['other','Other']]} />
              <F label="Occupation" k="occupation" required />
              <Sel label="Occasion Type" k="donor_type" required options={[['birthday','🎂 Birthday'],['anniversary','💍 Anniversary'],['memorial','🌸 Memorial']]} />
              <F label="Occasion Date" k="type_date" type="date" required />
              <Sel label="Food" k="food" required options={[['morning','🌅 Morning'],['afternoon','☀️ Afternoon'],['night','🌙 Night']]} />
              <div className="col-span-2">
                <label className="block text-xs font-bold tracking-widest uppercase text-emerald-300/60 mb-1.5">Address <span className="text-rose-400">✦</span></label>
                <textarea value={form.address ?? ''} onChange={set('address')} required rows={2}
                  className={inputCls} style={{ ...inputStyle, resize:'none' }} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>
          </div>

          {/* Family */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 14 }}>family_restroom</span>
              </div>
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-400/70">Family Details</span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/25 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>Optional</span>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(52,211,153,0.2), transparent)' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <F label="Mother's Name"        k="mother_name" />
              <F label="Mother's Birthday"    k="mother_birthday"    type="date" />
              <F label="Father's Name"        k="father_name" />
              <F label="Father's Birthday"    k="father_birthday"    type="date" />
              <F label="Wife's Name"          k="wife_name" />
              <F label="Wife's Birthday"      k="wife_birthday"      type="date" />
              <F label="Wife's Anniversary"   k="wife_anniversary"   type="date" />
              <F label="Child's Name"         k="child_name" />
              <F label="Child's Birthday"     k="child_birthday"     type="date" />
              <F label="Parents Anniversary"  k="parents_anniversary" type="date" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl font-bold text-white/50 transition-all hover:text-white active:scale-95"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3.5 rounded-2xl font-bold text-white relative overflow-hidden group transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 8px 24px rgba(5,150,105,0.3)', letterSpacing: '0.03em' }}>
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
              <span className="flex items-center justify-center gap-2">
                {loading ? 'Saving…' : <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span> SAVE CHANGES</>}
              </span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7) sepia(1) saturate(2) hue-rotate(100deg); opacity:0.5; cursor:pointer; }
        select option { background: #071a10; color: #d1fae5; }
        * { -webkit-font-smoothing: antialiased; }
      `}</style>
    </div>
  )
}