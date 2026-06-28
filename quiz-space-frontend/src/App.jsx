import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ErrorBoundary from "./components/ErrorBoundary"
import ProtectedRoute from "./components/ProtectedRoute"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import TeacherDashboard from "./pages/TeacherDashboard"
import StudentDashboard from "./pages/StudentDashboard"
import QuizAttemptPage from "./pages/QuizAttemptPage"
import ResultPage from "./pages/ResultPage"
import QuizSubmissionsPage from "./pages/QuizSubmissionsPage"
import QuizSolutionsPage from "./pages/QuizSolutionsPage"
import AttemptHistoryPage from "./pages/AttemptHistoryPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import NotFoundPage from "./pages/NotFoundPage"
import HomeRoute from "./components/HomeRoute"

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute role="TEACHER"><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/student" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/quiz/:id" element={<ProtectedRoute role="STUDENT"><QuizAttemptPage /></ProtectedRoute>} />
            <Route path="/result/:attemptId" element={<ProtectedRoute role="STUDENT"><ResultPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute role="STUDENT"><AttemptHistoryPage /></ProtectedRoute>} />
            <Route path="/solutions/:quizId" element={<ProtectedRoute role="STUDENT"><QuizSolutionsPage /></ProtectedRoute>} />
            <Route path="/submissions/:quizId" element={<ProtectedRoute role="TEACHER"><QuizSubmissionsPage /></ProtectedRoute>} />
            <Route path="/analytics/:quizId" element={<ProtectedRoute role="TEACHER"><AnalyticsPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App