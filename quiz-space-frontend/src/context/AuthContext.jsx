import { createContext, useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

const AuthContext = createContext(null)

function getSavedUser() {
  try {
    const saved = localStorage.getItem("user")
    return saved ? JSON.parse(saved) : null
  } catch {
    // Corrupted localStorage — clear it and start fresh
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser)
  const navigate = useNavigate()

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password })
    localStorage.setItem("token", res.data.token)
    localStorage.setItem("user", JSON.stringify(res.data))
    setUser(res.data)
    navigate(res.data.role === "TEACHER" ? "/dashboard" : "/student")
  }

  const register = async (name, email, password, role) => {
    const res = await api.post("/auth/register", { name, email, password, role })
    localStorage.setItem("token", res.data.token)
    localStorage.setItem("user", JSON.stringify(res.data))
    setUser(res.data)
    navigate(res.data.role === "TEACHER" ? "/dashboard" : "/student")
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    navigate("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)