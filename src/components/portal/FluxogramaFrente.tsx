import type { Frente } from '@/data/frentes'
import { useTasksStore } from '@/hooks/useTasksStore'
import { cn } from '@/lib/utils'

interface FluxogramaFrenteProps {
  frente: Frente
}

export function FluxogramaFrente({ frente }: FluxogramaFrenteProps) {
  const { checked } = useTasksStore()

  return (
    <div className="mx-auto max-w-[720px]">
      {frente.subfases.map((subfase, index) => {
        const total = subfase.tasks.length
        const done = subfase.tasks.filter((t) => checked[t.id]).length
        const pct = total ? Math.round((done / total) * 100) : 0
        const complete = total > 0 && done === total
        const started = done > 0 && !complete
        const isLast = index === frente.subfases.length - 1
        const title = subfase.title.replace(/^\d+\.\s*/, '')

        return (
          <div key={subfase.title} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <div
                className={cn(
                  'absolute left-[19px] top-10 bottom-0 w-0.5',
                  complete ? 'bg-success/50' : 'bg-line',
                )}
              />
            )}
            <div
              className={cn(
                'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-extrabold',
                complete
                  ? 'border-success bg-success text-black'
                  : started
                    ? 'border-fast-red bg-surface text-fast-red'
                    : 'border-line bg-surface-2 text-text-dim',
              )}
            >
              {complete ? '✓' : index + 1}
            </div>
            <div
              className={cn(
                'flex-1 rounded-xl border p-4',
                complete
                  ? 'border-success/40 bg-success/10'
                  : started
                    ? 'border-wine-soft bg-surface'
                    : 'border-line bg-surface-2',
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <h4 className="text-[14px] font-extrabold text-white">{title}</h4>
                <span
                  className={cn(
                    'shrink-0 text-[12px] font-bold',
                    complete ? 'text-success' : 'text-text-dim',
                  )}
                >
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
                <div
                  className={cn(
                    'h-full rounded-full transition-[width]',
                    complete ? 'bg-success' : 'bg-fast-red',
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11.5px] text-text-dim">
                {done}/{total} tarefas concluídas
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
