import { useState } from "react"
import { getQuizByCode } from "../services/quizService"
import { useNavigate } from "react-router-dom"

export default function JoinQuizModal({ onClose }) {
  const [code, setCode] = useState("")
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSearch = async () => {
    if(!code.trim()) { setError("Please enter a quiz code"); return }
    if(code.trim().length !== 8) { setError("Quiz codes are exactly 8 characters"); return }
    setLoading(true); setError(""); setQuiz(null)
    try { const r = await getQuizByCode(code.trim().toUpperCase()); setQuiz(r.data) }
    catch { setError("Invalid code or quiz not available") }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-stone-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card w-full max-w-sm p-6" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900">Join Quiz</h2>
            <p className="text-xs text-stone-400 mt-0.5">Enter the code from your teacher</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 transition-all text-lg">×</button>
        </div>

        <div className="flex gap-2 mb-4">
          <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&handleSearch()}
            placeholder="AB12CD34" maxLength={8}
            className="input-field flex-1 rounded-xl px-4 py-3 text-sm font-mono tracking-[0.2em] uppercase" />
          <button onClick={handleSearch} disabled={loading}
            className="btn-primary px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 whitespace-nowrap">
            {loading ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : "Find →"}
          </button>
        </div>

        {error && <div className="mb-4 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">⚠ {error}</div>}

        {quiz && (
          <div className="card-cream p-4 border-indigo-100">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl flex-shrink-0">🎯</div>
              <div>
                <h3 className="font-display font-bold text-stone-900 text-sm">{quiz.title}</h3>
                <p className="text-xs text-stone-400 mt-0.5">{quiz.description || "Test your knowledge"}</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs text-stone-500 mb-4">
              <span>⏱ {quiz.durationMinutes}m</span>
              <span>❓ {quiz.totalQuestions}Q</span>
              <span>⭐ {quiz.totalMarks} marks</span>
            </div>
            <button onClick={() => { onClose(); navigate(`/quiz/${quiz.id}`) }} className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold">Start Quiz →</button>
          </div>
        )}
      </div>
    </div>
  )
}