import * as React from 'react'
import { frentes } from '@/data/frentes'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { deleteFile } from '@/lib/fileStore'

export interface Choice {
  value: string
  label: string
}

export interface ListItem {
  label: string
  fileKey?: string
  fileName?: string
  fileSize?: number
  fileLink?: string
}

export type TaskStatus = 'nao_iniciado' | 'em_andamento' | 'concluido'

export const STATUS_PCT: Record<TaskStatus, number> = {
  nao_iniciado: 0,
  em_andamento: 50,
  concluido: 100,
}

export const STATUS_LABEL: Record<TaskStatus, string> = {
  nao_iniciado: 'Não iniciado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
}

interface TasksStoreValue {
  checked: Record<string, boolean>
  toggleTask: (taskId: string) => void
  isChecked: (taskId: string) => boolean
  choices: Record<string, Choice>
  chooseOption: (context: string, choice: Choice) => void
  clearChoice: (context: string) => void
  lists: Record<string, ListItem[]>
  addListItem: (context: string, item: ListItem) => void
  removeListItem: (context: string, index: number) => void
  frenteStats: (frenteId: string) => { done: number; total: number; pct: number }
  overallStats: () => { done: number; total: number; pct: number }
  deadlines: Record<string, string>
  setDeadline: (taskId: string, date: string) => void
  taskStatus: (taskId: string) => TaskStatus
  setTaskStatus: (taskId: string, status: TaskStatus) => void
}

const TasksStoreContext = React.createContext<TasksStoreValue | null>(null)

const taskIdsByFrente: Record<string, string[]> = Object.fromEntries(
  frentes.map((f) => [f.id, f.subfases.flatMap((s) => s.tasks.map((t) => t.id))]),
)

export function TasksStoreProvider({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useLocalStorage<Record<string, boolean>>(
    'py-portal-checked',
    { 'socio-doc-nicole': true, 'socio-doc-joselio': true },
  )
  const [choices, setChoices] = useLocalStorage<Record<string, Choice>>(
    'py-portal-choices',
    {},
  )
  const [lists, setLists] = useLocalStorage<Record<string, ListItem[]>>('py-portal-lists', {})
  const [deadlines, setDeadlines] = useLocalStorage<Record<string, string>>(
    'py-portal-deadlines',
    {},
  )
  const [statusMap, setStatusMap] = useLocalStorage<Record<string, TaskStatus>>(
    'py-portal-task-status',
    {},
  )

  React.useEffect(() => {
    const SEED_KEY = 'py-portal-seed-assessoria-f1-v2'
    if (window.localStorage.getItem(SEED_KEY)) return
    window.localStorage.setItem(SEED_KEY, 'true')
    setLists((prev) => {
      const next = { ...prev }
      if (!next['assessoria-f1']?.length) {
        next['assessoria-f1'] = [
          {
            label:
              'BKM | Berkemeyer — proposta jurídica (constituição SA/EAS, representação legal, RUC etc.)',
          },
        ]
      }
      if (!next['contabil-f1']?.length) {
        next['contabil-f1'] = [
          {
            label:
              'EFICON — proposta contábil (abertura Gs. 1.800.000 + mensal Gs. 660.000, para Fast Sistemas Construtivos EAS)',
          },
        ]
      }
      if (next['assessoria-f1'].some((p) => p.label.startsWith('EFICON'))) {
        // migrate a stray EFICON entry that was previously seeded under "assessoria"
        next['assessoria-f1'] = next['assessoria-f1'].filter((p) => !p.label.startsWith('EFICON'))
      }
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleTask = React.useCallback(
    (taskId: string) => {
      const next = !checked[taskId]
      setChecked((prev) => ({ ...prev, [taskId]: next }))
      setStatusMap((prev) => ({ ...prev, [taskId]: next ? 'concluido' : 'nao_iniciado' }))
    },
    [checked, setChecked, setStatusMap],
  )

  const isChecked = React.useCallback((taskId: string) => !!checked[taskId], [checked])

  const setDeadline = React.useCallback(
    (taskId: string, date: string) => {
      setDeadlines((prev) => {
        if (!date) {
          const next = { ...prev }
          delete next[taskId]
          return next
        }
        return { ...prev, [taskId]: date }
      })
    },
    [setDeadlines],
  )

  const taskStatus = React.useCallback(
    (taskId: string): TaskStatus => statusMap[taskId] ?? (checked[taskId] ? 'concluido' : 'nao_iniciado'),
    [statusMap, checked],
  )

  const setTaskStatus = React.useCallback(
    (taskId: string, status: TaskStatus) => {
      setStatusMap((prev) => ({ ...prev, [taskId]: status }))
      setChecked((prev) => ({ ...prev, [taskId]: status === 'concluido' }))
    },
    [setStatusMap, setChecked],
  )

  const chooseOption = React.useCallback(
    (context: string, choice: Choice) => {
      setChoices((prev) => ({ ...prev, [context]: choice }))
    },
    [setChoices],
  )

  const clearChoice = React.useCallback(
    (context: string) => {
      setChoices((prev) => {
        const next = { ...prev }
        delete next[context]
        return next
      })
    },
    [setChoices],
  )

  const addListItem = React.useCallback(
    (context: string, item: ListItem) => {
      setLists((prev) => ({ ...prev, [context]: [...(prev[context] ?? []), item] }))
    },
    [setLists],
  )

  const removeListItem = React.useCallback(
    (context: string, index: number) => {
      setLists((prev) => {
        const current = prev[context] ?? []
        const removed = current[index]
        if (removed?.fileKey) void deleteFile(removed.fileKey)
        return { ...prev, [context]: current.filter((_, i) => i !== index) }
      })
    },
    [setLists],
  )

  const frenteStats = React.useCallback(
    (frenteId: string) => {
      const ids = taskIdsByFrente[frenteId] ?? []
      const done = ids.filter((id) => checked[id]).length
      const total = ids.length
      return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
    },
    [checked],
  )

  const overallStats = React.useCallback(() => {
    const ids = Object.values(taskIdsByFrente).flat()
    const done = ids.filter((id) => checked[id]).length
    const total = ids.length
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
  }, [checked])

  const value: TasksStoreValue = {
    checked,
    toggleTask,
    isChecked,
    choices,
    chooseOption,
    clearChoice,
    lists,
    addListItem,
    removeListItem,
    frenteStats,
    overallStats,
    deadlines,
    setDeadline,
    taskStatus,
    setTaskStatus,
  }

  return <TasksStoreContext.Provider value={value}>{children}</TasksStoreContext.Provider>
}

export function useTasksStore() {
  const ctx = React.useContext(TasksStoreContext)
  if (!ctx) throw new Error('useTasksStore must be used within TasksStoreProvider')
  return ctx
}
