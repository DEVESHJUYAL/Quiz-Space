import { useState, useEffect } from "react"
import { getQuizForEdit } from "../services/quizService"

const emptyOption  = () => ({ text:"", isCorrect:false })
const emptyQuestion = () => ({ text:"", type:"MCQ", marks:1, questionOrder:1, correctAnswer:"", options:[emptyOption(),emptyOption(),emptyOption(),emptyOption()] })

export default function CreateQuizModal({ mode="create", quizId=null, onClose, onSubmit }) {
  const isEdit=mode==="edit"
  const [step,setStep]=useState(1),[loading,setLoading]=useState(false),[loadingInitial,setLoadingInitial]=useState(isEdit),[error,setError]=useState("")
  const [quizInfo,setQuizInfo]=useState({title:"",description:"",durationMinutes:30})
  const [questions,setQuestions]=useState([emptyQuestion()])
  const [allowedEmailsText,setAllowedEmailsText]=useState("")

  useEffect(()=>{
    if(!isEdit||!quizId)return
    getQuizForEdit(quizId).then(res=>{
      const d=res.data
      setQuizInfo({title:d.title,description:d.description||"",durationMinutes:d.durationMinutes})
      setAllowedEmailsText((d.allowedStudentEmails||[]).join("\n"))
      setQuestions((d.questions||[]).map(q=>({
        text:q.text,type:q.type,marks:q.marks,questionOrder:q.questionOrder,correctAnswer:q.correctAnswer||"",
        options:q.type==="MCQ"?(q.options||[]).map(o=>({text:o.text,isCorrect:o.isCorrect})):[emptyOption(),emptyOption(),emptyOption(),emptyOption()]
      })))
    }).catch(()=>setError("Failed to load quiz for editing")).finally(()=>setLoadingInitial(false))
  },[isEdit,quizId])

  const handleChange  = e => setQuizInfo({...quizInfo,[e.target.name]:e.target.value})
  const handleQChange = (qi,f,v) => { const u=[...questions]; u[qi][f]=v; setQuestions(u) }
  const handleOChange = (qi,oi,f,v) => { const u=[...questions]; u[qi].options[oi][f]=v; setQuestions(u) }
  const setCorrect    = (qi,oi) => { const u=[...questions]; u[qi].options=u[qi].options.map((o,i)=>({...o,isCorrect:i===oi})); setQuestions(u) }
  const addQ  = () => setQuestions([...questions,{...emptyQuestion(),questionOrder:questions.length+1}])
  const removeQ = qi => setQuestions(questions.filter((_,i)=>i!==qi))

  const handleSubmit=async()=>{
    // Validate questions before submitting
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) { setError(`Question ${i + 1} is missing its text`); return }
      if (q.type === "MCQ") {
        const filled = q.options.filter(o => o.text.trim())
        if (filled.length < 2) { setError(`Question ${i + 1} needs at least 2 options`); return }
        if (!q.options.some(o => o.isCorrect)) { setError(`Question ${i + 1} needs a correct answer selected`); return }
      }
      if ((q.type === "TRUE_FALSE" || q.type === "SHORT_ANSWER" || q.type === "FILL_IN_THE_BLANK") && !q.correctAnswer.trim()) {
        setError(`Question ${i + 1} needs a correct answer`); return
      }
    }
    setLoading(true);setError("")
    try{
      const emails=allowedEmailsText.split(/[\n,]/).map(e=>e.trim()).filter(Boolean)
      await onSubmit({
        ...quizInfo,durationMinutes:Number(quizInfo.durationMinutes),allowedStudentEmails:emails,
        questions:questions.map((q,i)=>({
          text:q.text,type:q.type,marks:Number(q.marks),questionOrder:i+1,
          correctAnswer:q.type==="MCQ"?null:q.correctAnswer,
          options:q.type==="MCQ"?q.options.map(o=>({text:o.text,isCorrect:o.isCorrect})):null,
        }))
      })
      onClose()
    }catch(err){setError(err.response?.data?.message||`Failed to ${isEdit?"update":"create"} quiz`)}
    finally{setLoading(false)}
  }

  const qTypeLabel={MCQ:"Multiple Choice",TRUE_FALSE:"True / False",SHORT_ANSWER:"Short Answer",FILL_IN_THE_BLANK:"Fill in Blank"}

  return(
    <div className="fixed inset-0 bg-stone-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-card-3d border border-stone-100" onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900">{step===1?(isEdit?"Edit Quiz Details":"New Quiz"):(isEdit?"Edit Questions":"Add Questions")}</h2>
            <p className="text-xs text-stone-400 mt-0.5">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 text-xl transition-all">×</button>
        </div>

        {/* Progress */}
        <div className="flex gap-2 px-6 pt-4">
          {[1,2].map(s=><div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s<=step?"bg-gradient-to-r from-indigo-500 to-violet-500":"bg-stone-100"}`}/>)}
        </div>

        {loadingInitial?(
          <div className="p-10 text-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/><p className="text-stone-400 text-sm">Loading quiz...</p></div>
        ):(
          <>
            <div className="p-6">
              {error&&<div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">⚠ {error}</div>}

              {step===1&&(
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Quiz Title *</label>
                    <input name="title" value={quizInfo.title} onChange={handleChange} placeholder="e.g. Chapter 5 — Algebra Test" className="input-field w-full rounded-xl px-4 py-3 text-sm"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
                    <textarea name="description" value={quizInfo.description} onChange={handleChange} placeholder="Optional description for students" rows={3} className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Duration (minutes) *</label>
                    <input name="durationMinutes" type="number" min="1" value={quizInfo.durationMinutes} onChange={handleChange} className="input-field w-full rounded-xl px-4 py-3 text-sm"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Student emails <span className="text-rose-500">*</span></label>
                    <textarea value={allowedEmailsText} onChange={e=>setAllowedEmailsText(e.target.value)}
                      placeholder={"At least one email is required:\npriya@example.com\nrahul@example.com"}
                      rows={3} className={`input-field w-full rounded-xl px-4 py-3 text-sm font-mono resize-none ${!allowedEmailsText.trim()?"border-rose-200":""}`}/>
                    <p className="text-xs mt-1.5">
                      {allowedEmailsText.trim()
                        ?<span className="text-indigo-500">🔒 {allowedEmailsText.split(/[\n,]/).map(e=>e.trim()).filter(Boolean).length} student(s) will have access</span>
                        :<span className="text-rose-400">⚠ At least one student email is required</span>}
                    </p>
                  </div>
                </div>
              )}

              {step===2&&(
                <div className="space-y-4">
                  {questions.map((q,qi)=>(
                    <div key={qi} className="card-cream p-5 border border-stone-100">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">{qi+1}</div>
                          <span className="text-xs text-stone-400 font-medium">{qTypeLabel[q.type]}</span>
                        </div>
                        {questions.length>1&&<button onClick={()=>removeQ(qi)} className="text-xs text-rose-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition-all">Remove</button>}
                      </div>
                      <div className="space-y-3">
                        <input value={q.text} onChange={e=>handleQChange(qi,"text",e.target.value)} placeholder="Enter question text..." className="input-field w-full rounded-xl px-4 py-3 text-sm"/>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="block text-xs text-stone-400 mb-1.5">Type</label>
                            <select value={q.type} onChange={e=>handleQChange(qi,"type",e.target.value)} className="input-field w-full rounded-xl px-3 py-2.5 text-sm">
                              <option value="MCQ">Multiple Choice</option>
                              <option value="TRUE_FALSE">True / False</option>
                              <option value="SHORT_ANSWER">Short Answer</option>
                              <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
                            </select>
                          </div>
                          <div className="w-24">
                            <label className="block text-xs text-stone-400 mb-1.5">Marks</label>
                            <input type="number" min="1" value={q.marks} onChange={e=>handleQChange(qi,"marks",e.target.value)} className="input-field w-full rounded-xl px-3 py-2.5 text-sm"/>
                          </div>
                        </div>
                        {q.type==="MCQ"&&(
                          <div className="space-y-2">
                            <label className="block text-xs text-stone-400">Options — click letter to mark correct</label>
                            {q.options.map((opt,oi)=>{
                              const letters=["A","B","C","D"]
                              return(
                                <div key={oi} className="flex items-center gap-2">
                                  <button onClick={()=>setCorrect(qi,oi)}
                                    className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all ${opt.isCorrect?"bg-emerald-500 text-white":"bg-stone-100 text-stone-500 border border-stone-200 hover:border-emerald-400"}`}>
                                    {letters[oi]}
                                  </button>
                                  <input value={opt.text} onChange={e=>handleOChange(qi,oi,"text",e.target.value)} placeholder={`Option ${letters[oi]}`} className="input-field flex-1 rounded-xl px-3 py-2 text-sm"/>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        {q.type==="TRUE_FALSE"&&(
                          <div>
                            <label className="block text-xs text-stone-400 mb-1.5">Correct Answer</label>
                            <select value={q.correctAnswer} onChange={e=>handleQChange(qi,"correctAnswer",e.target.value)} className="input-field w-full rounded-xl px-3 py-2.5 text-sm">
                              <option value="">Select answer</option>
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          </div>
                        )}
                        {(q.type==="SHORT_ANSWER"||q.type==="FILL_IN_THE_BLANK")&&(
                          <div>
                            <label className="block text-xs text-stone-400 mb-1.5">Correct Answer</label>
                            <input value={q.correctAnswer} onChange={e=>handleQChange(qi,"correctAnswer",e.target.value)} placeholder="Expected answer" className="input-field w-full rounded-xl px-4 py-2.5 text-sm"/>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <button onClick={addQ} className="w-full py-3.5 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 text-sm font-medium transition-all">+ Add Question</button>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-stone-100">
              {step===2&&<button onClick={()=>setStep(1)} className="flex-1 btn-secondary rounded-xl py-2.5 text-sm font-medium">← Back</button>}
              {step===1?(
                <button onClick={()=>{
                    if(!quizInfo.title.trim()){setError("Title is required");return}
                    const emails=allowedEmailsText.split(/[\n,]/).map(e=>e.trim()).filter(Boolean)
                    if(emails.length===0){setError("At least one student email is required");return}
                    setError("");setStep(2)
                  }}
                  className="flex-1 btn-primary rounded-xl py-2.5 text-sm font-semibold">
                  Next — Add Questions →
                </button>
              ):(
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{background:"linear-gradient(135deg,#059669,#0f766e)"}}>
                  {loading?(
                    <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{isEdit?"Saving...":"Creating..."}</span>
                  ):(isEdit?"✓ Save Changes":"✓ Create Quiz")}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}