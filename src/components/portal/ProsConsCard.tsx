import { Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ListGroup {
  label: string
  items: string[]
  tone?: 'pro' | 'con' | 'neutral'
}

interface ProsConsCardProps {
  title: string
  groups: ListGroup[]
  choiceValue?: string
  choiceLabel?: string
  selected?: boolean
  onChoose?: () => void
}

export function ProsConsCard({
  title,
  groups,
  selected,
  onChoose,
  choiceLabel,
}: ProsConsCardProps) {
  return (
    <div className="rounded-[10px] border border-line bg-surface-2 p-5">
      <h5 className="mb-3.5 text-sm font-extrabold text-white">{title}</h5>
      {groups.map((group) => (
        <div key={group.label} className="mb-4 last:mb-0">
          <span className="mb-2 block text-[10.5px] font-bold uppercase tracking-wide text-text-dim">
            {group.label}
          </span>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <li
                key={item}
                className="relative pl-5 text-[12.5px] leading-relaxed text-text-dim"
              >
                <span
                  className={cn(
                    'absolute left-0 top-0 font-extrabold',
                    group.tone === 'con' ? 'text-fast-red' : 'text-success',
                  )}
                >
                  {group.tone === 'con' ? (
                    <X className="size-3" strokeWidth={3} />
                  ) : (
                    <Check className="size-3" strokeWidth={3} />
                  )}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {onChoose && (
        <Button
          type="button"
          variant="outline"
          className={cn('mt-2 w-full', selected && 'bg-fast-red text-white')}
          onClick={onChoose}
        >
          {selected ? `✓ ${choiceLabel} selecionado` : `✓ Escolher ${choiceLabel}`}
        </Button>
      )}
    </div>
  )
}
