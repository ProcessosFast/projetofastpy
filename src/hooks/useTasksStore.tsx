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

  React.useEffect(() => {
    const SEED_KEY = 'py-portal-seed-assessoria-f1-v1'
    if (window.localStorage.getItem(SEED_KEY)) return
    window.localStorage.setItem(SEED_KEY, 'true')
    setLists((prev) => {
      if (prev['assessoria-f1']?.length) return prev
      return {
        ...prev,
        'assessoria-f1': [
          {
            label:
              'BKM | Berkemeyer — proposta jurídica (constituição SA/EAS, representação legal, RUC etc.)',
          },
          {
            label:
              'EFICON — proposta contábil (abertura Gs. 1.800.000 + mensal Gs. 660.000, para Fast Sistemas Construtivos EAS)',
          },
        ],
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleTask = React.useCallback(
    (taskId: string) => {
      setChecked((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
    },
    [setChecked],
  )

  const isChecked = React.useCallback((taskId: string) => !!checked[taskId], [checked])

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
  }

  return <TasksStoreContext.Provider value={value}>{children}</TasksStoreContext.Provider>
}

export function useTasksStore() {
  const ctx = React.useContext(TasksStoreContext)
  if (!ctx) throw new Error('useTasksStore must be used within TasksStoreProvider')
  return ctx
}
