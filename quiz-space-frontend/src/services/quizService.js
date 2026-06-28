import api from "./api"

export const createQuiz = (quizData) => api.post("/quizzes", quizData)
export const updateQuiz = (id, quizData) => api.put(`/quizzes/${id}`, quizData)
export const getQuizForEdit = (id) => api.get(`/quizzes/${id}/edit`)
export const getMyQuizzes = () => api.get("/quizzes/my")
export const getQuizById = (id) => api.get(`/quizzes/${id}`)
export const getPublishedQuizzes = () => api.get("/quizzes/published")
export const getQuizByCode = (code) => api.get(`/quizzes/code/${code}`)
export const publishQuiz = (id) => api.put(`/quizzes/${id}/publish`)
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`)