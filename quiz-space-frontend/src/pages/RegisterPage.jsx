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

function PasswordStrength({ password }) {
  if (!password) return null
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const barColor = score <= 1 ? "bg-rose-400" : score === 2 ? "bg-amber-400" : score === 3 ? "bg-yellow-400" : "bg-emerald-400"
  const label    = score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong"
  const labelColor = score <= 1 ? "text-rose-500" : score === 2 ? "text-amber-500" : score === 3 ? "text-yellow-600" : "text-emerald-600"

  return (
    <div className="mt-2">
      {/* Bar */}
      <div className="flex gap-1 mb-2">
        {[1,2,3,4].map(n => (
          <div key={n} className={`flex-1 h-1 rounded-full transition-all duration-300 ${n <= score ? barColor : "bg-stone-200"}`} />
        ))}
      </div>
      {/* Strength label + checks */}
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-medium ${labelColor}`}>Password strength: {label}</span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map(c => (
          <div key={c.label} className={`flex items-center gap-1 text-xs ${c.pass ? "text-emerald-600" : "text-stone-400"}`}>
            <span>{c.pass ? "✓" : "○"}</span> {c.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function validate(form) {
  const errors = {}

  // Name
  if (!form.name.trim())
    errors.name = "Name is required"
  else if (form.name.trim().length < 2)
    errors.name = "Name must be at least 2 characters"
  else if (form.name.trim().length > 60)
    errors.name = "Name must be 60 characters or fewer"
  else if (!/^[a-zA-Z\s'-]+$/.test(form.name.trim()))
    errors.name = "Name can only contain letters, spaces, hyphens and apostrophes"

  // Email
  if (!form.email.trim())
    errors.email = "Email is required"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address"

  // Password
  if (!form.password)
    errors.password = "Password is required"
  else if (form.password.length < 8)
    errors.password = "Password must be at least 8 characters"
  else if (form.password.length > 100)
    errors.password = "Password is too long"

  return errors
}

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm]           = useState({ name: "", email: "", password: "", role: "STUDENT" })
  const [errors, setErrors]       = useState({})
  const [touched, setTouched]     = useState({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading]     = useState(false)
  const [mounted, setMounted]     = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const touch = field => setTouched(t => ({ ...t, [field]: true }))

  useEffect(() => {
    if (Object.keys(touched).length > 0) setErrors(validate(form))
  }, [form, touched])

  const handleSubmit = async e => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true })
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true); setServerError("")
    try { await register(form.name, form.email, form.password, form.role) }
    catch (err) { setServerError(err.response?.data?.message || "Registration failed. Please try again.") }
    finally { setLoading(false) }
  }

  const fieldClass = field =>
    `input-field w-full rounded-xl px-4 py-3 text-sm ${
      touched[field] && errors[field] ? "border-rose-300 bg-rose-50 focus:border-rose-400" : ""
    }`

  const allValid = Object.keys(validate(form)).length === 0 && form.name && form.email && form.password

  return (
    <div className="min-h-screen grid-pattern flex items-center justify-center relative overflow-hidden px-4 py-10">
      <div className="orb w-80 h-80 bg-violet-200 opacity-35 top-[-10%] left-[-5%]" style={{animationDuration:'11s'}} />
      <div className="orb w-72 h-72 bg-indigo-200 opacity-30 bottom-[-8%] right-[-5%]" style={{animationDuration:'14s',animationDelay:'-5s'}} />
      <div className="absolute top-24 left-[15%] w-12 h-12 border-2 border-violet-200 rounded-2xl rotate-45 animate-spin" style={{animationDuration:'22s'}} />
      <div className="absolute bottom-20 right-[12%] w-8 h-8 border-2 border-indigo-200 rounded-full animate-bounce" style={{animationDuration:'4s'}} />

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
          <h2 className="font-display text-3xl font-bold text-stone-900 mb-2">Create your account</h2>
          <p className="text-stone-500 text-sm">Join thousands of educators and students</p>
        </div>

        <div className="card p-8">
          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2">
              <span>⚠</span> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Full name</label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} onBlur={() => touch("name")}
                placeholder="Your full name"
                className={fieldClass("name")}
                autoComplete="name"
              />
              <FieldError msg={touched.name && errors.name} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email address</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} onBlur={() => touch("email")}
                placeholder="you@example.com"
                className={fieldClass("email")}
                autoComplete="email"
              />
              <FieldError msg={touched.email && errors.email} />
            </div>

            {/* Password with show/hide + strength meter */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password" value={form.password}
                  onChange={handleChange} onBlur={() => touch("password")}
                  placeholder="Min 8 characters"
                  className={`${fieldClass("password")} pr-12`}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-medium px-1 py-0.5 rounded transition-colors">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <FieldError msg={touched.password && errors.password} />
              {form.password && <PasswordStrength password={form.password} />}
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {[["STUDENT","🎓","Student","Learn and take quizzes"],["TEACHER","📚","Teacher","Create and manage quizzes"]].map(([val,icon,label,sub]) => (
                  <label key={val} className={`flex flex-col items-center gap-1 py-3.5 px-3 rounded-xl border-2 cursor-pointer transition-all text-center ${
                    form.role === val
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-stone-200 text-stone-500 hover:border-indigo-300 hover:bg-indigo-50 hover:bg-opacity-40"
                  }`}>
                    <input type="radio" name="role" value={val} checked={form.role === val} onChange={handleChange} className="sr-only" />
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-semibold">{label}</span>
                    <span className={`text-xs ${form.role === val ? "text-indigo-500" : "text-stone-400"}`}>{sub}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className={`w-full rounded-xl py-3.5 font-semibold text-sm transition-all disabled:cursor-not-allowed mt-1 ${
                allValid
                  ? "btn-primary"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg> Creating account...
                </span>
              ) : "Create account →"}
            </button>
          </form>

          <div className="mt-6 pt-5 divider text-center">
            <p className="text-sm text-stone-500">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}