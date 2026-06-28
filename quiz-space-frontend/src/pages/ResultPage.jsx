import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { getResult } from "../services/attemptService"

function ScoreRing({ percentage, passed }) {
  const r=54, circ=2*Math.PI*r, offset=circ-(percentage/100)*circ
  return(
    <div className="relative inline-flex items-center justify-center w-36 h-36">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 136 136">
        <circle cx="68" cy="68" r={r} fill="none" stroke="#F4EFE4" strokeWidth="8"/>
        <circle cx="68" cy="68" r={r} fill="none" stroke={passed?"url(#sr-pass)":"url(#sr-fail)"} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)"}}/>
        <defs>
          <linearGradient id="sr-pass" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor="#4F46E5"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient>
          <linearGradient id="sr-fail" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor="#DC2626"/><stop offset="100%" stopColor="#F97316"/></linearGradient>
        </defs>
      </svg>
      <div className="relative text-center">
        <div className={`text-3xl font-display font-bold ${passed?"text-gradient":"text-rose-600"}`}>{percentage}%</div>
      </div>
    </div>
  )
}

const CHEAT_LABELS={tab_switch:"Tab Switching",fullscreen_exit:"Fullscreen Exit",devtools:"DevTools"}

export default function ResultPage() {
  const {attemptId}=useParams(),navigate=useNavigate(),location=useLocation()
  const [result,setResult]=useState(null),[loading,setLoading]=useState(true)
  const reason=location.state?.autoSubmitted
  useEffect(()=>{getResult(attemptId).then(r=>setResult(r.data)).catch(()=>navigate("/student")).finally(()=>setLoading(false))},[attemptId])

  if(loading)return<div className="min-h-screen bg-cream-100 flex items-center justify-center"><div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>
  if(!result)return null

  const pct=Math.round((result.score/result.totalMarks)*100),passed=pct>=50
  const isCheat=result.status==="AUTO_SUBMITTED"&&reason&&reason!=="time_up"
  const isTimeUp=result.status==="AUTO_SUBMITTED"&&reason==="time_up"
  const totalV=(result.tabSwitchCount||0)+(result.fullscreenExitCount||0)+(result.devtoolsCount||0)+(result.browserCrashCount||0)

  return(
    <div className="min-h-screen bg-cream-100 grid-pattern">
      <div className="orb w-96 h-96 bg-indigo-200 opacity-25 top-0 right-0" style={{animationDuration:"12s"}}/>
      <div className="navbar px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8L12 4L20 8L12 12L4 8Z" fill="white" fillOpacity="0.9"/><path d="M4 8V14L12 18L20 14V8" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none"/><line x1="20" y1="8" x2="20" y2="14" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/><circle cx="20" cy="15.5" r="1.5" fill="white" opacity="0.8"/></svg></div><span className="font-display text-lg font-semibold text-stone-900">QuizSpace</span></div>
          <button onClick={()=>navigate("/student")} className="text-sm text-stone-400 hover:text-stone-700 transition-colors">← Dashboard</button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {isCheat&&(
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-lg flex-shrink-0">🚫</div>
            <div><p className="text-rose-700 font-bold text-sm">Quiz auto-submitted due to cheating</p><p className="text-rose-500 text-xs mt-0.5"><strong>{CHEAT_LABELS[reason]||reason}</strong> was detected 3 times. Recorded for your teacher.</p></div>
          </div>
        )}
        {isTimeUp&&(
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-lg flex-shrink-0">⏱</div>
            <div><p className="text-amber-700 font-bold text-sm">Auto-submitted — time ran out</p><p className="text-amber-500 text-xs mt-0.5">Quiz was submitted automatically when the timer reached zero.</p></div>
          </div>
        )}

        <div className="card p-7 text-center mb-5">
          <div className="badge-indigo inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full mb-5">Quiz Complete</div>
          <h1 className="font-display text-xl font-bold text-stone-900 mb-6">{result.quizTitle}</h1>
          <ScoreRing percentage={pct} passed={passed}/>
          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${passed?"bg-emerald-50 text-emerald-700 border border-emerald-200":"bg-rose-50 text-rose-600 border border-rose-200"}`}>
            {passed?"🎉 Passed":"💪 Keep Practicing"}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-7 pt-7 border-t border-stone-100">
            {[{l:"Score",v:`${result.score}/${result.totalMarks}`,c:"text-indigo-600"},{l:"Correct",v:`${result.correctAnswers}/${result.totalQuestions}`,c:"text-emerald-600"},{l:"Violations",v:totalV,c:totalV>0?"text-rose-500":"text-stone-400"}].map(s=>(
              <div key={s.l}><div className={`text-2xl font-display font-bold ${s.c}`}>{s.v}</div><div className="text-xs text-stone-400 mt-1">{s.l}</div></div>
            ))}
          </div>
        </div>

        {totalV>0&&(
          <div className="card p-5 mb-5 border-rose-100">
            <h3 className="text-sm font-semibold text-rose-600 mb-3 flex items-center gap-2">⚠ Violation Record</h3>
            <div className="grid grid-cols-3 gap-3">
              {[{l:"Tab Switches",v:result.tabSwitchCount||0,i:"🔀"},{l:"Fullscreen Exits",v:result.fullscreenExitCount||0,i:"🖥️"},{l:"DevTools",v:result.devtoolsCount||0,i:"🔧"},{l:"Browser Crashes",v:result.browserCrashCount||0,i:"💥"}].map(v=>(
                <div key={v.l} className={`rounded-xl p-3 text-center ${v.v>0?"bg-rose-50 border border-rose-100":"bg-stone-50 border border-stone-100"}`}>
                  <div className="text-xl mb-1">{v.i}</div>
                  <div className={`text-xl font-display font-bold ${v.v>0?"text-rose-500":"text-stone-300"}`}>{v.v}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{v.l}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-rose-400 mt-3 text-center">Visible to your teacher on the submissions page.</p>
          </div>
        )}

        <h2 className="font-display text-lg font-bold text-stone-900 mb-4">Answer Review</h2>
        <div className="space-y-3">
          {result.answers?.map((ans,i)=>(
            <div key={ans.questionId} className={`card p-5 border ${ans.isCorrect?"border-emerald-100":"border-rose-100"}`}>
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm ${ans.isCorrect?"bg-emerald-50 text-emerald-600 border border-emerald-100":"bg-rose-50 text-rose-500 border border-rose-100"}`}>{ans.isCorrect?"✓":"✗"}</div>
                  <p className="text-sm text-stone-700 leading-snug">{ans.questionText}</p>
                </div>
                <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-lg font-semibold ${ans.isCorrect?"bg-emerald-50 text-emerald-600":"bg-rose-50 text-rose-500"}`}>{ans.marksAwarded}/{ans.totalMarks}</span>
              </div>
              <div className="ml-10 text-xs space-y-1">
                <p className="text-stone-400">Your answer: {ans.studentResponse ? <span className={`font-medium ${ans.isCorrect?"text-emerald-600":"text-rose-500"}`}>{ans.studentResponse}</span> : <span className="text-xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded-lg font-medium">Not answered</span>}</p>
                {!ans.isCorrect&&<p className="text-stone-400">Correct: <span className="font-medium text-emerald-600">{ans.correctAnswer}</span></p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={()=>navigate(`/solutions/${result.quizId}`)} className="flex-1 btn-secondary rounded-xl py-3 text-sm font-medium">📖 Solutions</button>
          <button onClick={()=>navigate("/student")} className="flex-1 btn-primary rounded-xl py-3 text-sm font-semibold">Dashboard →</button>
        </div>
      </div>
    </div>
  )
}