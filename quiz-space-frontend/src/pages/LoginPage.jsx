import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
      <span>⚠</span> {msg}
    </p>
  )
}

function validate(email, password) {
  const errors = {}
  if (!email.trim())                        errors.email = "Email is required"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address"
  if (!password)                            errors.password = "Password is required"
  return errors
}

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors]     = useState({})
  const [touched, setTouched]   = useState({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading]   = useState(false)
  const [mounted, setMounted]   = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const touch = (field) => setTouched(t => ({ ...t, [field]: true }))

  // Live validate once a field has been touched
  useEffect(() => {
    if (Object.keys(touched).length > 0) setErrors(validate(email, password))
  }, [email, password, touched])

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Mark all fields touched to show errors on submit
    setTouched({ email: true, password: true })
    const errs = validate(email, password)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true); setServerError("")
    try { await login(email, password) }
    catch (err) { setServerError(err.response?.data?.message || "Invalid email or password. Please try again.") }
    finally { setLoading(false) }
  }

  const fieldClass = (field) =>
    `input-field w-full rounded-xl px-4 py-3 text-sm ${
      touched[field] && errors[field] ? "border-rose-300 bg-rose-50 focus:border-rose-400" : ""
    }`

  return (
    <div className="min-h-screen grid-pattern flex items-center justify-center relative overflow-hidden px-4">
      <div className="orb w-96 h-96 bg-indigo-300 opacity-30 top-[-10%] right-[-5%]" style={{animationDuration:'10s'}} />
      <div className="orb w-72 h-72 bg-violet-200 opacity-25 bottom-[-8%] left-[-5%]" style={{animationDuration:'13s',animationDelay:'-4s'}} />
      <div className="absolute top-24 right-[12%] w-14 h-14 border-2 border-indigo-200 rounded-2xl rotate-12 animate-spin" style={{animationDuration:'20s'}} />
      <div className="absolute bottom-28 left-[10%] w-9 h-9 border-2 border-amber-200 rounded-xl animate-bounce" style={{animationDuration:'3.5s'}} />
      <div className="absolute top-[42%] left-[8%] w-4 h-4 bg-indigo-300 opacity-60 rounded-full animate-ping" style={{animationDuration:'3s'}} />

      <div className={`w-full max-w-md transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        {/* Top nav */}
        <div className="flex justify-between items-center mb-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8L12 4L20 8L12 12L4 8Z" fill="white" fillOpacity="0.9"/><path d="M4 8V14L12 18L20 14V8" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none"/><line x1="20" y1="8" x2="20" y2="14" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/><circle cx="20" cy="15.5" r="1.5" fill="white" opacity="0.8"/></svg>
            </div>
            <span className="font-display text-base font-semibold text-stone-900">QuizSpace</span>
          </Link>
          <Link to="/" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">← Home</Link>
        </div>

        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-bold text-stone-900 mb-2">Welcome back</h2>
          <p className="text-stone-500 text-sm">Sign in to your account to continue</p>
        </div>

        <div className="card p-8">
          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2">
              <span>⚠</span> {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email address</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => touch("email")}
                placeholder="you@example.com"
                className={fieldClass("email")}
                autoComplete="email"
              />
              <FieldError msg={touched.email && errors.email} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => touch("password")}
                placeholder="••••••••"
                className={fieldClass("password")}
                autoComplete="current-password"
              />
              <FieldError msg={touched.password && errors.password} />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full rounded-xl py-3.5 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg> Signing in...
                </span>
              ) : "Sign in →"}
            </button>
          </form>

          <div className="mt-6 pt-5 divider text-center">
            <p className="text-sm text-stone-500">
              New here?{" "}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">Create an account</Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8">
          {["Anti-cheat", "Real-time sync", "Instant results"].map(t => (
            <div key={t} className="flex items-center gap-1.5 text-xs text-stone-400">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />{t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}