import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #020d07 0%, #041a10 40%, #071f13 70%, #030e08 100%)',
      }}
    >
      {/* Ambient Orbs */}
      <div
        style={{
          position: 'fixed',
          top: '-10%',
          left: '-5%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'fixed',
          bottom: '-10%',
          right: '-5%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Navbar />
      <Sidebar />

      <main className="relative z-10 flex-1 pl-20 pr-6 py-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      <style>{`
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