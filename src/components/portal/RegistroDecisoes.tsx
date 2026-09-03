import * as React from 'react'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface Decision {
  id: string
  date: string
  time: string
  title: string
  responsible: string
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function nowHM() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export function RegistroDecisoes() {
  const [decisions, setDecisions] = useLocalStorage<Decision[]>('py-portal-decisions', [])
  const [date, setDate] = React.useState(todayISO())
  const [time, setTime] = React.useState(nowHM())
  const [title, setTitle] = React.useState('')
  const [responsible, setResponsible] = React.useState('')

  const addDecision = () => {
    const trimmedTitle = title.trim()
    const trimmedResponsible = responsible.trim()
    if (!trimmedTitle || !trimmedResponsible) return
    setDecisions((prev) => [
      { id: `${Date.now()}`, date, time, title: trimmedTitle, responsible: trimmedResponsible },
      ...prev,
    ])
    setTitle('')
    setResponsible('')
    setDate(todayISO())
    setTime(nowHM())
  }

  const removeDecision = (id: string) => {
    setDecisions((prev) => prev.filter((d) => d.id !== id))
  }

  const sorted = [...decisions].sort((a, b) =>
    `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
  )

  return (
    <div className="mx-auto max-w-[1000px] px-8 py-12">
      <div className="mb-8">
        <h2 className="mb-3 text-[32px] font-extrabold text-white">Registro de Decisões</h2>
        <p className="text-[15px] text-text-dim">
          Histórico de decisões tomadas no projeto, com data, hora e responsável.
        </p>
      </div>

      <Card className="mb-8 p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[150px_110px_1fr_1fr]">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 rounded-md border border-line bg-surface-2 px-3 text-[13px] text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="h-9 rounded-md border border-line bg-surface-2 px-3 text-[13px] text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDecision()}
            placeholder="O que foi decidido"
            className="h-9 rounded-md border border-line bg-surface-2 px-3 text-[13px] text-text placeholder:text-text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50"
          />
          <input
            type="text"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDecision()}
            placeholder="Responsável"
            className="h-9 rounded-md border border-line bg-surface-2 px-3 text-[13px] text-text placeholder:text-text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50"
          />
        </div>
        <Button
          type="button"
          className="mt-3"
          onClick={addDecision}
          disabled={!title.trim() || !responsible.trim()}
        >
          Registrar decisão
        </Button>
      </Card>

      {sorted.length === 0 ? (
        <p className="text-[13px] text-text-dim">Nenhuma decisão registrada ainda.</p>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-line bg-surface-2">
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-text-dim">
                    Data
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-text-dim">
                    Hora
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-text-dim">
                    Decisão
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-text-dim">
                    Responsável
                  </th>
                  <th className="w-10 px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((d, index) => (
                  <tr
                    key={d.id}
                    className={
                      'border-b border-line last:border-0 ' +
                      (index % 2 === 1 ? 'bg-surface-2/40' : '')
                    }
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 text-text-dim">
                      {formatDate(d.date)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-text-dim">{d.time}</td>
                    <td className="px-5 py-3.5 font-semibold text-text">{d.title}</td>
                    <td className="px-5 py-3.5 text-text">{d.responsible}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        title="Remover decisão"
                        className="text-text-dim hover:text-danger"
                        onClick={() => removeDecision(d.id)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
