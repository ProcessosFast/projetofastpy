import * as React from 'react'
import { FileDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Frente } from '@/data/frentes'
import { useTasksStore, type Plano5w2hField } from '@/hooks/useTasksStore'
import { baixar5w2hPdf } from '@/lib/relatorioPdf'
import { cn } from '@/lib/utils'

const fieldClass =
  'w-full rounded-md border border-line bg-surface-2 px-2 py-1.5 text-[12.5px] text-text placeholder:text-text-dim/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50'

const COLUMNS = [
  { key: 'what', title: 'O quê', hint: 'What', width: 'w-[240px]' },
  { key: 'why', title: 'Por quê', hint: 'Why', width: 'w-[190px]' },
  { key: 'where', title: 'Onde', hint: 'Where', width: 'w-[140px]' },
  { key: 'when', title: 'Quando', hint: 'When', width: 'w-[140px]' },
  { key: 'who', title: 'Quem', hint: 'Who', width: 'w-[150px]' },
  { key: 'how', title: 'Como', hint: 'How', width: 'w-[210px]' },
  { key: 'howMuch', title: 'Quanto', hint: 'How much', width: 'w-[130px]' },
] as const

export function Plano5w2h({ frente }: { frente: Frente }) {
  const {
    deadlines,
    setDeadline,
    owners,
    setOwner,
    plano5w2h,
    setPlano5w2h,
    taskStatus,
  } = useTasksStore()
  const [gerando, setGerando] = React.useState(false)

  const text = (taskId: string, field: Plano5w2hField) => plano5w2h[taskId]?.[field] ?? ''

  const textArea = (taskId: string, field: Plano5w2hField, placeholder: string) => (
    <textarea
      rows={2}
      value={text(taskId, field)}
      onChange={(e) => setPlano5w2h(taskId, field, e.target.value)}
      placeholder={placeholder}
      className={cn(fieldClass, 'resize-y leading-snug')}
    />
  )

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="mb-2 text-[22px] font-extrabold text-white">5W2H — {frente.navLabel}</h3>
          <p className="text-[15px] text-text-dim">
            Plano de ação de cada tarefa. "Quando" e "Quem" são os mesmos do Cronograma; os demais
            campos salvam automaticamente para todos.
          </p>
        </div>
        <Button
          size="sm"
          className="shrink-0"
          disabled={gerando}
          onClick={async () => {
            setGerando(true)
            try {
              await baixar5w2hPdf(frente, { taskStatus, deadlines, owners, plano5w2h })
            } finally {
              setGerando(false)
            }
          }}
        >
          <FileDown className="size-4" />
          {gerando ? 'Gerando...' : '5W2H (PDF)'}
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                {COLUMNS.map((col) => (
                  <th key={col.key} className={cn('px-3 py-3 align-bottom', col.width)}>
                    <div className="text-[11px] font-bold uppercase tracking-wide text-text">
                      {col.title}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-text-dim">
                      {col.hint}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {frente.subfases.map((subfase) => (
                <React.Fragment key={subfase.title}>
                  <tr className="border-b border-line bg-fast-red/10">
                    <td
                      colSpan={COLUMNS.length}
                      className="px-3 py-2 text-[12px] font-extrabold uppercase tracking-wide text-fast-red"
                    >
                      {subfase.title}
                    </td>
                  </tr>
                  {subfase.tasks.length === 0 && (
                    <tr className="border-b border-line">
                      <td colSpan={COLUMNS.length} className="px-3 py-3 text-text-dim">
                        Atividades a definir.
                      </td>
                    </tr>
                  )}
                  {subfase.tasks.map((task) => {
                    const done = taskStatus(task.id) === 'concluido'
                    return (
                      <tr key={task.id} className="border-b border-line align-top last:border-0">
                        <td className="px-3 py-2.5">
                          <div
                            className={cn(
                              'font-semibold',
                              done ? 'text-text-dim line-through' : 'text-text',
                            )}
                          >
                            {task.label}
                          </div>
                          {task.description && (
                            <div className="mt-0.5 text-[11px] leading-snug text-text-dim">
                              {task.description}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5">{textArea(task.id, 'why', 'Motivo / objetivo')}</td>
                        <td className="px-3 py-2.5">
                          <input
                            type="text"
                            value={text(task.id, 'where')}
                            onChange={(e) => setPlano5w2h(task.id, 'where', e.target.value)}
                            placeholder="Local / área"
                            className={fieldClass}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="date"
                            value={deadlines[task.id] ?? ''}
                            onChange={(e) => setDeadline(task.id, e.target.value)}
                            className={fieldClass}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="text"
                            value={owners[task.id] ?? ''}
                            onChange={(e) => setOwner(task.id, e.target.value)}
                            placeholder="Responsável"
                            className={fieldClass}
                          />
                        </td>
                        <td className="px-3 py-2.5">{textArea(task.id, 'how', 'Etapas / método')}</td>
                        <td className="px-3 py-2.5">
                          <input
                            type="text"
                            value={text(task.id, 'howMuch')}
                            onChange={(e) => setPlano5w2h(task.id, 'howMuch', e.target.value)}
                            placeholder="Custo"
                            className={fieldClass}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
