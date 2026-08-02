import { fileURLToPath } from 'node:url'
import { connectDatabase, disconnectDatabase } from '#config/database'
import { HN246_BOSS_RESUME, HN246_BOSS_RESUME_VERSION } from '../data/resume/hn246BossResume.js'
import { User } from '#modules/user/models/User.js'
import { Resume } from '#modules/resume/models/Resume.js'
import { ResumeExportRecord } from '#modules/resume/models/ResumeExportRecord.js'
import { ResumeInterview } from '#modules/resume/models/ResumeInterview.js'
import { ResumeMaterial } from '#modules/resume/models/ResumeMaterial.js'
import { normalizeSections } from '#modules/resume/services/resume.utils.js'

function hasFlag(name) {
  return process.argv.includes(name)
}

function getArg(name, fallback = '') {
  const prefix = `${name}=`
  const value = process.argv.find((item) => item.startsWith(prefix))
  return value ? value.slice(prefix.length) : fallback
}

export async function replaceBossResume(options = {}) {
  const apply = options.apply === true
  const ownerEmail = String(options.ownerEmail || 'admin3519463440@qq.com').trim().toLowerCase()
  const owner = await User.findOne({ email: ownerEmail })
  if (!owner) throw new Error(`未找到简历归属用户：${ownerEmail}`)

  const existingResumes = await Resume.find({ ownerId: owner._id }).select('_id title updatedAt')
  const exportCount = await ResumeExportRecord.countDocuments({ ownerId: owner._id })
  const materialCount = await ResumeMaterial.countDocuments({ ownerId: owner._id })
  const summary = {
    mode: apply ? 'apply' : 'dry-run',
    ownerEmail,
    version: HN246_BOSS_RESUME_VERSION,
    targetTitle: HN246_BOSS_RESUME.title,
    before: {
      resumes: existingResumes.map((item) => ({ id: item._id.toString(), title: item.title, updatedAt: item.updatedAt })),
      exports: exportCount,
      materialsPreserved: materialCount
    }
  }

  if (!apply) return summary

  const oldResumeIds = existingResumes.map((item) => item._id)
  const target = await Resume.findOneAndUpdate(
    { ownerId: owner._id, title: HN246_BOSS_RESUME.title },
    {
      $set: {
        ...HN246_BOSS_RESUME,
        ownerId: owner._id,
        sections: normalizeSections(HN246_BOSS_RESUME.sections),
        version: 1
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
  const staleResumeIds = oldResumeIds.filter((id) => !id.equals(target._id))

  const [removedResumes, removedExports, linkCleanup] = await Promise.all([
    Resume.deleteMany({ ownerId: owner._id, _id: { $ne: target._id } }),
    ResumeExportRecord.deleteMany({ ownerId: owner._id }),
    staleResumeIds.length
      ? ResumeInterview.updateMany(
          { ownerId: owner._id, 'links.resumeId': { $in: staleResumeIds } },
          { $pull: { links: { resumeId: { $in: staleResumeIds } } } }
        )
      : Promise.resolve({ modifiedCount: 0 })
  ])

  return {
    ...summary,
    result: {
      resumeId: target._id.toString(),
      removedResumes: removedResumes.deletedCount,
      removedExports: removedExports.deletedCount,
      interviewsUnlinked: linkCleanup.modifiedCount,
      materialsPreserved: materialCount
    }
  }
}

async function main() {
  await connectDatabase()
  try {
    const result = await replaceBossResume({
      apply: hasFlag('--apply'),
      ownerEmail: getArg('--owner-email', 'admin3519463440@qq.com')
    })
    console.log(JSON.stringify(result, null, 2))
  } finally {
    await disconnectDatabase()
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
