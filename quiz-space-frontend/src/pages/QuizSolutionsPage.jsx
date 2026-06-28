import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getSolutions } from "../services/solutionService"

export default function QuizSolutionsPage() {
  const {quizId}=useParams(),navigate=useNavigate()
  const [solutions,setSolutions]=useState([]),[loading,setLoading]=useState(true),[lightbox,setLightbox]=useState(null)
  useEffect(()=>{getSolutions(quizId).then(r=>setSolutions(r.data)).finally(()=>setLoading(false))},[quizId])

  return(
    <div className="min-h-screen bg-cream-100 grid-pattern">
      <div className="orb w-80 h-80 bg-indigo-200 opacity-20 top-0 right-0" style={{animationDuration:"12s"}}/>
      <div className="navbar px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8L12 4L20 8L12 12L4 8Z" fill="white" fillOpacity="0.9"/><path d="M4 8V14L12 18L20 14V8" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none"/><line x1="20" y1="8" x2="20" y2="14" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/><circle cx="20" cy="15.5" r="1.5" fill="white" opacity="0.8"/></svg></div><span className="font-display text-lg font-semibold text-stone-900">QuizSpace</span></div>
          <button onClick={()=>navigate(-1)} className="text-sm text-stone-400 hover:text-stone-700 transition-colors">← Back</button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-indigo-600 text-xs font-medium mb-5">📖 Solutions</div>
          <h1 className="font-display text-4xl font-bold text-stone-900 mb-2">Quiz Solutions</h1>
          <p className="text-stone-500">Review the correct answers and explanations</p>
        </div>
        {loading&&<div className="flex justify-center py-24"><div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>}
        {!loading&&solutions.length===0&&(
          <div className="card text-center py-24"><div className="text-6xl mb-5">📭</div><h3 className="text-xl font-display font-bold text-stone-800 mb-2">No solutions yet</h3><p className="text-stone-400 text-sm">Your teacher hasn't uploaded solutions yet.</p></div>
        )}
        <div className="space-y-5">
          {solutions.map((sol,i)=>(
            <div key={sol.id} className="card overflow-hidden hover-lift cursor-pointer" onClick={()=>setLightbox(sol)}>
              <div className="relative">
                <img src={sol.imageUrl} alt={sol.caption||`Solution ${i+1}`} className="w-full object-contain max-h-96 bg-stone-50"/>
                <div className="absolute top-3 left-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs text-stone-600 font-medium shadow-soft">{i+1} / {solutions.length}</div>
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-5 transition-all flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 bg-white rounded-full w-12 h-12 flex items-center justify-center text-stone-600 text-xl shadow-lifted">⛶</div>
                </div>
              </div>
              {sol.caption&&<div className="p-4 border-t border-stone-100"><p className="text-sm text-stone-600">{sol.caption}</p></div>}
            </div>
          ))}
        </div>
      </div>
      {lightbox&&(
        <div className="fixed inset-0 bg-stone-900 bg-opacity-85 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={()=>setLightbox(null)}>
          <button className="absolute top-5 right-5 text-white text-3xl w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all">×</button>
          <img src={lightbox.imageUrl} alt="Solution" className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-card-3d" onClick={e=>e.stopPropagation()}/>
        </div>
      )}
    </div>
  )
}