import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { startAttempt, submitAttempt } from "../services/attemptService"
import useServerTimer from "../hooks/useServerTimer"
import useAntiCheat from "../hooks/useAntiCheat"
import ViolationWarning from "../components/ViolationWarning"

const VIOLATION_LABELS = { tab_switch:"Tab switching", fullscreen_exit:"Fullscreen exit" }

export default function QuizAttemptPage() {
  const { id } = useParams(); const navigate = useNavigate()
  const [attempt,setAttempt]=useState(null),[answers,setAnswers]=useState({}),[loading,setLoading]=useState(true)
  const [submitting,setSubmitting]=useState(false),[error,setError]=useState(""),[currentQ,setCurrentQ]=useState(0)
  const [violation,setViolation]=useState({type:null,count:0}),[showConfirm,setShowConfirm]=useState(false)
  const [forceSubmit,setForceSubmit]=useState({show:false,reason:"",count:0})
  const [fsBlocked,setFsBlocked]=useState(false); const fsReenterRef=useRef(null)
  const [resumed,setResumed]=useState(false)
  const submitted=useRef(false),tabCount=useRef(0),fsCount=useRef(0),devCount=useRef(0)
  const startedRef=useRef(false),answersRef=useRef({}),attemptIdRef=useRef(null)
  useEffect(()=>{answersRef.current=answers},[answers])

  useEffect(()=>{
    if(startedRef.current)return; startedRef.current=true
    startAttempt(id).then(r=>{setAttempt(r.data);attemptIdRef.current=r.data.attemptId;if(r.data.resumed)setResumed(true)}).catch(err=>setError(err.response?.data?.message||"Failed to start quiz")).finally(()=>setLoading(false))
  },[id])

  const handleSubmit=useCallback(async(reason=null)=>{
    if(submitted.current)return; submitted.current=true; setSubmitting(true)
    try{
      const r=await submitAttempt({attemptId:attemptIdRef.current,answers:answersRef.current,tabSwitchCount:tabCount.current,fullscreenExitCount:fsCount.current,devtoolsCount:devCount.current})
      navigate(`/result/${r.data.attemptId}`,{state:{autoSubmitted:reason}})
    }catch{setError("Failed to submit."); submitted.current=false}
    finally{setSubmitting(false)}
  },[navigate])

  const handleForceSubmit=useCallback((type,count)=>{ if(submitted.current)return; setFsBlocked(false); setForceSubmit({show:true,reason:type,count}) },[])
  const handleFsLost=useCallback((show,reenterFn)=>{ if(show){fsReenterRef.current=reenterFn;setFsBlocked(true)}else{setFsBlocked(false);fsReenterRef.current=null} },[])

  useAntiCheat((type,count)=>{
    if(type==="tab_switch")tabCount.current=count
    if(type==="fullscreen_exit")fsCount.current=count
    if(type==="devtools")devCount.current=count
    setViolation({type,count}); setTimeout(()=>setViolation({type:null,count:0}),4000)
  },handleForceSubmit,handleFsLost)

  const {formatted,isWarning}=useServerTimer(attempt?.attemptId,()=>handleSubmit("time_up"))
  const handleAnswer=(qid,val)=>setAnswers(p=>({...p,[qid]:val}))

  if(loading)return<div className="min-h-screen bg-cream-100 flex items-center justify-center"><div className="text-center"><div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/><p className="text-stone-400 text-sm">Loading quiz...</p></div></div>
  if(error){
    const isTimeExpired = error.startsWith("TIME_EXPIRED:")
    const errorMsg = isTimeExpired ? error.replace("TIME_EXPIRED:","") : error
    return(
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
        <div className="card p-8 max-w-sm w-full text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 ${isTimeExpired?"bg-amber-50 border-2 border-amber-200":"bg-rose-50 border-2 border-rose-200"}`}>
            {isTimeExpired?"⏱":"⚠️"}
          </div>
          <h3 className={`font-display text-xl font-bold mb-2 ${isTimeExpired?"text-amber-700":"text-stone-900"}`}>
            {isTimeExpired?"Time Ran Out":"Something went wrong"}
          </h3>
          <p className={`text-sm mb-6 leading-relaxed ${isTimeExpired?"text-amber-600":"text-rose-500"}`}>{errorMsg}</p>
          {isTimeExpired?(
            <div className="flex gap-3">
              <button onClick={()=>navigate("/history")} className="flex-1 btn-secondary rounded-xl py-2.5 text-sm font-medium">View Results</button>
              <button onClick={()=>navigate("/student")} className="flex-1 btn-primary rounded-xl py-2.5 text-sm font-semibold">Dashboard</button>
            </div>
          ):(
            <button onClick={()=>navigate("/student")} className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold">Back to Dashboard</button>
          )}
        </div>
      </div>
    )
  }
  if(!attempt)return null

  const question=attempt.questions[currentQ],total=attempt.questions.length,answered=Object.keys(answers).length,progress=(answered/total)*100,strikes=Math.max(tabCount.current,fsCount.current)

  return(
    <div className="min-h-screen bg-cream-100 grid-pattern">
      <ViolationWarning type={violation.type} count={violation.count} onDismiss={()=>setViolation({type:null,count:0})}/>

      {/* Resume banner — shown when browser crash detected */}
      {resumed&&(
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border-2 border-amber-200 shadow-lifted">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg flex-shrink-0">⚡</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-900">Quiz Resumed</p>
              <p className="text-xs text-stone-500 mt-0.5">Your previous session was interrupted. This restart has been recorded as a browser crash violation.</p>
            </div>
            <button onClick={()=>setResumed(false)} className="text-stone-300 hover:text-stone-600 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-stone-100 text-lg flex-shrink-0">×</button>
          </div>
        </div>
      )}

      {/* Fullscreen blocking overlay */}
      {fsBlocked&&!forceSubmit.show&&(
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-stone-900 bg-opacity-85 backdrop-blur-md p-4">
          <div className="card max-w-sm w-full p-8 text-center border-2 border-amber-200">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-amber-400 opacity-20 animate-ping"/>
              <div className="relative w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-3xl">🖥️</div>
            </div>
            <h2 className="font-display text-xl font-bold text-stone-900 mb-2">Fullscreen Required</h2>
            <p className="text-stone-600 text-sm mb-1">You exited fullscreen. <strong>Strike {fsCount.current} of 3.</strong></p>
            <p className="text-stone-400 text-sm mb-6">{3-fsCount.current} more exit{3-fsCount.current!==1?"s":""} will auto-submit your quiz.</p>
            <div className="flex justify-center gap-2 mb-6">
              {[1,2,3].map(n=><div key={n} className={`w-3 h-3 rounded-full ${n<=fsCount.current?"bg-amber-400":"bg-stone-200"}`}/>)}
            </div>
            <button onClick={()=>fsReenterRef.current&&fsReenterRef.current()} className="btn-primary w-full py-3.5 rounded-xl font-bold">🖥️ Return to Fullscreen</button>
          </div>
        </div>
      )}

      {/* Force-submit modal */}
      {forceSubmit.show&&(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900 bg-opacity-85 backdrop-blur-md">
          <div className="card max-w-sm w-full p-8 text-center border-2 border-rose-200">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-rose-400 opacity-20 animate-ping"/>
              <div className="relative w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-300 flex items-center justify-center text-3xl">🚫</div>
            </div>
            <h2 className="font-display text-xl font-bold text-stone-900 mb-2">Quiz Terminated</h2>
            <p className="text-stone-600 text-sm mb-1"><strong>{VIOLATION_LABELS[forceSubmit.reason]||"Cheating attempt"}</strong> detected {forceSubmit.count} times.</p>
            <p className="text-stone-400 text-sm mb-6">Your quiz has been auto-submitted. This violation is visible to your teacher.</p>
            <div className="flex justify-center gap-3 mb-6">
              {[1,2,3].map(n=>(
                <div key={n} className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-rose-50 border-2 border-rose-300 flex items-center justify-center text-rose-500 font-bold text-sm">✗</div>
                  <span className="text-xs text-stone-400">Strike {n}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>handleSubmit(forceSubmit.reason)} disabled={submitting}
              className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{background:"linear-gradient(135deg,#dc2626,#b91c1c)"}}>
              {submitting?"Submitting...":"Submit & Exit →"}
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <div className="navbar sticky top-0 z-10 px-6 py-3">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-sm font-semibold text-stone-900">{attempt.quizTitle}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-xs text-stone-400">{answered}/{total} answered</p>
              {strikes>0&&(
                <div className="flex items-center gap-1.5">
                  {[1,2,3].map(n=><div key={n} className={`w-2 h-2 rounded-full ${n<=strikes?"bg-rose-500":"bg-stone-200"}`}/>)}
                  <span className="text-xs text-rose-500 ml-1">{strikes}/3 strikes</span>
                </div>
              )}
            </div>
          </div>
          <div className={`font-mono text-lg font-bold tabular-nums px-4 py-1.5 rounded-xl border ${isWarning?"text-rose-600 border-rose-200 bg-rose-50":"text-indigo-600 border-indigo-100 bg-indigo-50"}`}>
            {formatted}
          </div>
        </div>
        <div className="max-w-3xl mx-auto mt-3 h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div className="progress-bar h-full rounded-full transition-all duration-500" style={{width:`${progress}%`}}/>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Question nav */}
        <div className="card-cream p-4 mb-5">
          <p className="text-xs text-stone-400 mb-3 font-medium uppercase tracking-wider">Questions</p>
          <div className="flex flex-wrap gap-2">
            {attempt.questions.map((q,i)=>(
              <button key={i} onClick={()=>setCurrentQ(i)}
                className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                  i===currentQ?"bg-indigo-600 text-white shadow-sm"
                  :answers[q.id]?"bg-emerald-100 text-emerald-700 border border-emerald-200"
                  :"bg-white text-stone-500 border border-stone-200 hover:border-indigo-300"}`}>
                {i+1}
              </button>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="card p-6 sm:p-8 mb-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">{currentQ+1}</div>
              <span className="text-xs text-stone-400 font-medium">of {total}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1">
              <span className="text-amber-500 text-xs">⭐</span>
              <span className="text-amber-600 text-xs font-semibold">{question.marks} mark{question.marks>1?"s":""}</span>
            </div>
          </div>

          <p className="text-stone-900 text-base font-medium leading-relaxed mb-7">{question.text}</p>

          {question.type==="MCQ"&&(
            <div className="space-y-2.5">
              {question.options.map((opt,idx)=>{
                const letters=["A","B","C","D","E"],isSelected=answers[question.id]===String(opt.id)
                return(
                  <label key={opt.id} className={`mcq-option flex items-center gap-4 p-4 rounded-xl cursor-pointer ${isSelected?"selected":""}`}>
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all ${isSelected?"bg-indigo-600 text-white":"bg-stone-100 text-stone-500"}`}>{letters[idx]}</div>
                    <input type="radio" name={`q-${question.id}`} value={opt.id} checked={isSelected} onChange={()=>handleAnswer(question.id,String(opt.id))} className="sr-only"/>
                    <span className={`text-sm ${isSelected?"text-stone-900 font-medium":"text-stone-600"}`}>{opt.text}</span>
                  </label>
                )
              })}
            </div>
          )}
          {question.type==="TRUE_FALSE"&&(
            <div className="flex gap-3">
              {["true","false"].map(val=>{
                const isSelected=answers[question.id]===val
                return(
                  <label key={val} className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-xl cursor-pointer border-2 transition-all ${isSelected?"border-indigo-500 bg-indigo-50":"border-stone-200 hover:border-indigo-300 bg-white"}`}>
                    <span className="text-2xl">{val==="true"?"✓":"✗"}</span>
                    <span className={`text-sm font-semibold capitalize ${isSelected?"text-indigo-700":"text-stone-500"}`}>{val}</span>
                    <input type="radio" name={`q-${question.id}`} value={val} checked={isSelected} onChange={()=>handleAnswer(question.id,val)} className="sr-only"/>
                  </label>
                )
              })}
            </div>
          )}
          {(question.type==="SHORT_ANSWER"||question.type==="FILL_IN_THE_BLANK")&&(
            <input type="text" value={answers[question.id]||""} onChange={e=>handleAnswer(question.id,e.target.value)}
              placeholder="Type your answer here..." className="input-field w-full rounded-xl px-4 py-3.5 text-sm"/>
          )}
        </div>

        <div className="flex justify-between">
          <button onClick={()=>setCurrentQ(p=>Math.max(0,p-1))} disabled={currentQ===0}
            className="btn-secondary px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed">← Prev</button>
          {currentQ<total-1
            ?<button onClick={()=>setCurrentQ(p=>Math.min(total-1,p+1))} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium">Next →</button>
            :<button onClick={()=>setShowConfirm(true)} disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{background:"linear-gradient(135deg,#059669,#0f766e)"}}>
              {submitting?"Submitting...":"✓ Submit Quiz"}
            </button>
          }
        </div>
      </div>

      {showConfirm&&(
        <div className="fixed inset-0 bg-stone-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-sm w-full text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="font-display text-xl font-bold text-stone-900 mb-2">Submit Quiz?</h3>
            <p className="text-stone-500 text-sm mb-2">{answered} of {total} questions answered.</p>
            {answered<total?<p className="text-amber-500 text-xs mb-5">⚠ {total-answered} unanswered</p>:<p className="text-emerald-600 text-xs mb-5">✓ All answered!</p>}
            <div className="flex gap-3">
              <button onClick={()=>setShowConfirm(false)} className="flex-1 btn-secondary rounded-xl py-2.5 text-sm font-medium">Cancel</button>
              <button onClick={()=>{setShowConfirm(false);handleSubmit()}} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{background:"linear-gradient(135deg,#059669,#0f766e)"}}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}