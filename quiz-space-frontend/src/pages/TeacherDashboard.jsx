import { useEffect, useState } from "react"
import QuizCard from "../components/QuizCard"
import CreateQuizModal from "../components/CreateQuizModal"
import { createQuiz, updateQuiz, getMyQuizzes, publishQuiz, deleteQuiz } from "../services/quizService"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"


export default function TeacherDashboard() {

  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => { fetchQuizzes() }, [])
  const fetchQuizzes = async () => {
    try { const r = await getMyQuizzes(); setQuizzes(r.data) }
    catch { setError("Failed to load quizzes") }
    finally { setLoading(false) }
  }
  const handleCreate = async d => { try { const r = await createQuiz(d); setQuizzes([r.data,...quizzes]) } catch(e) { setError(e.response?.data?.message || "Failed to create quiz") } }
  const handleUpdate = async d => { try { const r = await updateQuiz(editingId,d); setQuizzes(quizzes.map(q=>q.id===editingId?r.data:q)) } catch(e) { setError(e.response?.data?.message || "Failed to update quiz") } }
  const handlePublish = async id => { try { const r = await publishQuiz(id); setQuizzes(quizzes.map(q=>q.id===id?r.data:q)) } catch(e) { setError(e.response?.data?.message || "Failed to publish quiz") } }
  const handleDelete = async id => { if(!window.confirm("Delete this quiz?"))return; try { await deleteQuiz(id); setQuizzes(quizzes.filter(q=>q.id!==id)) } catch(e) { setError(e.response?.data?.message || "Failed to delete quiz") } }
  const openCreate = () => { setEditingId(null); setShowModal(true) }
  const openEdit   = id => { setEditingId(id);   setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditingId(null) }

  const published = quizzes.filter(q=>q.isPublished).length
  const drafts    = quizzes.filter(q=>!q.isPublished).length
  const filtered  = filter==="all"?quizzes:filter==="published"?quizzes.filter(q=>q.isPublished):quizzes.filter(q=>!q.isPublished)

  return (
    <div className="min-h-screen bg-cream-100 grid-pattern">
      <div className="orb w-[500px] h-[500px] bg-indigo-200 opacity-20 top-[-100px] right-[-100px]" style={{animationDuration:'16s'}} />

      <Navbar actions={[{ label:"+ New Quiz", onClick:openCreate, primary:true }]} />

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-indigo-600 text-xs font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"/>Teacher Dashboard
          </div>
          <h1 className="font-display text-4xl font-bold text-stone-900 mb-2">
            My <span className="text-gradient">Quizzes</span>
          </h1>
          <p className="text-stone-500">Create, manage and analyse your quiz collection.</p>
        </div>

        {!loading && (
          <div className="grid grid-cols-3 gap-4 max-w-sm mb-10">
            {[{v:quizzes.length,l:"Total",c:"text-stone-800"},{v:published,l:"Published",c:"text-emerald-600"},{v:drafts,l:"Drafts",c:"text-amber-600"}].map(s=>(
              <div key={s.l} className="card p-4 text-center">
                <div className={`text-2xl font-display font-bold ${s.c}`}>{s.v}</div>
                <div className="text-xs text-stone-400 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {error && <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">{error}</div>}

        {!loading && quizzes.length > 0 && (
          <div className="flex gap-1 mb-6 bg-white border border-stone-200 rounded-xl p-1 w-fit shadow-soft">
            {[["all","All"],["published","Published"],["draft","Drafts"]].map(([val,label])=>(
              <button key={val} onClick={()=>setFilter(val)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter===val?"bg-indigo-600 text-white shadow-sm":"text-stone-500 hover:text-stone-900"}`}>
                {label}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i=><div key={i} className="card h-64 animate-pulse"><div className="h-3 bg-stone-100 rounded m-6 w-2/3"/></div>)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-28">
            <div className="text-6xl mb-5">📝</div>
            <h3 className="text-xl font-display font-bold text-stone-800 mb-2">No quizzes yet</h3>
            <p className="text-stone-400 text-sm mb-8">Create your first quiz to get started</p>
            <button onClick={openCreate} className="btn-primary px-8 py-3 rounded-xl font-semibold text-sm">Create Quiz →</button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(q=><QuizCard key={q.id} quiz={q} onPublish={handlePublish} onDelete={handleDelete} onEdit={openEdit}/>)}
          </div>
        )}
      </div>

      {showModal && (
        editingId
          ? <CreateQuizModal mode="edit" quizId={editingId} onClose={closeModal} onSubmit={handleUpdate}/>
          : <CreateQuizModal mode="create" onClose={closeModal} onSubmit={handleCreate}/>
      )}
    </div>
  )
}