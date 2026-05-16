import { useState, useEffect } from 'react'
import api from '../api/axios'

// ── Helpers ────────────────────────────────────────────────────────
function fmt(val)   { return val || <span className="text-white/25 italic text-xs">—</span> }
function fmtDate(d) {
  if (!d) return <span className="text-white/25 italic text-xs">—</span>
  const [y, m, day] = d.split('-')
  return `${day}-${m}-${y}`
}

const EVENT_CONFIG = {
  birthday:    { icon: 'cake',         label: 'Upcoming Birthdays',     color: 'pink',   badge: 'bg-pink-500',   ring: 'rgba(236,72,153,0.4)',  text: 'text-pink-300',   bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.3)'  },
  anniversary: { icon: 'favorite',     label: 'Upcoming Anniversaries', color: 'rose',   badge: 'bg-rose-500',   ring: 'rgba(244,63,94,0.4)',   text: 'text-rose-300',   bg: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.3)'   },
  memorial:    { icon: 'local_florist',label: 'Upcoming Memorials',     color: 'purple', badge: 'bg-purple-500', ring: 'rgba(168,85,247,0.4)',  text: 'text-purple-300', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)'  },
}

// ── Detail Row ─────────────────────────────────────────────────────
function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="material-symbols-outlined text-emerald-400/60 flex-shrink-0 mt-0.5" style={{ fontSize: 15 }}>{icon}</span>
      <div className="min-w-0">
        <p className="text-white/35 text-[10px] font-bold tracking-widest uppercase mb-0.5">{label}</p>
        <p className="text-white/80 text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

// ── Family Row ─────────────────────────────────────────────────────
function FamilyRow({ emoji, label, name, date }) {
  if (!name && !date) return null
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <span style={{ fontSize: 16 }}>{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white/50 text-[10px] font-bold tracking-widest uppercase">{label}</p>
        <p className="text-white/80 text-sm font-semibold">{name || '—'}</p>
      </div>
      {date && <p className="text-emerald-300/70 text-xs font-mono flex-shrink-0">{fmtDate(date)}</p>}
    </div>
  )
}

// ── Confirm Form Popup ─────────────────────────────────────────────
function ConfirmFormPopup({ donor, eventType, onClose, onSuccess }) {
  const [occasionType, setOccasionType] = useState(eventType || '')
  const [occasionDate, setOccasionDate] = useState('')
  const [food,         setFood]         = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  const dateLabel =
    occasionType === 'birthday'    ? 'Birthday Date'    :
    occasionType === 'anniversary' ? 'Anniversary Date' :
    occasionType === 'memorial'    ? 'Memorial Date'    : 'Date'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/confirm-donor/', {
        donor_id:      donor.id,
        event_type:    eventType,
        occasion_type: occasionType,
        occasion_date: occasionDate,
        food,
      })
      onSuccess()
    } catch {
      setError('Failed to confirm. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const iSty = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
  }
  const cls = "w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none transition-all"

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6"
        style={{
          background: 'rgba(8,22,14,0.98)',
          border: '1px solid rgba(52,211,153,0.3)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.7)',
          animation: 'popIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <span className="material-symbols-outlined text-emerald-300"
                style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div>
              <h3 className="font-black text-base text-white">Confirm Donor</h3>
              <p className="text-white/35 text-xs">{donor.first_name} {donor.last_name}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-red-300 text-xs"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Occasion Type */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-emerald-300/70 mb-2">
              Occasion Type
            </label>
            <select value={occasionType} onChange={e => setOccasionType(e.target.value)}
              required className={cls} style={iSty}>
              <option value="" style={{ background: '#071a10' }}>Select Type</option>
              <option value="birthday"    style={{ background: '#071a10' }}>🎂 Birthday</option>
              <option value="anniversary" style={{ background: '#071a10' }}>💍 Anniversary</option>
              <option value="memorial"    style={{ background: '#071a10' }}>🌸 Memorial</option>
            </select>
          </div>

          {/* Date — appears after type is chosen */}
          {occasionType && (
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-emerald-300/70 mb-2">
                {dateLabel}
              </label>
              <input type="date" value={occasionDate}
                onChange={e => setOccasionDate(e.target.value)}
                required className={cls} style={iSty} />
            </div>
          )}

          {/* Food */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-emerald-300/70 mb-2">
              Food Preference
            </label>
            <select value={food} onChange={e => setFood(e.target.value)}
              required className={cls} style={iSty}>
              <option value="" style={{ background: '#071a10' }}>Select Meal</option>
              <option value="morning"   style={{ background: '#071a10' }}>🌅 Morning</option>
              <option value="afternoon" style={{ background: '#071a10' }}>☀️ Afternoon</option>
              <option value="night"     style={{ background: '#071a10' }}>🌙 Night</option>
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-2xl font-bold text-white text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 8px 24px rgba(5,150,105,0.3)', letterSpacing: '0.04em' }}>
            {loading ? 'Confirming…' : '✓ CONFIRM DONOR'}
          </button>
        </form>

        <style>{`
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(0.7) sepia(1) saturate(2) hue-rotate(100deg);
            opacity: 0.6; cursor: pointer;
          }
          select option { background: #071a10; color: #d1fae5; }
        `}</style>
      </div>
    </div>
  )
}

// ── Donor Detail Modal (with 3 action buttons) ─────────────────────
function DonorDetailModal({ donorId, eventType, onClose, onAction }) {
  const [donor,         setDonor]         = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [rejectDialog,  setRejectDialog]  = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    api.get(`/donors/${donorId}/`)
      .then(r  => setDonor(r.data))
      .catch(() => setDonor(null))
      .finally(() => setLoading(false))
  }, [donorId])

  const handleNextTime = async () => {
    setActionLoading(true)
    try {
      await api.post('/next-time-donor/', { donor_id: donorId, event_type: eventType })
      onAction()
    } catch { alert('Failed. Try again.') }
    finally  { setActionLoading(false) }
  }

  const handleReject = async () => {
    setActionLoading(true)
    try {
      await api.delete(`/reject-donor/${donorId}/`)
      onAction()
    } catch { alert('Failed. Try again.') }
    finally  { setActionLoading(false) }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl"
          style={{
            background: 'rgba(8,22,14,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
            animation: 'popIn 0.35s cubic-bezier(0.16,1,0.3,1)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
            </div>
          ) : !donor ? (
            <div className="text-center py-16 text-white/30">
              <span className="material-symbols-outlined block mb-2" style={{ fontSize: 40 }}>error</span>
              <p>Could not load donor details.</p>
            </div>
          ) : (
            <>
              {/* ── Header ─────────────────────────────────────── */}
              <div className="p-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between gap-3">

                  {/* Left: avatar + name */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
                      <span className="material-symbols-outlined text-emerald-300"
                        style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>person</span>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-0.5">
                        Donor #{donor.id}
                      </p>
                      <h2 className="text-xl font-black text-white">
                        {donor.first_name} {donor.last_name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest capitalize
                          ${donor.donor_type === 'birthday'    ? 'bg-pink-500/20 text-pink-300'   :
                            donor.donor_type === 'anniversary' ? 'bg-rose-500/20 text-rose-300'   :
                            'bg-purple-500/20 text-purple-300'}`}>
                          {donor.donor_type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest capitalize
                          ${donor.food === 'morning'   ? 'bg-amber-500/20 text-amber-300'  :
                            donor.food === 'afternoon' ? 'bg-orange-500/20 text-orange-300':
                            'bg-indigo-500/20 text-indigo-300'}`}>
                          {donor.food}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: close + 3 action buttons */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button onClick={onClose}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white/60 transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                    </button>

                    <div className="flex gap-1.5 mt-1">
                      {/* Confirm */}
                      <button
                        onClick={() => setShowConfirm(true)}
                        disabled={actionLoading}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.3)' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check_circle</span>
                        Confirm
                      </button>

                      {/* Next Time */}
                      <button
                        onClick={handleNextTime}
                        disabled={actionLoading}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        style={{ background: 'rgba(251,191,36,0.12)', color: '#fde68a', border: '1px solid rgba(251,191,36,0.25)' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
                        Next Time
                      </button>

                      {/* Reject */}
                      <button
                        onClick={() => setRejectDialog(true)}
                        disabled={actionLoading}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>cancel</span>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Body ───────────────────────────────────────── */}
              <div className="p-6 space-y-5">

                {/* Personal Info */}
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-emerald-400/70 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>badge</span>
                    Personal Information
                  </p>
                  <div className="rounded-2xl overflow-hidden px-1"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <DetailRow icon="phone"       label="Phone"      value={fmt(donor.phone)} />
                    <DetailRow icon="phone"       label="Alt Phone"  value={fmt(donor.alt_phone)} />
                    <DetailRow icon="person"      label="Gender"     value={<span className="capitalize">{fmt(donor.gender)}</span>} />
                    <DetailRow icon="work"        label="Occupation" value={fmt(donor.occupation)} />
                    <DetailRow icon="location_on" label="Address"    value={fmt(donor.address)} />
                  </div>
                </div>

                {/* Donation Info */}
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-emerald-400/70 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event</span>
                    Donation Details
                  </p>
                  <div className="rounded-2xl overflow-hidden px-1"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <DetailRow icon="category"        label="Occasion Type" value={<span className="capitalize">{fmt(donor.donor_type)}</span>} />
                    <DetailRow icon="calendar_month"  label="Occasion Date" value={fmtDate(donor.type_date)} />
                  </div>
                </div>

                {/* Family */}
                {(donor.mother_name || donor.father_name || donor.wife_name || donor.child_name || donor.parents_anniversary) && (
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-emerald-400/70 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>family_restroom</span>
                      Family Details
                    </p>
                    <div className="space-y-2">
                      <FamilyRow emoji="🌸" label="Mother" name={donor.mother_name} date={donor.mother_birthday} />
                      <FamilyRow emoji="🌊" label="Father" name={donor.father_name} date={donor.father_birthday} />
                      {donor.wife_name && (
                        <div className="px-3 py-2 rounded-xl space-y-1"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <div className="flex items-center gap-3">
                            <span style={{ fontSize: 16 }}>💕</span>
                            <div className="flex-1">
                              <p className="text-white/50 text-[10px] font-bold tracking-widest uppercase">Wife</p>
                              <p className="text-white/80 text-sm font-semibold">{donor.wife_name}</p>
                            </div>
                          </div>
                          <div className="flex gap-4 ml-8 mt-1">
                            {donor.wife_birthday    && <p className="text-xs text-white/45">🎂 {fmtDate(donor.wife_birthday)}</p>}
                            {donor.wife_anniversary && <p className="text-xs text-white/45">💍 {fmtDate(donor.wife_anniversary)}</p>}
                          </div>
                        </div>
                      )}
                      <FamilyRow emoji="⭐" label="Child" name={donor.child_name} date={donor.child_birthday} />
                      {donor.parents_anniversary && (
                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <span style={{ fontSize: 16 }}>💜</span>
                          <div className="flex-1">
                            <p className="text-white/50 text-[10px] font-bold tracking-widest uppercase">Parents Anniversary</p>
                            <p className="text-emerald-300/70 text-sm font-mono">{fmtDate(donor.parents_anniversary)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirm Form */}
      {showConfirm && donor && (
        <ConfirmFormPopup
          donor={donor}
          eventType={eventType}
          onClose={() => setShowConfirm(false)}
          onSuccess={() => { setShowConfirm(false); onAction() }}
        />
      )}

      {/* Reject Confirmation Dialog */}
      {rejectDialog && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(14px)' }}>
          <div className="w-full max-w-sm p-7 rounded-3xl text-center"
            style={{
              background: 'rgba(8,22,14,0.98)',
              border: '1px solid rgba(239,68,68,0.3)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.7)',
              animation: 'popIn 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <span className="material-symbols-outlined text-red-400"
                style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <h3 className="font-black text-lg text-white mb-2">Reject Donor?</h3>
            <p className="text-white/40 text-sm mb-6">
              <span className="text-white/70 font-semibold">{donor?.first_name} {donor?.last_name}</span> will be permanently deleted from the database.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRejectDialog(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-white/50 transition-all hover:text-white"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', boxShadow: '0 8px 24px rgba(220,38,38,0.3)' }}>
                {actionLoading ? 'Deleting…' : 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Upcoming Popup ─────────────────────────────────────────────────
function UpcomingPopup({ type, onClose, onDonorClick }) {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const cfg = EVENT_CONFIG[type]

  useEffect(() => {
    api.get(`/upcoming/${type}/`)
      .then(r  => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [type])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[75vh] flex flex-col rounded-3xl"
        style={{
          background: 'rgba(8,22,14,0.97)',
          border: `1px solid ${cfg.border}`,
          boxShadow: `0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px ${cfg.border}`,
          animation: 'popIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 flex-shrink-0"
          style={{ borderBottom: `1px solid ${cfg.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <span className="material-symbols-outlined"
                style={{ fontSize: 18, color: cfg.border, fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
            </div>
            <h3 className={`font-black text-base ${cfg.text}`}>{cfg.label}</h3>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <span className="material-symbols-outlined block mb-2" style={{ fontSize: 40 }}>{cfg.icon}</span>
              <p className="text-sm">No upcoming {type}s in the next 5 days</p>
            </div>
          ) : (
            data.map(donor => (
              <div
                key={donor.id}
                className="p-4 rounded-2xl transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {/* Donor Name */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-white/40"
                    style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>person</span>
                  <p className="font-black text-white text-sm">{donor.name}</p>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-white/25" style={{ fontSize: 13 }}>phone</span>
                  <p className="text-white/45 text-xs">
                    {donor.phone}{donor.alt_phone ? ` / ${donor.alt_phone}` : ''}
                  </p>
                </div>

                {/* Events */}
                <div className="space-y-1.5 mb-4">
                  {donor.events.map((ev, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <p className="text-white/55 text-xs">
                        {ev.person && <span className="text-white/70 font-semibold">{ev.person} — </span>}
                        {ev.label}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white ${cfg.badge}`}>
                        {ev.days_until === 0 ? 'TODAY' : `${ev.days_until}d`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ── 3 Action Buttons ─────────────────────────── */}
                <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  {/* View Details (existing behaviour) */}
                  <button
                    onClick={() => onDonorClick(donor.id, type)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>open_in_full</span>
                    Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────
export default function Sidebar() {
  const [openPopup,      setOpenPopup]      = useState(null)
  const [detailId,       setDetailId]       = useState(null)
  const [detailEventType,setDetailEventType]= useState(null)
  const [counts,         setCounts]         = useState({ birthday: 0, anniversary: 0, memorial: 0 })

  const fetchCounts = () => {
    ['birthday', 'anniversary', 'memorial'].forEach(t => {
      api.get(`/upcoming/${t}/`)
        .then(r  => setCounts(prev => ({ ...prev, [t]: r.data.length })))
        .catch(() => {})
    })
  }

  useEffect(() => { fetchCounts() }, [])

  // Called when donor card is clicked in popup → open detail modal
  const handleDonorClick = (id, eventType) => {
    setOpenPopup(null)
    setDetailId(id)
    setDetailEventType(eventType)
  }

  // Called after any action (confirm / next-time / reject)
  const handleAction = () => {
    setDetailId(null)
    setDetailEventType(null)
    setOpenPopup(null)
    fetchCounts()          // refresh badge counts
  }

  return (
    <>
      {/* Sidebar strip */}
      <aside
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 px-2 py-4 rounded-r-2xl"
        style={{
          background: 'rgba(2,13,7,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderLeft: 'none',
        }}
      >
        {Object.entries(EVENT_CONFIG).map(([type, cfg]) => (
          <button
            key={type}
            onClick={() => setOpenPopup(openPopup === type ? null : type)}
            title={cfg.label}
            className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: openPopup === type ? cfg.bg : 'rgba(255,255,255,0.05)',
              border: openPopup === type ? `1px solid ${cfg.border}` : '1px solid rgba(255,255,255,0.08)',
              boxShadow: openPopup === type ? `0 0 16px ${cfg.ring}` : 'none',
            }}
          >
            <span className="material-symbols-outlined"
              style={{ fontSize: 20, color: openPopup === type ? cfg.border : 'rgba(255,255,255,0.4)', fontVariationSettings: "'FILL' 1" }}>
              {cfg.icon}
            </span>
            {counts[type] > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center ${cfg.badge}`}
                style={{ boxShadow: `0 0 8px ${cfg.ring}` }}
              >
                {counts[type]}
              </span>
            )}
          </button>
        ))}
      </aside>

      {/* Upcoming Popup */}
      {openPopup && (
        <UpcomingPopup
          type={openPopup}
          onClose={() => setOpenPopup(null)}
          onDonorClick={handleDonorClick}
        />
      )}

      {/* Donor Detail Modal */}
      {detailId && (
        <DonorDetailModal
          donorId={detailId}
          eventType={detailEventType}
          onClose={() => { setDetailId(null); setDetailEventType(null) }}
          onAction={handleAction}
        />
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </>
  )
}