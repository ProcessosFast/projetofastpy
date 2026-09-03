import { ChevronLeft, ChevronRight } from 'lucide-react'

import { FastLogo } from '@/components/portal/FastLogo'
import { FastMark } from '@/components/portal/FastMark'
import { frentes } from '@/data/frentes'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { cn } from '@/lib/utils'

export type TabId =
  | 'dashboard'
  | 'frente1'
  | 'frente2'
  | 'frente3'
  | 'matriz'
  | 'cronograma'
  | 'decisoes'

interface SidebarProps {
  active: TabId
  onChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; shortLabel: string; danger?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'D' },
  ...frentes.map((f) => ({
    id: f.id,
    label: f.navLabel,
    shortLabel: f.navLabel.match(/Frente (\d+)/)?.[1] ? `F${f.navLabel.match(/Frente (\d+)/)![1]}` : f.navLabel[0],
    danger: f.danger,
  })),
  { id: 'matriz', label: 'Matriz de Responsabilidade', shortLabel: 'M' },
  { id: 'cronograma', label: 'Cronograma', shortLabel: 'C' },
  { id: 'decisoes', label: 'Registro de Decisões', shortLabel: 'R' },
]

export function Sidebar({ active, onChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useLocalStorage('py-portal-sidebar-collapsed', false)

  return (
    <nav
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col overflow-y-auto overflow-x-hidden scrollbar-thin border-r border-gray-200 bg-white transition-[width] duration-200',
        collapsed ? 'w-[76px]' : 'w-[280px]',
      )}
    >
      <div
        className={cn(
          'relative border-b border-gray-200 pb-6 pt-7',
          collapsed ? 'px-3' : 'px-6',
        )}
      >
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="absolute -right-3 top-8 flex size-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:border-fast-red hover:text-fast-red"
        >
          {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        </button>

        {collapsed ? (
          <FastMark className="mx-auto h-8 w-8" />
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <FastLogo className="h-auto w-[132px] shrink-0" />
              <span className="inline-flex items-center justify-center rounded-md border-[1.5px] border-wine bg-[#D21217] px-2 py-1 text-[13px] font-extrabold leading-none tracking-wide text-white">
                PY
              </span>
            </div>
            <p className="text-[12.5px] font-medium leading-relaxed text-gray-600">
              FAST Sistemas Construtivos — Expansão Mercosul 2026/2027
            </p>
          </>
        )}
      </div>

      <div className={cn('flex flex-col gap-1 p-3', collapsed && 'items-center')}>
        {tabs.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              title={collapsed ? tab.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg border-2 border-transparent text-left text-[14.5px] font-semibold text-gray-600 transition-all',
                collapsed ? 'size-11 justify-center px-0 py-0' : 'w-full px-4 py-4',
                'hover:bg-gray-50 hover:text-fast-red',
                isActive &&
                  (tab.danger
                    ? 'border-danger bg-gray-50 text-danger shadow-[0_0_0_3px_rgba(220,38,38,0.15)]'
                    : 'border-fast-red bg-gray-50 text-fast-red shadow-[0_0_0_3px_rgba(196,30,58,0.15)]'),
              )}
            >
              {collapsed ? <span>{tab.shortLabel}</span> : <span>{tab.label}</span>}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
