import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'

const INITIAL = { first_name: '', last_name: '', address: '', id_number: '', amount: '' }

const inputCls = `w-full px-4 py-3.5 rounded-2xl text-sm text-white transition-all duration-300 focus:outline-none`
const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }

export default function Receipt() {
  const [form,    setForm]    = useState(INITIAL)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const receiptNumber = () => {
    const now = new Date()
    return `SVG-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(1000 + Math.random() * 9000)}`
  }

  const generatePDF = (e) => {
    e.preventDefault(); setLoading(true)
    const doc     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const rNo     = receiptNumber()
    const dateStr = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })
    const amount  = parseFloat(form.amount).toLocaleString('en-IN')

    doc.setFillColor(15, 82, 56); doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255,255,255); doc.setFontSize(24); doc.setFont('helvetica','bold')
    doc.text('Sevagan Trust', 105, 16, { align:'center' })
    doc.setFontSize(10); doc.setFont('helvetica','normal')
    doc.text('Compassion First Organization  |  Salem, Tamil Nadu', 105, 23, { align:'center' })
    doc.setFontSize(9); doc.text('Email: sevagan.senthil@gmail.com', 105, 30, { align:'center' })

    doc.setFillColor(253, 203, 82); doc.rect(0, 40, 210, 12, 'F')
    doc.setTextColor(15,82,56); doc.setFontSize(13); doc.setFont('helvetica','bold')
    doc.text('DONATION RECEIPT', 105, 49, { align:'center' })

    doc.setTextColor(60,60,60); doc.setFontSize(9); doc.setFont('helvetica','normal')
    doc.text(`Receipt No: ${rNo}`, 15, 62)
    doc.text(`Date: ${dateStr}`, 195, 62, { align:'right' })
    doc.setDrawColor(200,200,200); doc.line(15, 66, 195, 66)

    doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.setTextColor(15,82,56)
    doc.text('Donor Information', 15, 76)

    const rows = [['Donor Name',`${form.first_name} ${form.last_name}`],['Address',form.address],['PAN / Aadhar',form.id_number]]
    doc.setFontSize(10); let y = 84
    rows.forEach(([label, value]) => {
      doc.setFont('helvetica','bold'); doc.setTextColor(80,80,80); doc.text(`${label}:`, 15, y)
      doc.setFont('helvetica','normal'); doc.setTextColor(30,30,30)
      const lines = doc.splitTextToSize(value, 120); doc.text(lines, 65, y)
      y += lines.length * 6 + 4
    })

    y += 6
    doc.setFillColor(240,255,248); doc.setDrawColor(15,82,56); doc.roundedRect(15, y, 180, 28, 3, 3, 'FD')
    doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.setTextColor(15,82,56)
    doc.text('Donation Amount', 105, y+9, { align:'center' })
    doc.setFontSize(20); doc.text(`₹ ${amount}`, 105, y+21, { align:'center' })

    y += 38; doc.setFontSize(9); doc.setFont('helvetica','italic'); doc.setTextColor(100,100,100)
    doc.text('This donation is made voluntarily with compassion for the elderly residents of Sevagan Trust.', 105, y, { align:'center' })
    doc.text('This receipt is computer-generated and does not require a physical signature.', 105, y+5, { align:'center' })

    y += 20; doc.setDrawColor(150,150,150)
    doc.line(15, y+18, 75, y+18); doc.line(135, y+18, 195, y+18)
    doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80)
    doc.text("Donor's Signature", 45, y+23, { align:'center' })
    doc.text('Authorized Signatory', 165, y+23, { align:'center' })

    doc.setFillColor(15,82,56); doc.rect(0, 272, 210, 25, 'F')
    doc.setTextColor(255,255,255); doc.setFontSize(9); doc.setFont('helvetica','normal')
    doc.text('"Here, we don\'t just add years to life, we add life to years."', 105, 281, { align:'center' })
    doc.text('Thank you for your generous donation!', 105, 288, { align:'center' })

    doc.save(`Sevagan_Trust_Receipt_${rNo}.pdf`); setLoading(false)
  }

  const focusStyle = (e) => { e.target.style.border = '1px solid rgba(52,211,153,0.5)' }
  const blurStyle  = (e) => { e.target.style.border = '1px solid rgba(255,255,255,0.1)' }

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div
        className="mb-8"
        style={{ opacity: mounted?1:0, transform: mounted?'translateY(0)':'translateY(-20px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(52,211,153,0.3)' }}>
            <span className="material-symbols-outlined text-emerald-300" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
          </div>
          <h1 className="font-black text-3xl tracking-tight" style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bill Receipt</h1>
        </div>
        <p className="text-white/35 text-sm pl-1">Generate a donation receipt PDF for the donor</p>
      </div>

      {/* Form Card */}
      <div
        className="rounded-3xl p-8"
        style={{ opacity: mounted?1:0, transform: mounted?'translateY(0)':'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)' }}
      >
        <form onSubmit={generatePDF} className="space-y-5">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-emerald-300/70 mb-2">First Name <span className="text-rose-400">✦</span></label>
              <input type="text" value={form.first_name} onChange={set('first_name')} required placeholder="Ramesh"
                className={inputCls} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-emerald-300/70 mb-2">Last Name <span className="text-rose-400">✦</span></label>
              <input type="text" value={form.last_name} onChange={set('last_name')} required placeholder="Kumar"
                className={inputCls} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-emerald-300/70 mb-2">Address <span className="text-rose-400">✦</span></label>
            <textarea value={form.address} onChange={set('address')} required rows={3} placeholder="Full address…"
              className={inputCls} style={{ ...inputStyle, resize: 'none' }} onFocus={focusStyle} onBlur={blurStyle} />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-emerald-300/70 mb-2">PAN / Aadhar Number <span className="text-rose-400">✦</span></label>
            <input type="text" value={form.id_number} onChange={set('id_number')} required placeholder="ABCDE1234F or 1234 5678 9012"
              className={inputCls} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-emerald-300/70 mb-2">Donation Amount (₹) <span className="text-rose-400">✦</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-400/60">₹</span>
              <input type="number" value={form.amount} onChange={set('amount')} required min="1" placeholder="5000"
                className={`${inputCls} pl-9`} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>

          {/* Preview */}
          {form.first_name && form.amount && (
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(52,211,153,0.2)', animation: 'fadeIn 0.4s ease' }}>
              <p className="text-xs text-emerald-400/70 font-bold uppercase tracking-widest mb-2">Receipt Preview</p>
              <p className="font-bold text-white">{form.first_name} {form.last_name}</p>
              <p className="text-2xl font-black mt-1" style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ₹ {parseFloat(form.amount || 0).toLocaleString('en-IN')}
              </p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-base relative overflow-hidden group transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)', boxShadow: '0 8px 32px rgba(5,150,105,0.35)', color: 'white', letterSpacing: '0.05em' }}>
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
            <span className="flex items-center justify-center gap-3">
              {loading ? (
                <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Generating…</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span> GENERATE & DOWNLOAD PDF</>
              )}
            </span>
          </button>
        </form>
      </div>

      <style>{`
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; filter: invert(1); }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        * { -webkit-font-smoothing: antialiased; }
        ::selection { background: rgba(52,211,153,0.3); color: white; }
      `}</style>
    </div>
  )
}