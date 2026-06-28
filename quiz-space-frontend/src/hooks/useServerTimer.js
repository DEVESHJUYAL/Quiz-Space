import { useEffect, useRef, useState } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"

export default function useServerTimer(attemptId, onTimeUp) {
  const [secondsLeft, setSecondsLeft] = useState(null)
  const clientRef  = useRef(null)
  const onTimeUpRef = useRef(onTimeUp)

  // Keep the ref current so the WebSocket callback always calls the latest version
  useEffect(() => { onTimeUpRef.current = onTimeUp }, [onTimeUp])

  useEffect(() => {
    if (!attemptId) return
    const client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws"),
      onConnect: () => {
        client.subscribe(`/topic/attempt/${attemptId}`, (message) => {
          const data = JSON.parse(message.body)
          if (data.event === "TICK")    setSecondsLeft(data.secondsLeft)
          else if (data.event === "TIME_UP") onTimeUpRef.current()   // ← always fresh
        })
      },
      reconnectDelay: 5000,
    })
    client.activate()
    clientRef.current = client
    return () => { if (clientRef.current) clientRef.current.deactivate() }
  }, [attemptId])   // ← only re-run when attemptId changes, not onTimeUp

  const minutes = secondsLeft !== null ? Math.floor(secondsLeft / 60) : null
  const seconds = secondsLeft !== null ? secondsLeft % 60 : null
  return {
    secondsLeft,
    formatted: secondsLeft !== null
      ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : "--:--",
    isWarning: secondsLeft !== null && secondsLeft <= 60,
  }
}