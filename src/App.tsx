import { useState } from 'react'

import { Cronograma } from '@/components/portal/Cronograma'
import { Dashboard } from '@/components/portal/Dashboard'
import { FrenteView } from '@/components/portal/FrenteView'
import { InfoDialog } from '@/components/portal/InfoDialog'
import { MatrizResponsabilidade } from '@/components/portal/MatrizResponsabilidade'
import { RegistroDecisoes } from '@/components/portal/RegistroDecisoes'
import { Sidebar, type TabId } from '@/components/portal/Sidebar'
import { frentes } from '@/data/frentes'
import { TasksStoreProvider } from '@/hooks/useTasksStore'
import type { InfoModal } from '@/data/frentes'
import { useSyncStatus } from '@/lib/sharedState'

function PortalApp() {
  const [active, setActive] = useState<TabId>('dashboard')
  const sync = useSyncStatus()
  const [infoState, setInfoState] = useState<{ modal: InfoModal; context?: string } | null>(
    null,
  )

  const navigate = (tab: TabId) => {
    setActive(tab)
    window.scrollTo({ top: 0 })
  }

  const openInfo = (modal: InfoModal, context?: string) => setInfoState({ modal, context })

  const activeFrente = frentes.find((f) => f.id === active)

  return (
    <div className="flex min-h-screen bg-bg-base text-text">
      <Sidebar active={active} onChange={navigate} />
      <main className="h-screen flex-1 overflow-y-auto scrollbar-thin">
        {active === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {active === 'matriz' && <MatrizResponsabilidade />}
        {active === 'cronograma' && <Cronograma />}
        {active === 'decisoes' && <RegistroDecisoes />}
        {activeFrente && (
          <FrenteView frente={activeFrente} onOpenInfo={openInfo} />
        )}
        <footer className="mt-12 border-t border-line px-8 py-8 text-center text-xs text-text-dim">
          <p>
            <strong>⚡ Projeto Paraguai</strong> — FAST Sistemas Construtivos | Expansão Mercosul
            2026/2027
          </p>
          <p className="mt-3">
            {sync === 'online'
              ? '● Sincronizado — alterações valem para todos que acessam o portal'
              : sync === 'offline'
                ? '● Sem conexão com o banco — alterações salvas só neste navegador por enquanto'
                : 'Carregando dados compartilhados...'}
          </p>
        </footer>
      </main>

      <InfoDialog
        state={infoState}
        onOpenChange={(open) => !open && setInfoState(null)}
      />
    </div>
  )
}

export default function App() {
  return (
    <TasksStoreProvider>
      <PortalApp />
    </TasksStoreProvider>
  )
}
