import { Question } from '#modules/questionBank/models/Question.js'
import { QuestionAttempt } from '#modules/questionBank/models/QuestionAttempt.js'
import { QuestionPaper } from '#modules/questionBank/models/QuestionPaper.js'
import { QuestionProgress } from '#modules/questionBank/models/QuestionProgress.js'

export async function getQuestionBankOverview(userId) {
  const [questionCount, paperCount, attemptCount, wrongCount, dueCount, scoreStats, recentAttempts] = await Promise.all([
    Question.countDocuments({ status: 'ready' }),
    QuestionPaper.countDocuments({ status: 'ready' }),
    QuestionAttempt.countDocuments({ userId, status: 'submitted' }),
    QuestionProgress.countDocuments({ userId, lastCorrect: false, attempts: { $gt: 0 } }),
    QuestionProgress.countDocuments({ userId, nextReviewAt: { $lte: new Date() } }),
    QuestionAttempt.aggregate([
      { $match: { userId, status: 'submitted' } },
      { $group: { _id: null, averageScore: { $avg: '$totalScore' }, bestScore: { $max: '$totalScore' } } }
    ]),
    QuestionAttempt.find({ userId }).sort({ createdAt: -1 }).limit(5)
  ])
  return {
    questionCount,
    paperCount,
    attemptCount,
    wrongCount,
    dueCount,
    averageScore: Math.round((scoreStats[0]?.averageScore || 0) * 100) / 100,
    bestScore: scoreStats[0]?.bestScore || 0,
    recentAttempts: recentAttempts.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      mode: item.mode,
      status: item.status,
      totalScore: item.totalScore,
      correctCount: item.correctCount,
      questionCount: item.questions.length,
      createdAt: item.createdAt,
      submittedAt: item.submittedAt
    }))
  }
}
