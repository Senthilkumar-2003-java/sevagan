import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-semibold tracking-wide transition-all duration-300 py-1 ${
      isActive ? 'text-emerald-300' : 'text-white/40 hover:text-white/70'
    }`

  return (
    <header className="sticky top-0 z-50" style={{ background: 'rgba(2,13,7,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
      <nav className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center relative" style={{ background: 'rgba(253,203,82,0.15)', border: '1px solid rgba(253,203,82,0.3)' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#fdcb52', fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
          <span className="text-lg font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Sevagan Trust
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { to: '/donors/create', label: 'Create Donors',  icon: 'person_add' },
            { to: '/donors/list',   label: 'Donors List',    icon: 'group'      },
            { to: '/receipt',       label: 'Bill Receipt',   icon: 'receipt_long' },
          ].map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              {({ isActive }) => (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-[17px] left-0 right-0 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #34d399, transparent)' }} />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.25)'; e.currentTarget.style.color='#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.12)'; e.currentTarget.style.color='#fca5a5' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
          Logout
        </button>
      </nav>
    </header>
  )
}