import multer from 'multer'

export const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB

export const SUPPORTED_EXTENSIONS = {
  '.txt': 'txt',
  '.md': 'markdown',
  '.docx': 'docx',
  '.pdf': 'pdf',
  '.pptx': 'pptx',
}

const CODE_EXTENSIONS = new Set([
  '.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.c', '.cpp', '.cs', '.go',
  '.rb', '.php', '.rs', '.swift', '.kt', '.html', '.css', '.json', '.sh',
])

const VIDEO_EXTENSIONS = new Set([
  '.mp4', '.mov', '.avi', '.mkv', '.webm', '.wmv', '.flv',
])

function extOf(filename) {
  const i = filename.lastIndexOf('.')
  return i >= 0 ? filename.slice(i).toLowerCase() : ''
}

export function classifyExtension(filename) {
  const ext = extOf(filename)
  if (VIDEO_EXTENSIONS.has(ext)) return { kind: 'video' }
  if (SUPPORTED_EXTENSIONS[ext]) return { kind: 'supported', type: SUPPORTED_EXTENSIONS[ext] }
  if (CODE_EXTENSIONS.has(ext)) return { kind: 'supported', type: 'code' }
  return { kind: 'unsupported' }
}

const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const classification = classifyExtension(file.originalname)
    if (classification.kind === 'video') {
      cb(apiError('VIDEO_UNSUPPORTED', "Video files aren't supported yet.", "Video files aren't supported yet.", false))
      return
    }
    if (classification.kind === 'unsupported') {
      cb(
        apiError(
          'UNSUPPORTED_FILE_TYPE',
          'Unsupported file type',
          'HumanizeAI currently supports TXT, DOCX, PDF and PPTX files (plus plain text/markdown/code).',
          false,
        ),
      )
      return
    }
    cb(null, true)
  },
})

export function apiError(code, title, message, retryable = false, status = 400) {
  const err = new Error(message)
  err.apiError = { code, title, message, retryable }
  err.status = status
  return err
}
