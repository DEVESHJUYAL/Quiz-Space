import api from "./api"

export const startAttempt = (quizId) => api.post(`/attempts/start/${quizId}`)
export const submitAttempt = (data) => api.post("/attempts/submit", data)
export const getResult = (attemptId) => api.get(`/attempts/result/${attemptId}`)
export const getMyAttempts = () => api.get("/attempts/my")
export const getQuizSubmissions = (quizId) => api.get(`/attempts/quiz/${quizId}/submissions`)
