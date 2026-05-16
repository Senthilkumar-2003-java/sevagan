import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

function fmt(val) { return val || <span className="text-white/20 italic">—</span> }
function fmtDate(d) {
  if (!d) return <span className="text-white/20 italic">—</span>
  const [y, m, day] = d.split('-')
  return `${day}-${m}-${y}`
}

const TYPE_BADGE = {
  birthday:    'bg-pink-500/20 text-pink-300 border border-pink-400/30',
  anniversary: 'bg-rose-500/20 text-rose-300 border border-rose-400/30',
  memorial:    'bg-purple-500/20 text-purple-300 border border-purple-400/30',
}
const FOOD_BADGE = {
  morning:   'bg-amber-500/20 text-amber-300 border border-amber-400/30',
  afternoon: 'bg-orange-500/20 text-orange-300 border border-orange-400/30',
  night:     'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30',
}

const HEADERS = [
  '#', 'First Name', 'Last Name', 'Occasion Type', 'Date',
  'Food Preference', 'Mobile', 'Alt Mobile', 'Address', 'Gender', 'Occupation', 'Actions',
]

export default function ConfirmDoners() {
  const [records,    setRecords]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [completing, setCompleting] = useState(null)        // confirmed_id
  const [rejecting,  setRejecting]  = useState(null)        // { id, name }
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/confirmed-donors/')
      setRecords(res.data)
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const handleComplete = async (id) => {
    try {
      await api.delete(`/confirmed-donors/${id}/complete/`)
      setRecords(prev => prev.filter(r => r.id !== id))
    } catch { alert('Failed to complete.') }
    finally  { setCompleting(null) }
  }

  const handleReject = async (id) => {
    try {
      await api.delete(`/confirmed-donors/${id}/reject/`)
      setRecords(prev => prev.filter(r => r.id !== id))
    } catch { alert('Failed to reject.') }
    finally  { setRejecting(null) }
  }

  return (
    <div
      className="relative min-h-screen px-4 py-10"
      style={{ background: 'linear-gradient(135deg, #020d07 0%, #041a10 40%, #071f13 70%, #030e08 100%)' }}
    >
      {/* Ambient orbs */}
      <div style={{ position:'fixed', top:'-10%', left:'-5%', width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'-10%', right:'-5%', width:600, height:600, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(5,150,105,0.05) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      <div
        className="relative z-10 max-w-full"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-300"
                  style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <h1 className="font-black text-3xl tracking-tight"
                style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Confirm Donors
              </h1>
            </div>
            <p className="text-white/30 text-sm ml-13 pl-1">
              {records.length} record{records.length !== 1 ? 's' : ''} pending
            </p>
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="text-center py-24 text-white/30">
            <div className="inline-block w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin mb-4" />
            <p className="text-sm tracking-widest uppercase">Loading…</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <span className="material-symbols-outlined block mb-4" style={{ fontSize: 56 }}>verified</span>
            <p className="text-lg font-bold text-white/40">No confirmed donors yet</p>
            <p className="text-sm mt-1">Use the sidebar to confirm upcoming donors.</p>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 32px 64px rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(16,185,129,0.15)', borderBottom: '1px solid rgba(52,211,153,0.15)' }}>
                    {HEADERS.map(h => (
                      <th key={h} className="px-4 py-4 text-left font-bold whitespace-nowrap text-xs uppercase tracking-widest text-emerald-300/70">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, idx) => (
                    <tr
                      key={r.id}
                      className="transition-all duration-200"
                      style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}
                    >
                      <td className="px-4 py-3 font-black text-emerald-400">#{r.id}</td>
                      <td className="px-4 py-3 font-bold text-white">{fmt(r.first_name)}</td>
                      <td className="px-4 py-3 font-bold text-white">{fmt(r.last_name)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${TYPE_BADGE[r.occasion_type] || 'bg-white/10 text-white/50'}`}>
                          {r.occasion_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmtDate(r.occasion_date)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${FOOD_BADGE[r.food] || 'bg-white/10 text-white/50'}`}>
                          {r.food}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmt(r.phone)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmt(r.alt_phone)}</td>
                      <td className="px-4 py-3 max-w-32 truncate text-white/70" title={r.address}>{fmt(r.address)}</td>
                      <td className="px-4 py-3 capitalize text-white/70">{fmt(r.gender)}</td>
                      <td className="px-4 py-3 text-white/70">{fmt(r.occupation)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCompleting(r.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105"
                            style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.25)' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                            Completed
                          </button>
                          <button
                            onClick={() => setRejecting({ id: r.id, name: `${r.first_name} ${r.last_name}` })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105"
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>cancel</span>
                            Rejected
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Complete Confirm Dialog ──────────────────────────────── */}
      {completing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-sm text-center p-8 rounded-3xl"
            style={{ background: 'rgba(15,25,18,0.95)', border: '1px solid rgba(52,211,153,0.25)', boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <span className="material-symbols-outlined text-emerald-400"
                style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h3 className="font-black text-xl text-white mb-2">Mark as Completed?</h3>
            <p className="text-white/40 text-sm mb-7">
              This removes the record from the list. The donor stays in the database.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCompleting(null)}
                className="flex-1 py-3 rounded-2xl font-bold text-white/60 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              <button onClick={() => handleComplete(completing)}
                className="flex-1 py-3 rounded-2xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 8px 24px rgba(5,150,105,0.3)' }}>
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Confirm Dialog ───────────────────────────────── */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-sm text-center p-8 rounded-3xl"
            style={{ background: 'rgba(15,25,18,0.95)', border: '1px solid rgba(239,68,68,0.25)', boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <span className="material-symbols-outlined text-red-400"
                style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <h3 className="font-black text-xl text-white mb-2">Reject Donor?</h3>
            <p className="text-white/40 text-sm mb-7">
              <span className="text-white/70 font-semibold">{rejecting.name}</span> will be permanently deleted from the database.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRejecting(null)}
                className="flex-1 py-3 rounded-2xl font-bold text-white/60 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              <button onClick={() => handleReject(rejecting.id)}
                className="flex-1 py-3 rounded-2xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', boxShadow: '0 8px 24px rgba(220,38,38,0.3)' }}>
                Yes, Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { -webkit-font-smoothing: antialiased; }
        ::selection { background: rgba(52,211,153,0.3); color: white; }
      `}</style>
    </div>
  )
}