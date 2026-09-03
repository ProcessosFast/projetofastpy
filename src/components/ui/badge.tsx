import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'border-wine-soft text-fast-red bg-transparent',
        success: 'border-success/40 text-success bg-success/15',
        danger: 'border-danger/40 text-danger bg-danger/15',
        outline: 'border-line text-text-dim bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge, badgeVariants }
