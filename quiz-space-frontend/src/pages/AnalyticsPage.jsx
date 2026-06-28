import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getQuizAnalytics } from "../services/analyticsService"
import Navbar from "../components/Navbar"

function Bar({ pct, label, value }) {
  const color = pct>=70?"from-emerald-400 to-teal-400":pct>=40?"from-amber-400 to-orange-400":"from-rose-400 to-orange-400"
  const textColor = pct>=70?"text-emerald-600":pct>=40?"text-amber-600":"text-rose-500"
  return(
    <div>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-stone-700 truncate flex-1 mr-4">{label}</p>
        <span className={`text-xs font-bold flex-shrink-0 ${textColor}`}>{pct}%</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{width:`${pct}%`}}/>
      </div>
      <p className="text-xs text-stone-400 mt-1">{value}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const {quizId}=useParams(),navigate=useNavigate()
  const [data,setData]=useState(null),[loading,setLoading]=useState(true),[fetchError,setFetchError]=useState("")
  useEffect(()=>{getQuizAnalytics(quizId).then(r=>setData(r.data)).catch(()=>setFetchError("Failed to load analytics")).finally(()=>setLoading(false))},[quizId])

  if(loading)return<div className="min-h-screen bg-cream-100 flex items-center justify-center"><div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>
  if(fetchError)return<div className="min-h-screen bg-cream-100 flex items-center justify-center"><div className="card p-8 max-w-sm text-center mx-4"><div className="text-4xl mb-4">⚠️</div><p className="text-rose-500 text-sm mb-5">{fetchError}</p><button onClick={()=>navigate("/dashboard")} className="btn-primary px-5 py-2.5 rounded-xl text-sm">← Dashboard</button></div></div>
  if(!data)return null

  const passRate=data.totalAttempts>0?Math.round((data.passCount/data.totalAttempts)*100):0

  return(
    <div className="min-h-screen bg-cream-100 grid-pattern">
      <div className="orb w-96 h-96 bg-indigo-200 opacity-20 top-0 right-0" style={{animationDuration:"12s"}}/>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-indigo-600 text-xs font-medium mb-5">📊 Analytics</div>
          <h1 className="font-display text-4xl font-bold text-stone-900 mb-2">{data.quizTitle}</h1>
          <p className="text-stone-500">Performance overview and question insights</p>
        </div>

        {data.totalAttempts===0?(
          <div className="card text-center py-24">
            <div className="text-6xl mb-5">📊</div>
            <h3 className="text-xl font-display font-bold text-stone-800 mb-2">No attempts yet</h3>
            <p className="text-stone-400 text-sm">Results will appear once students start taking the quiz.</p>
          </div>
        ):(
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {l:"Total Attempts",v:data.totalAttempts,c:"text-indigo-600",i:"👥"},
                {l:"Avg Score",v:`${data.averagePercentage}%`,c:"text-stone-800",i:"📈"},
                {l:"Pass Rate",v:`${passRate}%`,c:"text-emerald-600",i:"✅"},
                {l:"Failed",v:data.failCount,c:"text-rose-500",i:"❌"},
              ].map(s=>(
                <div key={s.l} className="card p-5 text-center hover-lift">
                  <div className="text-2xl mb-2">{s.i}</div>
                  <div className={`text-2xl font-display font-bold ${s.c}`}>{s.v}</div>
                  <div className="text-xs text-stone-400 mt-1">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="card p-6 mb-5">
              <h3 className="font-display font-bold text-stone-900 mb-6">Score Range</h3>
              <div className="grid grid-cols-3 gap-6 text-center">
                {[
                  {l:"Highest",v:data.highestScore,c:"text-emerald-600",bar:"from-emerald-400 to-teal-400"},
                  {l:"Average",v:data.averageScore,c:"text-indigo-600",bar:"from-indigo-400 to-violet-400"},
                  {l:"Lowest",v:data.lowestScore,c:"text-rose-500",bar:"from-rose-400 to-orange-400"},
                ].map(s=>(
                  <div key={s.l}>
                    <div className={`text-3xl font-display font-bold ${s.c} mb-1`}>{s.v}</div>
                    <div className="text-xs text-stone-400">{s.l}</div>
                    <div className="h-1.5 bg-stone-100 rounded-full mt-3 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${s.bar}`} style={{width:`${data.totalMarks>0?(s.v/data.totalMarks*100):0}%`,transition:"width 0.7s ease"}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {data.questionAnalytics?.length>0&&(
              <div className="card p-6">
                <h3 className="font-display font-bold text-stone-900 mb-6">Question Performance</h3>
                <div className="space-y-5">
                  {data.questionAnalytics.map((q,i)=>(
                    <Bar key={q.questionId}
                      label={`Q${i+1}. ${q.questionText}`}
                      pct={q.correctPercentage}
                      value={`${q.correctCount}/${q.totalAttempts} students answered correctly`}/>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}