import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { getPublishedQuizzes } from "../services/quizService"
import { getMyAttempts } from "../services/attemptService"
import { useNavigate } from "react-router-dom"
import JoinQuizModal from "../components/JoinQuizModal"
import Navbar from "../components/Navbar"

const CARD_COLORS = [
  { from:"#4F46E5", to:"#7C3AED" },
  { from:"#0891B2", to:"#0E7490" },
  { from:"#059669", to:"#0F766E" },
  { from:"#D97706", to:"#B45309" },
  { from:"#DC2626", to:"#B91C1C" },
  { from:"#7C3AED", to:"#6D28D9" },
]
const ICONS = ["🧠","⚡","🎯","🔮","💡","📚"]

function QuizCard({ quiz, attemptStatus, onStart, onResume, onHistory }) {
  const c    = CARD_COLORS[quiz.id % CARD_COLORS.length]
  const icon = ICONS[quiz.id % ICONS.length]

  const isSubmitted   = attemptStatus === "SUBMITTED" || attemptStatus === "AUTO_SUBMITTED"
  const isInProgress  = attemptStatus === "IN_PROGRESS"
  const isNew         = !attemptStatus

  return (
    <div className="card overflow-hidden hover-lift tilt-card">
      {/* Coloured header */}
      <div className="p-5 relative" style={{background:`linear-gradient(135deg,${c.from},${c.to})`}}>
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='4'/%3E%3C/g%3E%3C/svg%3E\")"}} />

        {/* Status badge */}
        {isSubmitted && (
          <div className="absolute top-3 right-3 bg-white bg-opacity-25 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-white font-medium border border-white border-opacity-30">
            ✓ Done
          </div>
        )}
        {isInProgress && (
          <div className="absolute top-3 right-3 bg-amber-400 bg-opacity-90 rounded-full px-2.5 py-1 text-xs text-white font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
            In Progress
          </div>
        )}

        <div className="relative z-10">
          <div className="text-3xl mb-2">{icon}</div>
          <h3 className="text-white font-display font-bold text-base leading-tight">{quiz.title}</h3>
          <p className="text-white text-opacity-75 text-xs mt-1 line-clamp-1">{quiz.description || "Test your knowledge"}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex gap-3 mb-4">
          {[{icon:"⏱",val:`${quiz.durationMinutes}m`,label:"Duration"},{icon:"❓",val:quiz.totalQuestions,label:"Questions"},{icon:"⭐",val:quiz.totalMarks,label:"Marks"}].map(s => (
            <div key={s.label} className="flex-1 card-inset px-2 py-2 text-center">
              <div className="text-xs font-semibold text-stone-700">{s.icon} {s.val}</div>
              <div className="text-xs text-stone-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-stone-400 mb-3">By {quiz.teacherName}</p>

        {/* Action buttons based on status */}
        {isNew && (
          <button onClick={onStart} className="btn-primary w-full rounded-xl py-2.5 text-sm font-semibold">
            Start Quiz →
          </button>
        )}

        {isInProgress && (
          <div className="space-y-2">
            {/* Prominent resume button */}
            <button onClick={onResume}
              className="w-full rounded-xl py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{background:"linear-gradient(135deg,#D97706,#B45309)",boxShadow:"0 2px 12px rgba(217,119,6,0.35)"}}>
              ⚡ Resume Quiz
            </button>
            <p className="text-xs text-amber-600 text-center">Your previous session was interrupted</p>
          </div>
        )}

        {isSubmitted && (
          <div className="flex gap-2">
            <div className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-400 text-sm text-center font-medium">
              Submitted
            </div>
            <button onClick={onHistory} className="flex-1 btn-secondary rounded-xl py-2.5 text-sm font-medium">
              Results →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [quizzes, setQuizzes]           = useState([])
  // Map of quizId → attempt status ("IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED")
  const [attemptStatusMap, setAttemptStatusMap] = useState({})
  const [loading, setLoading]           = useState(true)
  const [showJoin, setShowJoin]         = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getPublishedQuizzes(), getMyAttempts()])
      .then(([qr, ar]) => {
        setQuizzes(qr.data)
        // Build a map: quizId → most relevant status
        // If multiple attempts exist (shouldn't happen but safe), prefer IN_PROGRESS
        const map = {}
        ar.data.forEach(a => {
          const existing = map[a.quizId]
          // Prefer IN_PROGRESS over any other status
          if (!existing || a.status === "IN_PROGRESS") {
            map[a.quizId] = a.status
          }
        })
        setAttemptStatusMap(map)
      })
      .finally(() => setLoading(false))
  }, [])

  const submitted  = Object.values(attemptStatusMap).filter(s => s === "SUBMITTED" || s === "AUTO_SUBMITTED").length
  const inProgress = Object.values(attemptStatusMap).filter(s => s === "IN_PROGRESS").length
  const total      = quizzes.length
  const remaining  = total - Object.keys(attemptStatusMap).length

  return (
    <div className="min-h-screen bg-cream-100 grid-pattern">
      <div className="orb w-[500px] h-[500px] bg-indigo-200 opacity-25 top-[-100px] right-[-100px]" style={{animationDuration:'14s'}} />
      <div className="orb w-80 h-80 bg-violet-100 opacity-20 bottom-[10%] left-[-60px]" style={{animationDuration:'17s',animationDelay:'-6s'}} />

      <Navbar actions={[
        { label: "+ Join with Code", onClick: () => setShowJoin(true), primary: true },
      ]} />

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-indigo-600 text-xs font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            {inProgress > 0
              ? `${inProgress} quiz${inProgress > 1 ? "zes" : ""} in progress — resume to continue`
              : remaining > 0
              ? `${remaining} quiz${remaining !== 1 ? "zes" : ""} waiting for you`
              : "All quizzes completed!"}
          </div>
          <h1 className="font-display text-4xl font-bold text-stone-900 mb-2">
            Hey, <span className="text-gradient">{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-stone-500">
            {inProgress > 0
              ? "You have an interrupted quiz. Resume it to finish!"
              : "Ready to test your knowledge? Pick a quiz below."}
          </p>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-4 gap-4 max-w-md mb-10">
            {[
              {v:total,         l:"Available",   c:"text-indigo-600"},
              {v:submitted,     l:"Completed",   c:"text-emerald-600"},
              {v:inProgress,    l:"In Progress", c:"text-amber-600"},
              {v:remaining,     l:"Remaining",   c:"text-stone-500"},
            ].map(s => (
              <div key={s.l} className="card p-3 text-center">
                <div className={`text-2xl font-display font-bold ${s.c}`}>{s.v}</div>
                <div className="text-xs text-stone-400 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="card h-64 animate-pulse">
                <div className="h-32 bg-stone-100 rounded-t-2xl" />
              </div>
            ))}
          </div>
        )}

        {!loading && quizzes.length === 0 && (
          <div className="text-center py-28">
            <div className="text-6xl mb-5">📭</div>
            <h3 className="text-xl font-display font-bold text-stone-800 mb-2">No quizzes yet</h3>
            <p className="text-stone-400 text-sm">Your teacher hasn't published any quizzes yet.</p>
          </div>
        )}

        {!loading && quizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quizzes.map(q => (
              <QuizCard
                key={q.id}
                quiz={q}
                attemptStatus={attemptStatusMap[q.id]}
                onStart={()  => navigate(`/quiz/${q.id}`)}
                onResume={()  => navigate(`/quiz/${q.id}`)}
                onHistory={() => navigate("/history")}
              />
            ))}
          </div>
        )}
      </div>

      {showJoin && <JoinQuizModal onClose={() => setShowJoin(false)} />}
    </div>
  )
}