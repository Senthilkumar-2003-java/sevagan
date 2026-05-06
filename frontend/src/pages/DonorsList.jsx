import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import EditDonorModal from '../components/EditDonorModal'

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

function fmt(val) {
  return val || <span className="text-white/20 italic">—</span>
}

function fmtDate(d) {
  if (!d) return <span className="text-white/20 italic">—</span>
  const [y, m, day] = d.split('-')
  return `${day}-${m}-${y}`
}

const headers = [
  'ID','Name','Phone','Alt Phone','Gender','Occupation','Address',
  'Type','Date','Food',
  'Mother','Mother B\'day',
  'Father','Father B\'day',
  'Wife','Wife B\'day','Wife Anniv.',
  'Child','Child B\'day',
  'Parents Anniv.',
  'Actions'
]

export default function DonorsList() {
  const [donors,  setDonors]  = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [deleting,setDeleting]= useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  const fetchDonors = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/donors/', { params: search ? { search } : {} })
      setDonors(res.data)
    } catch {
      setDonors([])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchDonors() }, [fetchDonors])

  const handleDelete = async () => {
    try {
      await api.delete(`/donors/${deleting}/`)
      setDeleting(null)
      fetchDonors()
    } catch {
      alert('Delete failed.')
    }
  }

  return (
    <div
      className="relative min-h-screen px-4 py-10"
      style={{ background: 'linear-gradient(135deg, #020d07 0%, #041a10 40%, #071f13 70%, #030e08 100%)' }}
    >
      {/* Ambient orbs */}
      <div style={{
        position:'fixed',
        top:'-10%',
        left:'-5%',
        width:500,
        height:500,
        borderRadius:'50%',
        background:'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
        pointerEvents:'none',
        zIndex:0
      }} />

      <div style={{
        position:'fixed',
        bottom:'-10%',
        right:'-5%',
        width:600,
        height:600,
        borderRadius:'50%',
        background:'radial-gradient(circle, rgba(5,150,105,0.05) 0%, transparent 70%)',
        pointerEvents:'none',
        zIndex:0
      }} />

      <div
        className="relative z-10 max-w-full"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)'
        }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-emerald-300"
                  style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
                >
                  group
                </span>
              </div>

              <h1
                className="font-black text-3xl tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #6ee7b7, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Donors List
              </h1>
            </div>

            <p className="text-white/30 text-sm ml-13 pl-1">
              {donors.length} donor{donors.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60"
              style={{ fontSize: 18 }}
            >
              search
            </span>

            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, Name or Phone…"
              className="w-full pl-10 pr-10 py-3 rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)'
              }}
            />

            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  close
                </span>
              </button>
            )}
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="text-center py-24 text-white/30">
            <div className="inline-block w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin mb-4" />
            <p className="text-sm tracking-widest uppercase">Loading donors…</p>
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <span className="material-symbols-outlined block mb-4" style={{ fontSize: 56 }}>
              person_search
            </span>
            <p className="text-lg font-bold text-white/40">No donors found</p>
            <p className="text-sm mt-1">
              {search ? 'Try a different search term.' : 'Create your first donor!'}
            </p>
          </div>
        ) : (
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr
                    style={{
                      background: 'rgba(16,185,129,0.15)',
                      borderBottom: '1px solid rgba(52,211,153,0.15)'
                    }}
                  >
                    {headers.map(h => (
                      <th
                        key={h}
                        className="px-4 py-4 text-left font-bold whitespace-nowrap text-xs uppercase tracking-widest text-emerald-300/70"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {donors.map((d, idx) => (
                    <tr
                      key={d.id}
                      className="transition-all duration-200 group"
                      style={{
                        background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}
                    >
                      <td className="px-4 py-3 font-black text-emerald-400">#{d.id}</td>

                      <td className="px-4 py-3 font-bold whitespace-nowrap text-white">
                        {d.first_name} {d.last_name}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmt(d.phone)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmt(d.alt_phone)}</td>
                      <td className="px-4 py-3 capitalize text-white/70">{fmt(d.gender)}</td>
                      <td className="px-4 py-3 text-white/70">{fmt(d.occupation)}</td>

                      <td
                        className="px-4 py-3 max-w-32 truncate text-white/70"
                        title={d.address}
                      >
                        {fmt(d.address)}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${TYPE_BADGE[d.donor_type] || 'bg-white/10 text-white/50'}`}>
                          {d.donor_type}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-white/70">
                        {fmtDate(d.type_date)}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${FOOD_BADGE[d.food] || 'bg-white/10 text-white/50'}`}>
                          {d.food}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmt(d.mother_name)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmtDate(d.mother_birthday)}</td>

                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmt(d.father_name)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmtDate(d.father_birthday)}</td>

                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmt(d.wife_name)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmtDate(d.wife_birthday)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmtDate(d.wife_anniversary)}</td>

                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmt(d.child_name)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">{fmtDate(d.child_birthday)}</td>

                      <td className="px-4 py-3 whitespace-nowrap text-white/70">
                        {fmtDate(d.parents_anniversary)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditing(d)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105"
                            style={{
                              background: 'rgba(59,130,246,0.15)',
                              color: '#93c5fd',
                              border: '1px solid rgba(59,130,246,0.25)'
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                              edit
                            </span>
                            Edit
                          </button>

                          <button
                            onClick={() => setDeleting(d.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105"
                            style={{
                              background: 'rgba(239,68,68,0.15)',
                              color: '#fca5a5',
                              border: '1px solid rgba(239,68,68,0.25)'
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                              delete
                            </span>
                            Del
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

      {/* Edit Modal */}
      {editing && (
        <EditDonorModal
          donor={editing}
          onClose={() => setEditing(null)}
          onSaved={fetchDonors}
        />
      )}

      {/* Delete Confirm */}
      {deleting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div
            className="w-full max-w-sm text-center p-8 rounded-3xl"
            style={{
              background: 'rgba(15,25,18,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.6)'
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)'
              }}
            >
              <span
                className="material-symbols-outlined text-red-400"
                style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
            </div>

            <h3 className="font-black text-xl text-white mb-2">
              Delete Donor?
            </h3>

            <p className="text-white/40 text-sm mb-7">
              This action cannot be undone. Donor #{deleting} will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 py-3 rounded-2xl font-bold text-white/60 transition-all hover:text-white"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-2xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                  boxShadow: '0 8px 24px rgba(220,38,38,0.3)'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        input::placeholder {
          color: rgba(255,255,255,0.3);
        }

        input:focus {
          box-shadow: 0 0 0 2px rgba(52,211,153,0.2);
        }

        * {
          -webkit-font-smoothing: antialiased;
        }

        ::selection {
          background: rgba(52,211,153,0.3);
          color: white;
        }
      `}</style>
    </div>
  )
}