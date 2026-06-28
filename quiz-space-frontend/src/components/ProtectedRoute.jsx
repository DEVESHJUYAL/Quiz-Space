import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    // Send each role to their own home instead of /login (which looks like an error)
    return <Navigate to={user.role === "TEACHER" ? "/dashboard" : "/student"} replace />
  }
  return children
}