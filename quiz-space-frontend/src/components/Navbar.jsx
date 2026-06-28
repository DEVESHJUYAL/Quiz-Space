import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar({ actions = [] }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const home = user?.role === "TEACHER" ? "/dashboard" : "/student"
  const links = user?.role === "TEACHER"
    ? [{ label: "Dashboard", path: "/dashboard" }]
    : [{ label: "Dashboard", path: "/student" }, { label: "My History", path: "/history" }]
  const active = (p) => location.pathname === p

  return (
    <nav className="navbar sticky top-0 z-50 px-6 py-3.5">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to={home} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8L12 4L20 8L12 12L4 8Z" fill="white" fillOpacity="0.9"/>
                <path d="M4 8V14L12 18L20 14V8" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
                <line x1="20" y1="8" x2="20" y2="14" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/>
                <circle cx="20" cy="15.5" r="1.5" fill="white" opacity="0.8"/>
              </svg>
            </div>
          <span className="font-display text-lg font-semibold text-stone-900 tracking-tight">QuizSpace</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.path} to={l.path}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${
                active(l.path)
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
              }`}>
              {l.label}
            </Link>
          ))}
          {actions.map(a => (
            <button key={a.label} onClick={a.onClick}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ml-1 ${
                a.primary ? "btn-primary rounded-xl" : "btn-ghost rounded-xl"
              }`}>
              {a.label}
            </button>
          ))}
        </div>

        {/* Avatar + signout */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="hidden lg:block leading-tight">
              <p className="text-sm font-medium text-stone-800">{user?.name}</p>
              <p className="text-xs text-stone-400">{user?.role === "TEACHER" ? "Teacher" : "Student"}</p>
            </div>
            <button onClick={logout} className="ml-1 text-xs text-stone-400 hover:text-rose-500 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50">
              Sign out
            </button>
          </div>
        </div>

        {/* Hamburger */}
        <button className="md:hidden p-2 rounded-xl hover:bg-stone-100 transition-colors" onClick={() => setOpen(!open)}>
          <div className="w-5 space-y-1.5">
            <span className={`block h-0.5 bg-stone-600 transition-all origin-center ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 bg-stone-600 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-stone-600 transition-all origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-cream-50 border-b border-stone-200 px-6 py-4 space-y-1 shadow-lifted">
          {links.map(l => (
            <Link key={l.path} to={l.path} onClick={() => setOpen(false)}
              className={`block text-sm font-medium px-4 py-2.5 rounded-xl ${
                active(l.path) ? "bg-indigo-50 text-indigo-600" : "text-stone-600 hover:bg-stone-100"
              }`}>
              {l.label}
            </Link>
          ))}
          {actions.map(a => (
            <button key={a.label} onClick={() => { setOpen(false); a.onClick() }}
              className="w-full text-left text-sm font-medium px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100">
              {a.label}
            </button>
          ))}
          <div className="pt-3 mt-3 border-t border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <p className="text-sm font-medium text-stone-700">{user?.name}</p>
            </div>
            <button onClick={logout} className="text-xs text-stone-400 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-lg border border-stone-200">
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}