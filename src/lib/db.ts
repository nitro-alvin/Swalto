import type { ExportBundle, ResumeRecord, TemplateId } from '../types/resume'
import { createResumeRecord } from './defaults'
import { nowIso, uid } from './utils'

/**
 * Storage boundary. Everything the UI does goes through `resumeRepo`, which in turn talks to a
 * `StorageAdapter`. Swapping localStorage for a cloud database later means writing one adapter
 * (for example `apiAdapter` calling `/api/resumes`) and passing it to `createRepo` — no UI changes.
 */
export interface StorageAdapter {
  all(): Promise<ResumeRecord[]>
  save(record: ResumeRecord): Promise<void>
  remove(id: string): Promise<void>
  replaceAll(records: ResumeRecord[]): Promise<void>
}

const STORAGE_KEY = 'swalto.resumes.v1'

function isRecord(value: unknown): value is ResumeRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<ResumeRecord>
  return typeof record.id === 'string' && typeof record.name === 'string' && !!record.data
}

function read(): ResumeRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isRecord)
  } catch {
    // Corrupt payload: keep it aside instead of silently destroying the user's data.
    try {
      localStorage.setItem(`${STORAGE_KEY}.corrupt.${Date.now()}`, raw)
    } catch {
      /* storage may be full — nothing else we can do */
    }
    return []
  }
}

function write(records: ResumeRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (error) {
    throw new Error(
      'Your browser could not save the resume. Storage may be full or disabled in private mode.',
      { cause: error },
    )
  }
}

export const localStorageAdapter: StorageAdapter = {
  async all() {
    return read().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },
  async save(record) {
    const records = read()
    const index = records.findIndex((item) => item.id === record.id)
    if (index >= 0) records[index] = record
    else records.push(record)
    write(records)
  },
  async remove(id) {
    write(read().filter((record) => record.id !== id))
  },
  async replaceAll(records) {
    write(records)
  },
}

export type Repo = ReturnType<typeof createRepo>

export function createRepo(adapter: StorageAdapter) {
  return {
    async list(): Promise<ResumeRecord[]> {
      return adapter.all()
    },
    async get(id: string): Promise<ResumeRecord | undefined> {
      const records = await adapter.all()
      return records.find((record) => record.id === id)
    },
    async create(name?: string, template?: TemplateId): Promise<ResumeRecord> {
      const record = createResumeRecord(name, template)
      await adapter.save(record)
      return record
    },
    async update(record: ResumeRecord): Promise<ResumeRecord> {
      const next = { ...record, updatedAt: nowIso() }
      await adapter.save(next)
      return next
    },
    async rename(id: string, name: string): Promise<void> {
      const record = await this.get(id)
      if (!record) throw new Error('That resume no longer exists.')
      await adapter.save({ ...record, name: name.trim() || record.name, updatedAt: nowIso() })
    },
    async duplicate(id: string): Promise<ResumeRecord> {
      const record = await this.get(id)
      if (!record) throw new Error('That resume no longer exists.')
      const timestamp = nowIso()
      const copy: ResumeRecord = {
        ...structuredClone(record),
        id: uid('resume'),
        name: `${record.name} (copy)`,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      await adapter.save(copy)
      return copy
    },
    async remove(id: string): Promise<void> {
      await adapter.remove(id)
    },
    async exportAll(): Promise<ExportBundle> {
      return {
        app: 'swalto',
        version: 1,
        exportedAt: nowIso(),
        resumes: await adapter.all(),
      }
    },
    /** Merge an imported bundle; records with an existing id are replaced. */
    async importBundle(bundle: unknown): Promise<{ imported: number; skipped: number }> {
      if (!bundle || typeof bundle !== 'object') throw new Error('That file is not a Swalto export.')
      const parsed = bundle as Partial<ExportBundle>
      // 'resumeforge' is accepted so backups made before the rename still import.
      const appId = (bundle as { app?: unknown }).app
      if ((appId !== 'swalto' && appId !== 'resumeforge') || !Array.isArray(parsed.resumes)) {
        throw new Error('That file is not a Swalto export.')
      }
      const incoming = parsed.resumes.filter(isRecord)
      if (!incoming.length && parsed.resumes.length) {
        throw new Error('The export contained no readable resumes.')
      }
      const existing = await adapter.all()
      const byId = new Map(existing.map((record) => [record.id, record]))
      for (const record of incoming) byId.set(record.id, record)
      await adapter.replaceAll([...byId.values()])
      return { imported: incoming.length, skipped: parsed.resumes.length - incoming.length }
    },
  }
}

export const resumeRepo = createRepo(localStorageAdapter)

/**
 * Early builds stored data under `resumeforge.*` keys. Copy anything found there to the Swalto
 * keys once, so resumes saved before the rename are not lost.
 */
export function migrateLegacyStorage(): void {
  const pairs: Array<[string, string]> = [
    ['resumeforge.resumes.v1', 'swalto.resumes.v1'],
    ['resumeforge.theme', 'swalto.theme'],
    ['resumeforge.jobDescription', 'swalto.jobDescription'],
  ]
  try {
    for (const [legacyKey, currentKey] of pairs) {
      const value = localStorage.getItem(legacyKey)
      if (value !== null && localStorage.getItem(currentKey) === null) {
        localStorage.setItem(currentKey, value)
      }
    }
  } catch {
    /* storage unavailable: the app still works for this session */
  }
}
