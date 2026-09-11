export type AppState =
  | 'EMPTY'
  | 'UPLOADING'
  | 'EXTRACTING'
  | 'READY'
  | 'PROCESSING'
  | 'VALIDATING'
  | 'COMPLETED'
  | 'ERROR'

export type HumanizationLevel = 'light' | 'natural' | 'casual' | 'student' | 'professional'

export type ContentSourceType =
  | 'text'
  | 'markdown'
  | 'code'
  | 'txt'
  | 'docx'
  | 'pdf'
  | 'pptx'

export type ProcessingStageKey =
  | 'reading'
  | 'understanding'
  | 'humanizing'
  | 'checking'
  | 'preparing'

export type ProcessingStageStatus = 'done' | 'active' | 'pending'

export interface ProcessingStage {
  key: ProcessingStageKey
  label: string
  status: ProcessingStageStatus
}

export interface HumanizeSettings {
  level: HumanizationLevel
  preserveFormatting: boolean
  preserveFacts: boolean
  protectCode: boolean
}

export interface UploadedFileMeta {
  id: string
  name: string
  size: number
  type: ContentSourceType
  mimeType: string
}

export interface ValidationWarning {
  message: string
}

export interface HumanizeResult {
  original: string
  humanized: string
  warnings: ValidationWarning[]
  contentType: ContentSourceType
  codeProtected: boolean
}

export interface ApiError {
  code: string
  title: string
  message: string
  retryable: boolean
}
