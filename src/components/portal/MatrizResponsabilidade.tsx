import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { responsibilityMatrix, sectors, type Sector } from '@/data/responsibilityMatrix'

const sectorColor: Record<Sector, string> = {
  Jurídico: 'border-[#c41e3a]/40 text-[#f87171] bg-[#c41e3a]/10',
  'Contábil/Fiscal': 'border-[#d97706]/40 text-[#fbbf24] bg-[#d97706]/10',
  Financeiro: 'border-[#059669]/40 text-[#34d399] bg-[#059669]/10',
  Engenharia: 'border-[#2563eb]/40 text-[#60a5fa] bg-[#2563eb]/10',
  'Comercial/Marketing': 'border-[#7c3aed]/40 text-[#a78bfa] bg-[#7c3aed]/10',
  'RH/Operações': 'border-[#db2777]/40 text-[#f472b6] bg-[#db2777]/10',
  'Comércio Exterior/Logística': 'border-[#0891b2]/40 text-[#22d3ee] bg-[#0891b2]/10',
}

export function MatrizResponsabilidade() {
  const bySector = sectors.map((sector) => ({
    sector,
    count: responsibilityMatrix.filter((r) => r.sector === sector).length,
  }))

  return (
    <div className="mx-auto max-w-[1200px] px-8 py-12">
      <div className="mb-8">
        <h2 className="mb-3 text-[32px] font-extrabold text-white">
          Matriz de Responsabilidade
        </h2>
        <p className="text-[15px] text-text-dim">
          Áreas mapeadas nas 3 frentes e o setor responsável por cada uma. Rascunho inicial — avise
          se algum setor precisa mudar de nome ou de responsável.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2.5">
        {bySector.map(({ sector, count }) => (
          <span
            key={sector}
            className={
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold ' +
              sectorColor[sector]
            }
          >
            {sector}
            <span className="rounded-full bg-black/25 px-1.5 py-0.5 text-[10.5px]">{count}</span>
          </span>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                <th className="px-5 py-3.5 font-bold uppercase tracking-wide text-[11px] text-text-dim">
                  Frente
                </th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wide text-[11px] text-text-dim">
                  Área
                </th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-wide text-[11px] text-text-dim">
                  Setor responsável
                </th>
              </tr>
            </thead>
            <tbody>
              {responsibilityMatrix.map((row, index) => (
                <tr
                  key={`${row.frenteId}-${row.area}`}
                  className={
                    'border-b border-line last:border-0 ' +
                    (index % 2 === 1 ? 'bg-surface-2/40' : '')
                  }
                >
                  <td className="px-5 py-3.5 font-semibold text-text-dim">{row.frenteLabel}</td>
                  <td className="px-5 py-3.5 font-semibold text-text">{row.area}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={'border ' + sectorColor[row.sector]}>{row.sector}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
