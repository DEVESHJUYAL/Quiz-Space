import { useNavigate } from "react-router-dom"
export default function NotFoundPage() {
  const navigate=useNavigate()
  return(
    <div className="min-h-screen bg-cream-100 grid-pattern flex items-center justify-center relative overflow-hidden px-4">
      <div className="orb w-96 h-96 bg-indigo-200 opacity-25 top-0 right-0" style={{animationDuration:"12s"}}/>
      <div className="orb w-80 h-80 bg-violet-200 opacity-20 bottom-0 left-0" style={{animationDuration:"14s",animationDelay:"-5s"}}/>
      <div className="absolute top-20 right-[15%] w-16 h-16 border-2 border-indigo-200 rounded-2xl rotate-12 animate-spin" style={{animationDuration:"20s"}}/>
      <div className="absolute bottom-32 left-[12%] w-10 h-10 border-2 border-amber-200 rounded-xl animate-bounce" style={{animationDuration:"4s"}}/>
      <div className="text-center relative z-10">
        <div className="font-display text-[9rem] font-bold leading-none text-stone-100 select-none mb-4" style={{textShadow:"0 4px 32px rgba(79,70,229,0.1)"}}>404</div>
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-indigo-600 text-xs font-medium mb-5">Page not found</div>
        <h2 className="font-display text-2xl font-bold text-stone-900 mb-3">Looks like you got lost</h2>
        <p className="text-stone-400 text-sm mb-8 max-w-xs mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={()=>navigate(-1)} className="btn-secondary px-6 py-2.5 rounded-xl text-sm font-medium">← Go Back</button>
          <button onClick={()=>navigate("/login")} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">Home →</button>
        </div>
      </div>
    </div>
  )
}