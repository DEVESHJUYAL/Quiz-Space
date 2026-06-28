import { useEffect, useRef } from "react"

const MAX_VIOLATIONS = 3

export default function useAntiCheat(onViolation, onForceSubmit, onFullscreenLost) {
  const tabSwitchCount        = useRef(0)
  const fullscreenExits       = useRef(0)
  const devtoolsCount         = useRef(0)
  const rightClickCount       = useRef(0)
  const inFsTransition        = useRef(false)   // prevents blur double-counting

  useEffect(() => {
    const el = document.documentElement

    const enterFullscreen = () => {
      inFsTransition.current = true
      const p = el.requestFullscreen
        ? el.requestFullscreen()
        : el.webkitRequestFullscreen
        ? (el.webkitRequestFullscreen(), Promise.resolve())
        : Promise.resolve()
      p.catch(() => {}).finally(() =>
        setTimeout(() => { inFsTransition.current = false }, 600)
      )
    }

    enterFullscreen()

    const onVisibility = () => {
      if (!document.hidden) return
      tabSwitchCount.current++
      const c = tabSwitchCount.current
      onViolation("tab_switch", c)
      if (c >= MAX_VIOLATIONS) onForceSubmit("tab_switch", c)
    }

    const onFullscreenChange = () => {
      if (document.fullscreenElement) {
        inFsTransition.current = false
        onFullscreenLost && onFullscreenLost(false)
        return
      }
      fullscreenExits.current++
      const c = fullscreenExits.current
      onViolation("fullscreen_exit", c)
      if (c >= MAX_VIOLATIONS) {
        onForceSubmit("fullscreen_exit", c)
      } else {
        onFullscreenLost && onFullscreenLost(true, enterFullscreen)
      }
    }

    const onWindowBlur = () => {
      if (document.hidden) return
      if (inFsTransition.current) return   // ← key fix: skip blur during fullscreen change
      tabSwitchCount.current++
      const c = tabSwitchCount.current
      onViolation("tab_switch", c)
      if (c >= MAX_VIOLATIONS) onForceSubmit("tab_switch", c)
    }

    const noContextMenu = (e) => {
      e.preventDefault()
      rightClickCount.current++
      onViolation("right_click", rightClickCount.current)
    }

    const noClipboard = (e) => e.preventDefault()

    const noKey = (e) => {
      const k = e.key.toLowerCase()
      if (e.key === "F12") { e.preventDefault(); devtoolsCount.current++; onViolation("devtools", devtoolsCount.current); return }
      if (e.ctrlKey && e.shiftKey && ["i","j","c","k"].includes(k)) { e.preventDefault(); devtoolsCount.current++; onViolation("devtools", devtoolsCount.current); return }
      if (e.ctrlKey && ["c","v","x","a","u","s","p"].includes(k)) { e.preventDefault(); return }
      if (e.key === "Meta" || e.key === "OS") { e.preventDefault(); return }
      if (e.altKey) { e.preventDefault(); return }
      if (e.key === "PrintScreen") { e.preventDefault(); onViolation("screenshot", 1); return }
    }

    const devtoolsInterval = setInterval(() => {
      if (inFsTransition.current) return
      const wDiff = Math.abs(window.outerWidth  - window.innerWidth)
      const hDiff = Math.abs(window.outerHeight - window.innerHeight)
      if (wDiff > 160 || hDiff > 160) { devtoolsCount.current++; onViolation("devtools", devtoolsCount.current) }
    }, 2000)

    const beforePrint = () => { onViolation("screenshot", 1); window.print = () => {} }

    document.onselectstart = (e) => e.preventDefault()
    document.ondragstart   = (e) => e.preventDefault()

    document.addEventListener("visibilitychange", onVisibility)
    document.addEventListener("fullscreenchange", onFullscreenChange)
    document.addEventListener("contextmenu",      noContextMenu)
    document.addEventListener("copy",             noClipboard)
    document.addEventListener("paste",            noClipboard)
    document.addEventListener("cut",              noClipboard)
    document.addEventListener("keydown",          noKey)
    document.addEventListener("beforeprint",      beforePrint)
    window.addEventListener("blur",               onWindowBlur)

    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      document.removeEventListener("fullscreenchange", onFullscreenChange)
      document.removeEventListener("contextmenu",      noContextMenu)
      document.removeEventListener("copy",             noClipboard)
      document.removeEventListener("paste",            noClipboard)
      document.removeEventListener("cut",              noClipboard)
      document.removeEventListener("keydown",          noKey)
      document.removeEventListener("beforeprint",      beforePrint)
      window.removeEventListener("blur",               onWindowBlur)
      document.onselectstart = null
      document.ondragstart   = null
      clearInterval(devtoolsInterval)
      if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen()
    }
  }, [])

  return { tabSwitchCount, fullscreenExits, devtoolsCount }
}