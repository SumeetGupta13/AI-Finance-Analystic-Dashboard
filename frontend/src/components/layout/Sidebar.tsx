import React from 'react'
import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="w-64 p-4 bg-gradient-to-b from-[#0A0A0A] to-[#111111] glass-card h-full">
      <div className="text-xl font-semibold">FINORA</div>
      <nav className="mt-6 flex flex-col gap-3">
        <Link to="/" className="text-slate-300 hover:text-white">Dashboard</Link>
        <Link to="/markets" className="text-slate-300 hover:text-white">Markets</Link>
        <Link to="/portfolio" className="text-slate-300 hover:text-white">Portfolio</Link>
      </nav>
    </aside>
  )
}
