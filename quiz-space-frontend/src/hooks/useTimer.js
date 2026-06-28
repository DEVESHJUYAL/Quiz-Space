import { useState, useEffect, useRef } from "react"

export default function useTimer(durationMinutes, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); onExpire(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  return {
    secondsLeft,
    formatted: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    isWarning: secondsLeft <= 60
  }
}
