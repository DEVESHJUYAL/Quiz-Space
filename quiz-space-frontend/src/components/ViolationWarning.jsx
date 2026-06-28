import { useEffect, useState } from "react"
const MSGS = {
  tab_switch:      { icon:"⚠️", title:"Tab Switch Detected",     sub:"Stay on this page during the quiz." },
  fullscreen_exit: { icon:"🖥️", title:"Fullscreen Exit Detected", sub:"You must stay in fullscreen mode." },
  right_click:     { icon:"🖱️", title:"Right-click Blocked",      sub:"Right-clicking is disabled." },
  devtools:        { icon:"🔧", title:"DevTools Detected",        sub:"Browser tools are not allowed." },
  screenshot:      { icon:"📸", title:"Screenshot Blocked",       sub:"Screenshots are not allowed." },
}
export default function ViolationWarning({ type, count, onDismiss }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(!!type) }, [type])
  if (!type) return null
  const msg = MSGS[type] || { icon:"⚠️", title:"Violation Detected", sub:"This action is not allowed." }
  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${visible?"opacity-100 translate-y-0":"opacity-0 -translate-y-3"}`}>
      <div className="flex items-center gap-3 pl-4 pr-3 py-3.5 rounded-2xl bg-white border border-rose-200 shadow-lifted">
        <span className="text-xl">{msg.icon}</span>
        <div>
          <p className="text-sm font-semibold text-rose-700">{msg.title} <span className="font-mono text-rose-500 text-xs">(×{count})</span></p>
          <p className="text-xs text-rose-400 mt-0.5">{msg.sub}</p>
        </div>
        <button onClick={onDismiss} className="ml-1 text-stone-300 hover:text-stone-600 text-xl w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-all">×</button>
      </div>
    </div>
  )
}