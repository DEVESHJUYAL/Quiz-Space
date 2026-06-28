import { useNavigate } from "react-router-dom"

export default function QuizCard({ quiz, onPublish, onDelete, onEdit }) {
  const navigate = useNavigate()
  const isRestricted = quiz.allowedStudentEmails?.length > 0

  return (
    <div className="card overflow-hidden hover-lift">
      <div className={`h-1.5 w-full ${quiz.isPublished ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gradient-to-r from-amber-400 to-orange-400"}`} />
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-bold text-stone-900 text-base pr-2 leading-tight">{quiz.title}</h3>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${quiz.isPublished ? "badge-published" : "badge-draft"}`}>
            {quiz.isPublished ? "● Live" : "○ Draft"}
          </span>
        </div>

        <p className="text-xs font-mono text-indigo-600 mb-2 bg-indigo-50 inline-block px-2 py-0.5 rounded-lg tracking-widest border border-indigo-100">
          {quiz.quizCode}
        </p>

        <p className="text-sm text-stone-400 mb-4 line-clamp-2">{quiz.description || "No description provided"}</p>

        <div className="flex gap-3 text-xs text-stone-400 mb-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400"/>  {quiz.durationMinutes}m</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-400"/> {quiz.totalQuestions}Q</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"/>  {quiz.totalMarks} marks</span>
        </div>

        {isRestricted && (
          <div className="mb-4 text-xs badge-indigo inline-block px-2.5 py-1 rounded-lg">
            🔒 Restricted · {quiz.allowedStudentEmails.length} student{quiz.allowedStudentEmails.length > 1 ? "s" : ""}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {!quiz.isPublished && (
            <>
              <button onClick={() => onEdit(quiz.id)} className="btn-secondary rounded-xl py-2 text-xs font-medium">✏️ Edit</button>
              <button onClick={() => onPublish(quiz.id)}
                className="py-2 rounded-xl text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all">
                🚀 Publish
              </button>
            </>
          )}
          <button onClick={() => navigate(`/submissions/${quiz.id}`)} className="btn-secondary rounded-xl py-2 text-xs font-medium">📋 Submissions</button>
          <button onClick={() => navigate(`/analytics/${quiz.id}`)}
            className="py-2 rounded-xl text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all">
            📊 Analytics
          </button>
          <button onClick={() => onDelete(quiz.id)}
            className="col-span-2 py-2 rounded-xl text-xs font-medium text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-all">
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  )
}