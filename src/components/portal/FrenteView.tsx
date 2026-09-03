import * as React from 'react'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChecklistSection } from '@/components/portal/ChecklistSection'
import { FluxogramaFrente } from '@/components/portal/FluxogramaFrente'
import type { Frente, InfoModal } from '@/data/frentes'
import { useTasksStore } from '@/hooks/useTasksStore'
import { cn } from '@/lib/utils'

interface FrenteViewProps {
  frente: Frente
  onOpenInfo: (modal: InfoModal, context?: string) => void
}

export function FrenteView({ frente, onOpenInfo }: FrenteViewProps) {
  const { frenteStats } = useTasksStore()
  const { done, total, pct } = frenteStats(frente.id)
  const [view, setView] = React.useState<'checklist' | 'mapa'>('checklist')

  React.useEffect(() => {
    setView('checklist')
  }, [frente.id])

  const stats = [
    { number: done, label: 'Concluído' },
    { number: total, label: 'Total' },
    { number: `${pct}%`, label: 'Progresso' },
    { number: frente.subfases.length, label: 'Subfases' },
  ]

  return (
    <div className="mx-auto max-w-[1200px] px-8 py-12">
      <div className="mb-12">
        <h2 className="mb-4 text-[32px] font-extrabold text-white">
          {frente.title}
        </h2>
        <p className="text-[15px] text-text-dim">
          {frente.subtitle} | {frente.meta}
        </p>
      </div>

      <Card
        className={cn(
          'mb-10 border-l-[6px] p-8',
          frente.danger ? 'border-l-danger bg-[#2a1414]' : 'border-l-fast-red',
        )}
      >
        <p>
          <strong className={frente.danger ? 'text-[#f87171]' : 'text-fast-red'}>
            📍 Status:
          </strong>{' '}
          {frente.status} | <strong className={frente.danger ? 'text-[#f87171]' : 'text-fast-red'}>Meta:</strong> {frente.meta.replace('Meta: ', '')}
        </p>
        <p className="mt-3">
          <strong className={frente.danger ? 'text-[#f87171]' : 'text-fast-red'}>
            🚨 {frente.danger ? 'Bloqueadores críticos' : 'Gargalo crítico'}:
          </strong>{' '}
          {frente.blocker}
        </p>
      </Card>

      <div className="mb-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className={cn(
              'p-6 text-center hover:-translate-y-[3px]',
              frente.danger
                ? 'hover:border-danger hover:shadow-[0_8px_20px_rgba(220,38,38,0.3)]'
                : 'hover:border-fast-red hover:shadow-[0_8px_20px_rgba(196,30,58,0.3)]',
            )}
          >
            <div
              className={cn(
                'mb-2 text-[32px] font-extrabold',
                frente.danger ? 'text-danger' : 'text-fast-red',
              )}
            >
              {s.number}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wide text-text-dim">
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      <Progress
        value={pct}
        className="mb-10 h-2.5"
        indicatorClassName={frente.danger ? 'from-danger to-[#b91c1c]' : undefined}
      />

      <div className="mb-8 flex gap-2 border-b border-line">
        {(
          [
            { id: 'checklist', label: 'Checklist' },
            { id: 'mapa', label: 'Mapa de Implantação' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setView(tab.id)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-[13.5px] font-bold transition-colors',
              view === tab.id
                ? frente.danger
                  ? 'border-danger text-danger'
                  : 'border-fast-red text-fast-red'
                : 'border-transparent text-text-dim hover:text-text',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'checklist' &&
        frente.subfases.map((subfase) => (
          <ChecklistSection
            key={subfase.title}
            subfase={subfase}
            frenteDanger={frente.danger}
            onOpenInfo={onOpenInfo}
          />
        ))}

      {view === 'mapa' && <FluxogramaFrente frente={frente} />}
    </div>
  )
}
