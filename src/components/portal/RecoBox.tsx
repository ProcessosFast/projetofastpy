import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface RecoBoxProps {
  tone: 'no' | 'yes' | 'info'
  title: string
  children: ReactNode
}

const toneClasses: Record<RecoBoxProps['tone'], string> = {
  no: 'border-danger/40 bg-[#2a1414]',
  yes: 'border-success/40 bg-[#10261f]',
  info: 'border-wine-soft bg-surface',
}

const titleClasses: Record<RecoBoxProps['tone'], string> = {
  no: 'text-[#f87171]',
  yes: 'text-success',
  info: 'text-fast-red',
}

export function RecoBox({ tone, title, children }: RecoBoxProps) {
  return (
    <div className={cn('mb-3 rounded-[10px] border p-4 last:mb-0', toneClasses[tone])}>
      <strong className={cn('mb-1.5 block text-[13px]', titleClasses[tone])}>{title}</strong>
      <p className="text-[12.5px] leading-relaxed text-text-dim">{children}</p>
    </div>
  )
}
