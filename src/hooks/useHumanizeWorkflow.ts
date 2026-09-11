import { useCallback, useRef, useState } from 'react'
import * as api from '../services/api'
import type {
  ApiError,
  AppState,
  ContentSourceType,
  HumanizeResult,
  HumanizeSettings,
  ProcessingStage,
  UploadedFileMeta,
} from '../utils/types'

const STAGE_LABELS: Record<ProcessingStage['key'], string> = {
  reading: 'Reading content',
  understanding: 'Understanding context',
  humanizing: 'Humanizing content',
  checking: 'Checking preservation',
  preparing: 'Preparing output',
}

const STAGE_ORDER: ProcessingStage['key'][] = [
  'reading',
  'understanding',
  'humanizing',
  'checking',
  'preparing',
]

function buildStages(activeIndex: number): ProcessingStage[] {
  return STAGE_ORDER.map((key, i) => ({
    key,
    label: STAGE_LABELS[key],
    status: i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending',
  }))
}

export const DEFAULT_SETTINGS: HumanizeSettings = {
  level: 'natural',
  preserveFormatting: true,
  preserveFacts: true,
  protectCode: true,
}

export function useHumanizeWorkflow() {
  const [state, setState] = useState<AppState>('EMPTY')
  const [fileMeta, setFileMeta] = useState<UploadedFileMeta | null>(null)
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState<ContentSourceType>('text')
  const [settings, setSettings] = useState<HumanizeSettings>(DEFAULT_SETTINGS)
  const [stages, setStages] = useState<ProcessingStage[]>(buildStages(0))
  const [result, setResult] = useState<HumanizeResult | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const stageTimer = useRef<number | null>(null)

  const reset = useCallback(() => {
    if (stageTimer.current) window.clearInterval(stageTimer.current)
    setState('EMPTY')
    setFileMeta(null)
    setContent('')
    setContentType('text')
    setResult(null)
    setError(null)
    setStages(buildStages(0))
  }, [])

  const setPastedText = useCallback((text: string, type: ContentSourceType = 'text') => {
    setFileMeta(null)
    setContent(text)
    setContentType(type)
    setError(null)
    setState(text.trim().length > 0 ? 'READY' : 'EMPTY')
  }, [])

  const uploadFile = useCallback(async (file: File) => {
    setState('UPLOADING')
    setError(null)
    try {
      setState('EXTRACTING')
      const { meta, text } = await api.uploadFile(file)
      setFileMeta(meta)
      setContent(text)
      setContentType(meta.type)
      setState('READY')
    } catch (err) {
      setError(err as ApiError)
      setState('ERROR')
    }
  }, [])

  const removeFile = useCallback(() => {
    reset()
  }, [reset])

  const runHumanize = useCallback(async () => {
    if (!content.trim()) return
    setState('PROCESSING')
    setError(null)
    let idx = 0
    setStages(buildStages(0))
    stageTimer.current = window.setInterval(() => {
      idx = Math.min(idx + 1, STAGE_ORDER.length - 1)
      setStages(buildStages(idx))
    }, 550)

    try {
      const res = await api.humanize({ content, contentType, settings })
      if (stageTimer.current) window.clearInterval(stageTimer.current)
      setStages(buildStages(STAGE_ORDER.length))
      setState('VALIDATING')
      setResult(res)
      window.setTimeout(() => setState('COMPLETED'), 300)
    } catch (err) {
      if (stageTimer.current) window.clearInterval(stageTimer.current)
      setError(err as ApiError)
      setState('ERROR')
    }
  }, [content, contentType, settings])

  const updateHumanized = useCallback((text: string) => {
    setResult((r) => (r ? { ...r, humanized: text } : r))
  }, [])

  const retry = useCallback(() => {
    if (fileMeta) {
      setState('READY')
    } else {
      setState(content.trim() ? 'READY' : 'EMPTY')
    }
    setError(null)
  }, [content, fileMeta])

  return {
    state,
    fileMeta,
    content,
    contentType,
    settings,
    stages,
    result,
    error,
    setSettings,
    setPastedText,
    uploadFile,
    removeFile,
    runHumanize,
    updateHumanized,
    retry,
    reset,
  }
}
