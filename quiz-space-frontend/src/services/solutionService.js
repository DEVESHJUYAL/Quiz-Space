import api from "./api"

export const uploadSolution = (quizId, formData) =>
  api.post(`/solutions/upload/${quizId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
export const getSolutions = (quizId) => api.get(`/solutions/${quizId}`)
export const deleteSolution = (solutionId) => api.delete(`/solutions/${solutionId}`)
