export default function LoadingSpinner({text="Loading..."}) {
  return(
    <div className="min-h-screen bg-cream-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
        <p className="text-stone-400 text-sm">{text}</p>
      </div>
    </div>
  )
}