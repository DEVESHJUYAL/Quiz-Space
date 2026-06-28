import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getMyAttempts } from "../services/attemptService"
import Navbar from "../components/Navbar"

export default function AttemptHistoryPage() {
  const [attempts,setAttempts]=useState([]),[loading,setLoading]=useState(true)
  const navigate=useNavigate()
  useEffect(()=>{getMyAttempts().then(r=>setAttempts(r.data)).finally(()=>setLoading(false))},[])
  const avg=attempts.length>0?Math.round(attempts.reduce((s,a)=>s+(a.totalMarks>0?(a.score/a.totalMarks)*100:0),0)/attempts.length):0
  const passed=attempts.filter(a=>a.totalMarks>0&&(a.score/a.totalMarks)>=0.5).length

  return(
    <div className="min-h-screen bg-cream-100 grid-pattern">
      <div className="orb w-80 h-80 bg-indigo-200 opacity-20 top-0 right-0" style={{animationDuration:"12s"}}/>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-indigo-600 text-xs font-medium mb-5">📋 History</div>
          <h1 className="font-display text-4xl font-bold text-stone-900 mb-2">My Attempts</h1>
          <p className="text-stone-500">Your complete quiz history and performance</p>
        </div>
        {!loading&&attempts.length>0&&(
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[{l:"Quizzes Taken",v:attempts.length,c:"text-indigo-600"},{l:"Avg Score",v:`${avg}%`,c:"text-stone-700"},{l:"Passed",v:passed,c:"text-emerald-600"}].map(s=>(
              <div key={s.l} className="card p-5 text-center"><div className={`text-2xl font-display font-bold ${s.c}`}>{s.v}</div><div className="text-xs text-stone-400 mt-1">{s.l}</div></div>
            ))}
          </div>
        )}
        {loading&&<div className="space-y-3">{[1,2,3].map(i=><div key={i} className="card h-24 animate-pulse"/>)}</div>}
        {!loading&&attempts.length===0&&(
          <div className="text-center py-28"><div className="text-6xl mb-5">📋</div><h3 className="text-xl font-display font-bold text-stone-800 mb-2">No attempts yet</h3><p className="text-stone-400 text-sm mb-7">Start a quiz from the dashboard</p><button onClick={()=>navigate("/student")} className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold">Browse Quizzes →</button></div>
        )}
        <div className="space-y-3">
          {attempts.map(a=>{
            const pct=a.totalMarks>0?Math.round((a.score/a.totalMarks)*100):0,isPassed=pct>=50
            const totalV=(a.tabSwitchCount||0)+(a.fullscreenExitCount||0)+(a.devtoolsCount||0)
            return(
              <div key={a.attemptId} className="card p-5 hover-lift">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center font-display font-bold border-2 ${isPassed?"border-emerald-200 bg-emerald-50":"border-rose-200 bg-rose-50"}`}>
                    <span className={`text-base leading-none ${isPassed?"text-emerald-600":"text-rose-500"}`}>{pct}</span>
                    <span className={`text-xs ${isPassed?"text-emerald-400":"text-rose-300"}`}>%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-900 truncate">{a.quizTitle}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-stone-400">{a.submittedAt?new Date(a.submittedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"In progress"}</span>
                      <span className="text-xs text-stone-300">·</span>
                      <span className="text-xs text-stone-400">{a.score}/{a.totalMarks} marks</span>
                      {totalV>0&&<span className="text-xs text-rose-400 bg-rose-50 border border-rose-100 rounded-lg px-1.5 py-0.5">⚠ {totalV} violation{totalV>1?"s":""}</span>}
                      {a.status==="AUTO_SUBMITTED"&&<span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-1.5 py-0.5">🚫 Auto-submitted</span>}
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full mt-2 w-full max-w-xs overflow-hidden">
                      <div className={`h-full rounded-full ${isPassed?"bg-gradient-to-r from-emerald-400 to-teal-400":"bg-gradient-to-r from-rose-400 to-orange-400"}`} style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={()=>navigate(`/result/${a.attemptId}`)} className="px-3 py-1.5 rounded-lg text-xs font-medium badge-indigo hover:bg-indigo-100 transition-all">Results</button>
                    <button onClick={()=>navigate(`/solutions/${a.quizId}`)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-50 text-stone-500 border border-stone-200 hover:bg-stone-100 transition-all">Solutions</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}