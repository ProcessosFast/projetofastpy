import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { frentes } from '@/data/frentes'
import { useTasksStore } from '@/hooks/useTasksStore'
import type { TabId } from '@/components/portal/Sidebar'

interface DashboardProps {
  onNavigate: (tab: TabId) => void
}

const RED = '#c41e3a'
const DANGER = '#dc2626'

export function Dashboard({ onNavigate }: DashboardProps) {
  const { frenteStats, overallStats } = useTasksStore()
  const overall = overallStats()

  const gaugeData = [{ name: 'progresso', value: overall.pct, fill: RED }]

  const barData = frentes.map((f) => {
    const s = frenteStats(f.id)
    return {
      name: f.navLabel.replace(/^Frente \d+ — /, ''),
      pct: s.pct,
      done: s.done,
      total: s.total,
      danger: !!f.danger,
    }
  })

  return (
    <div className="mx-auto max-w-[1200px] px-8 py-12">
      <div className="mb-12">
        <h2 className="mb-4 text-[32px] font-extrabold text-white">
          Dashboard — Visão Geral do Projeto
        </h2>
        <p className="text-[15px] text-gray-600">
          Conclusão consolidada das 3 frentes | FAST Sistemas Construtivos PY
        </p>
      </div>

      <Card className="mb-10 flex flex-col items-center gap-8 p-9 sm:flex-row">
        <div className="relative h-[140px] w-[140px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="72%"
              outerRadius="100%"
              data={gaugeData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={20} background={{ fill: '#1b1e24' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-fast-red">{overall.pct}%</span>
          </div>
        </div>
        <div className="w-full flex-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">
            Conclusão geral do projeto
          </p>
          <Progress value={overall.pct} className="mb-3 h-3.5" />
          <p className="text-sm font-semibold text-text-dim">
            {overall.done} de {overall.total} tarefas concluídas
          </p>
        </div>
      </Card>

      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {frentes.map((f) => {
          const s = frenteStats(f.id)
          return (
            <Card
              key={f.id}
              className="cursor-pointer p-6 hover:-translate-y-0.5 hover:border-fast-red"
              onClick={() => onNavigate(f.id)}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {f.navLabel}
                </span>
                <span
                  className="text-lg font-extrabold"
                  style={{ color: f.danger ? DANGER : RED }}
                >
                  {s.pct}%
                </span>
              </div>
              <Progress
                value={s.pct}
                className="mb-3 h-2.5"
                indicatorClassName={f.danger ? 'from-danger to-[#b91c1c]' : undefined}
              />
              <p className="text-xs font-medium text-text-dim">
                {s.done}/{s.total} tarefas · {f.meta}
              </p>
            </Card>
          )
        })}
      </div>

      <Card className="mb-10 p-8">
        <h4 className="mb-1 text-sm font-extrabold text-white">Comparativo de progresso</h4>
        <p className="mb-6 text-xs text-text-dim">Percentual concluído por frente</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d34" vertical={false} />
            <XAxis dataKey="name" stroke="#b8b9bd" fontSize={12} tickLine={false} axisLine={{ stroke: '#2a2d34' }} />
            <YAxis stroke="#b8b9bd" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                background: '#14161a',
                border: '1px solid #2a2d34',
                borderRadius: 8,
                color: '#fff',
                fontSize: 12,
              }}
              formatter={(_value, _name, item) => {
                const p = item.payload as (typeof barData)[number]
                return [`${p.done}/${p.total} tarefas (${p.pct}%)`, 'Progresso']
              }}
            />
            <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
              {barData.map((d) => (
                <Cell key={d.name} fill={d.danger ? DANGER : RED} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

    </div>
  )
}
