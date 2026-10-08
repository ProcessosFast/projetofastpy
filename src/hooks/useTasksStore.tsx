import * as React from 'react'
import { frentes } from '@/data/frentes'
import { deleteFile } from '@/lib/fileStore'
import { registerMigration, useSharedRecord } from '@/lib/sharedState'

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

export type Plano5w2hField = 'why' | 'where' | 'how' | 'howMuch'
export type Plano5w2h = Partial<Record<Plano5w2hField, string>>

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
  owners: Record<string, string>
  setOwner: (taskId: string, owner: string) => void
  plano5w2h: Record<string, Plano5w2h>
  setPlano5w2h: (taskId: string, field: Plano5w2hField, value: string) => void
  taskStatus: (taskId: string) => TaskStatus
  setTaskStatus: (taskId: string, status: TaskStatus) => void
}

const TasksStoreContext = React.createContext<TasksStoreValue | null>(null)

const taskIdsByFrente: Record<string, string[]> = Object.fromEntries(
  frentes.map((f) => [f.id, f.subfases.flatMap((s) => s.tasks.map((t) => t.id))]),
)

// Ajustes que antes eram aplicados por navegador ("checks oficiais"). Agora rodam
// uma única vez, quando os dados locais sobem para o banco compartilhado.
const LEGACY_SEEDS: [string, (d: Record<string, Record<string, unknown>>) => void][] = [
  [
    'py-portal-seed-assessoria-f1-v2',
    (d) => {
      const lists = d.lists as Record<string, ListItem[]>
      if (!lists['assessoria-f1']?.length) {
        lists['assessoria-f1'] = [
          {
            label:
              'BKM | Berkemeyer — proposta jurídica (constituição SA/EAS, representação legal, RUC etc.)',
          },
        ]
      }
      if (!lists['contabil-f1']?.length) {
        lists['contabil-f1'] = [
          {
            label:
              'EFICON — proposta contábil (abertura Gs. 1.800.000 + mensal Gs. 660.000, para Fast Sistemas Construtivos EAS)',
          },
        ]
      }
      lists['assessoria-f1'] = lists['assessoria-f1'].filter((p) => !p.label.startsWith('EFICON'))
    },
  ],
  [
    'py-portal-seed-bkm-contrato-v1',
    (d) => {
      const bkmLabelF1 =
        'BKM | Berkemeyer — proposta jurídica (constituição SA/EAS, representação legal, RUC etc.)'
      const bkmLabelF3 =
        'BKM | Berkemeyer — contrato assinado 08/09/2026 (estruturação jurídica/tributária MaxSteel Paraguai)'
      const lists = d.lists as Record<string, ListItem[]>
      if (!lists['assessoria-f3']?.some((p) => p.label.startsWith('BKM'))) {
        lists['assessoria-f3'] = [...(lists['assessoria-f3'] ?? []), { label: bkmLabelF3 }]
      }
      Object.assign(d.choices, {
        'assessoria-f1': { value: bkmLabelF1, label: bkmLabelF1 },
        'assessoria-f3': { value: bkmLabelF3, label: bkmLabelF3 },
      })
      markDone(d, ['f1-assessoria', 'f3-assessoria'])
      Object.assign(d.deadlines, {
        'f1-bkm-dados': '2026-09-12',
        'f1-bkm-reuniao1': '2026-09-16',
        'f1-bkm-parecer': '2026-09-30',
        'f1-bkm-retainer': '2026-10-01',
        'f3-bkm-dados': '2026-09-12',
        'f3-bkm-reuniao1': '2026-09-16',
        'f3-bkm-parecer': '2026-09-30',
        'f3-bkm-retainer': '2026-10-01',
      })
    },
  ],
  ['py-portal-seed-imovel-f1-v1', (d) => markDone(d, ['f1-17', 'f1-18'])],
  [
    'py-portal-seed-bkm-etapas-v1',
    (d) => markDone(d, ['f1-bkm-dados', 'f1-bkm-reuniao1', 'f3-bkm-dados', 'f3-bkm-reuniao1']),
  ],
  ['py-portal-seed-pbw-f1-v1', (d) => markDone(d, ['f1-27'])],
]

function markDone(d: Record<string, Record<string, unknown>>, ids: string[]) {
  ids.forEach((id) => {
    d.checked[id] = true
    d.status[id] = 'concluido'
  })
}

registerMigration((d) => {
  LEGACY_SEEDS.forEach(([key, apply]) => {
    if (window.localStorage.getItem(key)) return
    window.localStorage.setItem(key, 'true')
    apply(d)
  })
})

export function TasksStoreProvider({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useSharedRecord<boolean>('checked', 'py-portal-checked', {
    'socio-doc-nicole': true,
    'socio-doc-joselio': true,
  })
  const [choices, setChoices] = useSharedRecord<Choice>('choices', 'py-portal-choices', {})
  const [lists, setLists] = useSharedRecord<ListItem[]>('lists', 'py-portal-lists', {})
  const [deadlines, setDeadlines] = useSharedRecord<string>('deadlines', 'py-portal-deadlines', {})
  const [owners, setOwners] = useSharedRecord<string>('owners', 'py-portal-owners', {
    'f1-estrutura-sistemica': 'Marcelo / Guilherme',
  })
  const [plano5w2h, setPlano5w2hMap] = useSharedRecord<Plano5w2h>(
    'plano5w2h',
    'py-portal-5w2h',
    {},
  )
  const [statusMap, setStatusMap] = useSharedRecord<TaskStatus>(
    'status',
    'py-portal-task-status',
    {},
  )

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

  const setOwner = React.useCallback(
    (taskId: string, owner: string) => {
      setOwners((prev) => {
        if (!owner.trim()) {
          const next = { ...prev }
          delete next[taskId]
          return next
        }
        return { ...prev, [taskId]: owner }
      })
    },
    [setOwners],
  )

  const setPlano5w2h = React.useCallback(
    (taskId: string, field: Plano5w2hField, value: string) => {
      setPlano5w2hMap((prev) => {
        const entry = { ...prev[taskId], [field]: value }
        if (!value) delete entry[field]
        const next = { ...prev }
        if (Object.keys(entry).length) next[taskId] = entry
        else delete next[taskId]
        return next
      })
    },
    [setPlano5w2hMap],
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
    owners,
    setOwner,
    plano5w2h,
    setPlano5w2h,
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
