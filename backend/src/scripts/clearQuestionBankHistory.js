import mongoose from 'mongoose'
import { connectDatabase } from '#config/database'
import { QuestionAttempt } from '#modules/questionBank/models/QuestionAttempt.js'
import { QuestionProgress } from '#modules/questionBank/models/QuestionProgress.js'

const apply = process.argv.includes('--apply')

async function main() {
  await connectDatabase()
  const [attempts, progresses] = await Promise.all([
    QuestionAttempt.countDocuments({}),
    QuestionProgress.countDocuments({})
  ])

  console.log(`MODE=${apply ? 'APPLY' : 'DRY_RUN'}`)
  console.log(`QUESTION_ATTEMPTS_MATCHED=${attempts}`)
  console.log(`QUESTION_PROGRESSES_MATCHED=${progresses}`)
  console.log('PRESERVED_COLLECTIONS=questioncategories,questions,questionpapers')

  if (!apply) {
    console.log('当前为 dry-run，未删除数据。确认已有备份后传入 --apply。')
    return
  }

  const [attemptResult, progressResult] = await Promise.all([
    QuestionAttempt.deleteMany({}),
    QuestionProgress.deleteMany({})
  ])
  console.log(`QUESTION_ATTEMPTS_DELETED=${attemptResult.deletedCount}`)
  console.log(`QUESTION_PROGRESSES_DELETED=${progressResult.deletedCount}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
