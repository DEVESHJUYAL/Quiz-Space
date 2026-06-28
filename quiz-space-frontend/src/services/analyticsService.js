import api from "./api"
export const getQuizAnalytics = (quizId) => api.get(`/analytics/quiz/${quizId}`)
