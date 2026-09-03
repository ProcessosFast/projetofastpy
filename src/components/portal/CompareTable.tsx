interface Row {
  label: string
  eas: string
  sa: string
  highlight?: boolean
}

const rows: Row[] = [
  { label: 'Sócios', eas: '1 ou mais', sa: 'Mínimo 2' },
  { label: 'Constituição', eas: '100% online', sa: 'Processo tradicional' },
  { label: 'Capital mínimo', eas: 'Não há', sa: 'Estrutura de capital mais formal' },
  {
    label: 'Prazo',
    eas: 'Pode chegar a 72h usando estatuto padrão',
    sa: 'Até cerca de 15 dias úteis',
  },
  { label: 'Pode fazer Maquila?', eas: 'Sim', sa: 'Sim' },
  {
    label: 'Ideal para',
    eas: 'Empresa nova, grupo menor, operação flexível',
    sa: 'Estrutura societária mais tradicional/institucional',
    highlight: true,
  },
]

export function CompareTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="border-b-2 border-line pb-3 pr-4 text-left" />
            <th className="border-b-2 border-line px-4 pb-3 text-left text-sm font-normal text-white">
              E.A.S.
            </th>
            <th className="border-b-2 border-line px-4 pb-3 text-left text-sm font-normal text-white">
              S.A.
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={row.highlight ? 'bg-fast-red/[0.08]' : undefined}>
              <th
                className={
                  'whitespace-nowrap border-b border-line py-3 pr-4 text-left font-semibold ' +
                  (row.highlight ? 'text-text' : 'text-text')
                }
              >
                {row.label}
              </th>
              <td className="border-b border-line border-l-2 border-l-wine-soft px-4 py-3 text-text-dim">
                {row.eas}
              </td>
              <td className="border-b border-line border-l-2 border-l-line px-4 py-3 text-text-dim">
                {row.sa}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
