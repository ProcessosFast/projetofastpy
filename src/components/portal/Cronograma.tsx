import * as React from 'react'
import { FileDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { allTasksFlat, frentes } from '@/data/frentes'
import { STATUS_LABEL, STATUS_PCT, useTasksStore, type TaskStatus } from '@/hooks/useTasksStore'
import { baixarCronogramaPdf, baixarPlanoDeAcaoPdf } from '@/lib/relatorioPdf'
import { cn } from '@/lib/utils'

const FRENTE_OPTIONS = [
  { id: 'todas', label: 'Todas as frentes' },
  { id: 'frente1', label: 'Frente 1 — Loja FAST' },
  { id: 'frente2', label: 'Frente 2 — Incorporadora' },
  { id: 'frente3', label: 'Frente 3 — MaxSteel' },
]

const STATUS_OPTIONS: { id: 'todas' | TaskStatus; label: string }[] = [
  { id: 'todas', label: 'Todos os status' },
  { id: 'nao_iniciado', label: STATUS_LABEL.nao_iniciado },
  { id: 'em_andamento', label: STATUS_LABEL.em_andamento },
  { id: 'concluido', label: STATUS_LABEL.concluido },
]

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function Cronograma() {
  const { deadlines, setDeadline, owners, setOwner, taskStatus, setTaskStatus } = useTasksStore()
  const [frenteFilter, setFrenteFilter] = React.useState('todas')
  const [statusFilter, setStatusFilter] = React.useState<'todas' | TaskStatus>('todas')
  const [search, setSearch] = React.useState('')
  const [gerando, setGerando] = React.useState<'cronograma' | 'plano' | null>(null)

  const today = todayISO()

  const rows = allTasksFlat
    .map((t) => ({
      ...t,
      status: taskStatus(t.id),
      deadline: deadlines[t.id] ?? '',
      owner: owners[t.id] ?? '',
    }))
    .filter((t) => frenteFilter === 'todas' || t.frenteId === frenteFilter)
    .filter((t) => statusFilter === 'todas' || t.status === statusFilter)
    .filter((t) => {
      const q = search.trim().toLowerCase()
      return !q || t.label.toLowerCase().includes(q) || t.owner.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return a.deadline.localeCompare(b.deadline)
    })

  const allStatuses = allTasksFlat.map((t) => taskStatus(t.id))
  const totalTasks = allTasksFlat.length
  const concluidas = allStatuses.filter((s) => s === 'concluido').length
  const emAndamento = allStatuses.filter((s) => s === 'em_andamento').length
  const atrasadas = allTasksFlat.filter((t) => {
    const dl = deadlines[t.id]
    return dl && dl < today && taskStatus(t.id) !== 'concluido'
  }).length

  const filtrosTexto = [
    FRENTE_OPTIONS.find((o) => o.id === frenteFilter)?.label,
    STATUS_OPTIONS.find((o) => o.id === statusFilter)?.label,
    search.trim() && `busca "${search.trim()}"`,
  ]
    .filter(Boolean)
    .join(', ')

  const gerar = async (tipo: 'cronograma' | 'plano') => {
    setGerando(tipo)
    try {
      if (tipo === 'cronograma') await baixarCronogramaPdf(rows, filtrosTexto)
      else await baixarPlanoDeAcaoPdf(frentes, { taskStatus, deadlines, owners })
    } finally {
      setGerando(null)
    }
  }

  const summary = [
    { label: 'Total de tarefas', value: totalTasks },
    { label: 'Concluídas', value: concluidas },
    { label: 'Em andamento', value: emAndamento },
    { label: 'Atrasadas', value: atrasadas, danger: atrasadas > 0 },
  ]

  return (
    <div className="mx-auto max-w-[1300px] px-8 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
        <h2 className="mb-3 text-[32px] font-extrabold text-white">Cronograma</h2>
        <p className="text-[15px] text-text-dim">
          Prazo, responsável e status de cada tarefa das 3 frentes. Altere diretamente na tabela.
        </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button size="sm" onClick={() => gerar('cronograma')} disabled={gerando !== null}>
            <FileDown className="size-4" />
            {gerando === 'cronograma' ? 'Gerando...' : 'Cronograma (PDF)'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => gerar('plano')} disabled={gerando !== null}>
            <FileDown className="size-4" />
            {gerando === 'plano' ? 'Gerando...' : 'Plano de ação completo (PDF)'}
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} className="p-5 text-center">
            <div
              className={cn(
                'mb-1 text-[26px] font-extrabold',
                s.danger ? 'text-danger' : 'text-fast-red',
              )}
            >
              {s.value}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-text-dim">
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={frenteFilter}
          onChange={(e) => setFrenteFilter(e.target.value)}
          className="h-9 rounded-md border border-line bg-surface-2 px-3 text-[13px] text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50"
        >
          {FRENTE_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'todas' | TaskStatus)}
          className="h-9 rounded-md border border-line bg-surface-2 px-3 text-[13px] text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar tarefa ou responsável..."
          className="h-9 flex-1 rounded-md border border-line bg-surface-2 px-3 text-[13px] text-text placeholder:text-text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-text-dim">
                  Frente
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-text-dim">
                  Tarefa
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-text-dim">
                  Responsável
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-text-dim">
                  Prazo
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-text-dim">
                  Status
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-text-dim">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const isLate = row.deadline && row.deadline < today && row.status !== 'concluido'
                const pct = STATUS_PCT[row.status]
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-line last:border-0',
                      index % 2 === 1 && 'bg-surface-2/40',
                      isLate && 'bg-danger/10',
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 text-text-dim">
                      {row.frenteLabel.replace(/^Frente \d+ — /, '')}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-text">{row.label}</div>
                      <div className="text-[11px] text-text-dim">{row.subfaseTitle}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={row.owner}
                        onChange={(e) => setOwner(row.id, e.target.value)}
                        placeholder="Quem fará?"
                        className="h-8 w-40 rounded-md border border-line bg-surface-2 px-2 text-[12.5px] text-text placeholder:text-text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50"
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <input
                        type="date"
                        value={row.deadline}
                        onChange={(e) => setDeadline(row.id, e.target.value)}
                        className={cn(
                          'h-8 rounded-md border bg-surface-2 px-2 text-[12.5px] text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50',
                          isLate ? 'border-danger/60 text-danger' : 'border-line',
                        )}
                      />
                      {isLate && (
                        <div className="mt-0.5 text-[10.5px] font-bold uppercase text-danger">
                          Atrasada
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <select
                        value={row.status}
                        onChange={(e) => setTaskStatus(row.id, e.target.value as TaskStatus)}
                        className={cn(
                          'h-8 rounded-md border bg-surface-2 px-2 text-[12.5px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50',
                          row.status === 'concluido'
                            ? 'border-success/50 text-success'
                            : row.status === 'em_andamento'
                              ? 'border-fast-red/50 text-fast-red'
                              : 'border-line text-text-dim',
                        )}
                      >
                        {(['nao_iniciado', 'em_andamento', 'concluido'] as TaskStatus[]).map(
                          (s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ),
                        )}
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-black/30">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              row.status === 'concluido' ? 'bg-success' : 'bg-fast-red',
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11.5px] font-bold text-text-dim">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-dim">
                    Nenhuma tarefa encontrada com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
