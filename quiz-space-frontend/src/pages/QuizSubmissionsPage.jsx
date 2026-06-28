import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getQuizSubmissions } from "../services/attemptService"
import { getSolutions } from "../services/solutionService"
import SolutionUploader from "../components/SolutionUploader"
import Navbar from "../components/Navbar"

export default function QuizSubmissionsPage() {
  const {quizId}=useParams(),navigate=useNavigate()
  const [submissions,setSubmissions]=useState([]),[solutions,setSolutions]=useState([]),[loading,setLoading]=useState(true)
  const [selected,setSelected]=useState(null),[activeTab,setActiveTab]=useState("submissions")

  useEffect(()=>{
    Promise.all([getQuizSubmissions(quizId),getSolutions(quizId)])
      .then(([sr,solr])=>{setSubmissions(sr.data);setSolutions(solr.data)})
      .finally(()=>setLoading(false))
  },[quizId])

  if(loading)return<div className="min-h-screen bg-cream-100 flex items-center justify-center"><div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>

  const passed=submissions.filter(s=>s.totalMarks>0&&(s.score/s.totalMarks)>=0.5).length
  const avg=submissions.length>0?Math.round(submissions.reduce((s,sub)=>s+(sub.totalMarks>0?(sub.score/sub.totalMarks)*100:0),0)/submissions.length):0

  return(
    <div className="min-h-screen bg-cream-100 grid-pattern">
      <div className="orb w-96 h-96 bg-indigo-200 opacity-20 top-0 right-0" style={{animationDuration:"12s"}}/>
      <Navbar actions={[
        {label:"📊 Analytics",onClick:()=>navigate(`/analytics/${quizId}`)},
      ]}/>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-indigo-600 text-xs font-medium mb-5">📋 Submissions</div>
          <h1 className="font-display text-4xl font-bold text-stone-900 mb-2">Student Submissions</h1>
          <p className="text-stone-500">{submissions.length} student{submissions.length!==1?"s":""} have attempted this quiz</p>
        </div>

        {submissions.length>0&&(
          <div className="grid grid-cols-3 gap-4 mb-7">
            {[{l:"Submissions",v:submissions.length,c:"text-indigo-600"},{l:"Avg Score",v:`${avg}%`,c:"text-stone-800"},{l:"Passed",v:passed,c:"text-emerald-600"}].map(s=>(
              <div key={s.l} className="card p-5 text-center"><div className={`text-2xl font-display font-bold ${s.c}`}>{s.v}</div><div className="text-xs text-stone-400 mt-1">{s.l}</div></div>
            ))}
          </div>
        )}

        <div className="flex gap-1 mb-5 bg-white border border-stone-200 rounded-xl p-1 w-fit shadow-soft">
          {[["submissions","📋 Submissions"],["solutions","📤 Solutions"]].map(([val,label])=>(
            <button key={val} onClick={()=>setActiveTab(val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab===val?"bg-indigo-600 text-white":"text-stone-500 hover:text-stone-900"}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab==="submissions"&&(
          submissions.length===0?(
            <div className="card text-center py-24">
              <div className="text-6xl mb-5">📭</div>
              <h3 className="text-xl font-display font-bold text-stone-800 mb-2">No submissions yet</h3>
              <p className="text-stone-400 text-sm">Student submissions will appear here.</p>
            </div>
          ):(
            <div className="space-y-3">
              {submissions.map(sub=>{
                const pct=sub.totalMarks>0?Math.round((sub.score/sub.totalMarks)*100):0
                const isPassed=pct>=50,isOpen=selected?.attemptId===sub.attemptId
                const totalV=(sub.tabSwitchCount||0)+(sub.fullscreenExitCount||0)+(sub.devtoolsCount||0)+(sub.browserCrashCount||0)
                return(
                  <div key={sub.attemptId} className={`card overflow-hidden transition-all ${isOpen?"glow-indigo":""}`}>
                    <div className="p-5 cursor-pointer" onClick={()=>setSelected(isOpen?null:sub)}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center font-display font-bold border-2 ${isPassed?"border-emerald-200 bg-emerald-50":"border-rose-200 bg-rose-50"}`}>
                          <span className={`text-base leading-none ${isPassed?"text-emerald-600":"text-rose-500"}`}>{pct}</span>
                          <span className={`text-xs ${isPassed?"text-emerald-400":"text-rose-300"}`}>%</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stone-900">{sub.studentName || `Attempt #${sub.attemptId}`}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{sub.submittedAt?new Date(sub.submittedAt).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}):"Auto-submitted"}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-stone-400">{sub.score}/{sub.totalMarks} marks</span>
                            {totalV>0&&<span className="text-xs text-rose-400 bg-rose-50 border border-rose-100 rounded-lg px-1.5 py-0.5">⚠ {totalV} violation{totalV>1?"s":""}</span>}
                            {sub.status==="AUTO_SUBMITTED"&&<span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-1.5 py-0.5">🚫 Auto-submitted</span>}
                          </div>
                        </div>
                        <div className="text-stone-400 text-sm">{isOpen?"▲":"▼"}</div>
                      </div>
                    </div>
                    {isOpen&&(
                      <div className="border-t border-stone-100 p-5 space-y-3 bg-cream-50">
                        {totalV>0&&(
                          <div className="flex gap-2 flex-wrap mb-2">
                            {[{i:"🔀",l:"Tab switches",v:sub.tabSwitchCount},{i:"🖥️",l:"Fullscreen exits",v:sub.fullscreenExitCount},{i:"🔧",l:"DevTools",v:sub.devtoolsCount},{i:"💥",l:"Browser crashes",v:sub.browserCrashCount}].filter(v=>v.v>0).map(v=>(
                              <div key={v.l} className="flex items-center gap-1.5 text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1">{v.i} {v.v} {v.l}</div>
                            ))}
                          </div>
                        )}
                        {sub.answers&&<div className="space-y-2">
                          {sub.answers.map((ans,i)=>(
                            <div key={ans.questionId} className={`p-3 rounded-xl border text-xs ${ans.isCorrect?"border-emerald-100 bg-emerald-50":"border-rose-100 bg-rose-50"}`}>
                              <p className="text-stone-700 mb-1 font-medium">Q{i+1}. {ans.questionText}</p>
                              <p className="text-stone-500">Answer: <span className={`font-medium ${ans.isCorrect?"text-emerald-600":"text-rose-500"}`}>{ans.studentResponse||"Not answered"}</span>
                                {!ans.isCorrect&&<span className="text-emerald-600 ml-2">✓ {ans.correctAnswer}</span>}
                              </p>
                            </div>
                          ))}
                        </div>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}

        {activeTab==="solutions"&&(
          <div className="card p-6"><SolutionUploader quizId={quizId} solutions={solutions} onUpdate={setSolutions}/></div>
        )}
      </div>
    </div>
  )
}