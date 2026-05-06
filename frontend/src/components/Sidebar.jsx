import { useState, useEffect } from 'react'
import api from '../api/axios'

const TYPES = [
  { key: 'birthday',    icon: 'cake',         label: 'Birthdays',     accent: 'rgba(236,72,153,', badge: '#ec4899' },
  { key: 'anniversary', icon: 'favorite',     label: 'Anniversaries', accent: 'rgba(244,63,94,',  badge: '#f43f5e' },
  { key: 'memorial',    icon: 'local_florist',label: 'Memorials',     accent: 'rgba(168,85,247,', badge: '#a855f7' },
]

export default function Sidebar() {
  const [active,  setActive]  = useState(null)
  const [data,    setData]    = useState([])
  const [counts,  setCounts]  = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    TYPES.forEach(async (t) => {
      try {
        const res = await api.get(`/upcoming/${t.key}/`)
        setCounts(prev => ({ ...prev, [t.key]: res.data.length }))
      } catch { /* ignore */ }
    })
  }, [])

  const toggle = async (key) => {
    if (active === key) { setActive(null); setData([]); return }
    setActive(key); setLoading(true)
    try { const res = await api.get(`/upcoming/${key}/`); setData(res.data) }
    catch { setData([]) }
    finally { setLoading(false) }
  }

  const typeInfo = TYPES.find(t => t.key === active)

  return (
    <>
      {/* Icon Rail */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 pl-2">
        {TYPES.map((t) => {
          const isActive = active === t.key
          return (
            <button key={t.key} onClick={() => toggle(t.key)} title={t.label}
              className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300"
              style={{
                background: isActive ? `${t.accent}0.2)` : 'rgba(255,255,255,0.05)',
                border: isActive ? `1px solid ${t.accent}0.4)` : '1px solid rgba(255,255,255,0.08)',
                boxShadow: isActive ? `0 8px 24px ${t.accent}0.3)` : '0 4px 12px rgba(0,0,0,0.3)',
                transform: isActive ? 'scale(1.1) translateX(4px)' : 'scale(1)',
                backdropFilter: 'blur(12px)',
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: isActive ? t.badge : 'rgba(255,255,255,0.4)', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {t.icon}
              </span>
              {counts[t.key] > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-black" style={{ background: t.badge, fontSize: 10, boxShadow: `0 2px 8px ${t.accent}0.5)` }}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Slide-out Panel */}
      {active && (
        <div
          className="fixed left-16 top-1/2 -translate-y-1/2 z-40 w-80 max-h-[72vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'rgba(8,20,12,0.97)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            animation: 'slideInPanel 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 sticky top-0 z-10"
            style={{ background: `${typeInfo.accent}0.12)`, borderBottom: `1px solid ${typeInfo.accent}0.2)`, backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: typeInfo.badge, fontVariationSettings: "'FILL' 1" }}>{typeInfo.icon}</span>
              <h3 className="font-bold text-sm" style={{ color: typeInfo.badge }}>Upcoming {typeInfo.label}</h3>
            </div>
            <button onClick={() => { setActive(null); setData([]) }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
            </button>
          </div>

          <div className="p-3">
            {loading ? (
              <div className="text-center py-10 text-white/30">
                <div className="inline-block w-7 h-7 rounded-full border-2 border-white/10 animate-spin mb-3" style={{ borderTopColor: typeInfo.badge }} />
                <p className="text-xs tracking-widest uppercase">Loading...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-10 text-white/25">
                <span className="material-symbols-outlined block mb-3" style={{ fontSize: 40 }}>event_available</span>
                <p className="text-xs">No upcoming {typeInfo.label.toLowerCase()} in next 5 days</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.map((donor) => (
                  <div key={donor.id} className="p-3 rounded-xl transition-all duration-200"
                    style={{ background: `${typeInfo.accent}0.08)`, border: `1px solid ${typeInfo.accent}0.18)` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: typeInfo.badge, fontVariationSettings: "'FILL' 1" }}>person</span>
                      <span className="font-bold text-sm text-white">{donor.name}</span>
                    </div>
                    <div className="text-xs text-white/50 space-y-1 pl-5">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-white/30" style={{ fontSize: 13 }}>call</span>
                        <span>{donor.phone}</span>
                        {donor.alt_phone && <span className="text-white/25">/ {donor.alt_phone}</span>}
                      </div>
                      {donor.events.map((ev, i) => (
                        <div key={i} className="flex items-center justify-between mt-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span className="text-white/60 font-medium text-xs">{ev.person ? `${ev.person} – ` : ''}{ev.label}</span>
                          <span className="font-black text-xs px-2 py-0.5 rounded-full text-white" style={{ background: typeInfo.badge, fontSize: 9 }}>
                            {ev.days_until === 0 ? 'TODAY!' : `${ev.days_until}d`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInPanel {
          from { opacity:0; transform: translateY(-50%) translateX(-12px); }
          to   { opacity:1; transform: translateY(-50%) translateX(0); }
        }
        * { -webkit-font-smoothing: antialiased; }
      `}</style>
    </>
  )
}