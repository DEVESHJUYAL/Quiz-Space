import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import LandingPage from "../pages/LandingPage"

export default function HomeRoute() {
  const { user } = useAuth()
  if (user) return <Navigate to={user.role === "TEACHER" ? "/dashboard" : "/student"} replace />
  return <LandingPage />
}