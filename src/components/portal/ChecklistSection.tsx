import * as React from 'react'

import { ChevronDown, X } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  businessLicenseChecklist,
  municipalLicenseChecklist,
  type InfoModal,
  type Subfase,
} from '@/data/frentes'
import { useTasksStore } from '@/hooks/useTasksStore'
import { cn } from '@/lib/utils'

interface ChecklistSectionProps {
  subfase: Subfase
  frenteDanger?: boolean
  onOpenInfo: (modal: InfoModal, context?: string) => void
}

function infoTriggerLabel(modal: InfoModal): string {
  switch (modal) {
    case 'struct':
    case 'coworking':
      return 'ver prós e contras'
    case 'socios':
      return 'ver sócios'
    case 'representante':
      return 'definir nome'
    case 'banco':
      return 'escolher banco'
    case 'licenca-importacao':
      return 'ver detalhes'
    case 'enderecos':
      return 'adicionar opções'
    case 'propostas':
      return 'gerenciar propostas'
    case 'licenca-municipal':
    case 'patente-comercial':
    case 'constituicao-suace':
      return 'ver checklist'
    default:
      return 'ver documentos'
  }
}

export function ChecklistSection({
  subfase,
  frenteDanger,
  onOpenInfo,
}: ChecklistSectionProps) {
  const { isChecked, toggleTask, choices, clearChoice, lists } = useTasksStore()
  const [collapsed, setCollapsed] = React.useState(false)

  const doneCount = subfase.tasks.filter((t) => isChecked(t.id)).length
  const totalCount = subfase.tasks.length

  return (
    <Card
      className={cn(
        'mb-6 p-8 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(196,30,58,0.25)]',
        frenteDanger &&
          'hover:border-danger hover:shadow-[0_10px_24px_rgba(220,38,38,0.25)]',
      )}
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          'flex w-full items-center justify-between gap-3 border-line pb-4 text-left text-lg font-extrabold text-white',
          !collapsed && 'mb-6 border-b-2',
        )}
      >
        <span className="flex items-center gap-3">{subfase.title}</span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="text-xs font-semibold text-text-dim">
            {doneCount}/{totalCount}
          </span>
          <ChevronDown
            className={cn(
              'size-5 text-text-dim transition-transform',
              collapsed && '-rotate-90',
            )}
          />
        </span>
      </button>
      {!collapsed && (
      <div className="flex flex-col">
        {subfase.tasks.map((task, i) => {
          const checked = isChecked(task.id)
          const choice = task.info?.context ? choices[task.info.context] : undefined
          const isListModal = task.info?.modal === 'enderecos' || task.info?.modal === 'propostas'
          const optionCount =
            isListModal && task.info!.context ? (lists[task.info!.context] ?? []).length : 0
          const progressChecklist =
            task.info?.modal === 'licenca-municipal'
              ? municipalLicenseChecklist
              : task.info?.modal === 'patente-comercial'
                ? businessLicenseChecklist
                : null
          const licenseProgress =
            progressChecklist && task.info!.context
              ? progressChecklist.filter((_, idx) => isChecked(`${task.info!.context}-item-${idx}`))
                  .length
              : -1
          const licenseTotal = progressChecklist?.length ?? 0
          return (
            <div
              key={task.id}
              className={cn(
                'flex items-start gap-4 py-3.5',
                i < subfase.tasks.length - 1 && 'border-b border-line',
              )}
            >
              <Checkbox
                className="mt-0.5"
                checked={checked}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <label
                    className={cn(
                      'cursor-pointer text-[13px] font-semibold',
                      checked ? 'text-text-dim line-through' : 'text-text',
                      task.info && 'hover:text-fast-red',
                    )}
                    onClick={
                      task.info
                        ? () => onOpenInfo(task.info!.modal, task.info!.context)
                        : undefined
                    }
                  >
                    {task.label}
                  </label>
                  {task.info && (
                    <span
                      className="cursor-pointer rounded-full border border-wine-soft px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-fast-red transition-colors hover:bg-fast-red hover:text-white"
                      onClick={() => onOpenInfo(task.info!.modal, task.info!.context)}
                    >
                      ⓘ {infoTriggerLabel(task.info.modal)}
                    </span>
                  )}
                  {choice && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/15 py-0.5 pl-2.5 pr-1.5 text-[10.5px] font-bold text-success">
                      ✓ {choice.label}
                      <button
                        type="button"
                        title="Remover escolha"
                        className="flex size-3.5 items-center justify-center rounded-full hover:bg-success/30"
                        onClick={() => clearChoice(task.info!.context!)}
                      >
                        <X className="size-2.5" strokeWidth={3} />
                      </button>
                    </span>
                  )}
                  {optionCount > 0 && !choice && (
                    <span className="rounded-full border border-wine-soft px-2.5 py-0.5 text-[10.5px] font-bold text-fast-red">
                      {optionCount}{' '}
                      {task.info?.modal === 'propostas'
                        ? optionCount === 1
                          ? 'proposta'
                          : 'propostas'
                        : optionCount === 1
                          ? 'opção'
                          : 'opções'}
                    </span>
                  )}
                  {licenseProgress >= 0 && (
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold',
                        licenseProgress === licenseTotal
                          ? 'border-success/40 bg-success/15 text-success'
                          : 'border-wine-soft text-fast-red',
                      )}
                    >
                      {licenseProgress === licenseTotal && '✓ '}
                      {licenseProgress}/{licenseTotal}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-[11px] font-normal leading-relaxed text-text-dim">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
      )}
    </Card>
  )
}
