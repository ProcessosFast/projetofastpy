export type Sector =
  | 'Jurídico'
  | 'Contábil/Fiscal'
  | 'Financeiro'
  | 'Engenharia'
  | 'Comercial/Marketing'
  | 'RH/Operações'
  | 'Comércio Exterior/Logística'

export interface ResponsibilityRow {
  frenteId: 'frente1' | 'frente2' | 'frente3'
  frenteLabel: string
  area: string
  sector: Sector
}

export const sectors: Sector[] = [
  'Jurídico',
  'Contábil/Fiscal',
  'Financeiro',
  'Engenharia',
  'Comercial/Marketing',
  'RH/Operações',
  'Comércio Exterior/Logística',
]

export const responsibilityMatrix: ResponsibilityRow[] = [
  // Frente 1 — Loja FAST
  { frenteId: 'frente1', frenteLabel: 'Frente 1 — Loja FAST', area: 'Administrativo & Societário', sector: 'Jurídico' },
  { frenteId: 'frente1', frenteLabel: 'Frente 1 — Loja FAST', area: 'Fiscal & Tributária', sector: 'Contábil/Fiscal' },
  { frenteId: 'frente1', frenteLabel: 'Frente 1 — Loja FAST', area: 'Jurídico & Contratos', sector: 'Jurídico' },
  { frenteId: 'frente1', frenteLabel: 'Frente 1 — Loja FAST', area: 'Comércio Exterior & Importação', sector: 'Comércio Exterior/Logística' },
  { frenteId: 'frente1', frenteLabel: 'Frente 1 — Loja FAST', area: 'Engenharia & Operacional', sector: 'Engenharia' },
  { frenteId: 'frente1', frenteLabel: 'Frente 1 — Loja FAST', area: 'Imóvel & Licenciamento', sector: 'Engenharia' },
  { frenteId: 'frente1', frenteLabel: 'Frente 1 — Loja FAST', area: 'Financeiro & CAPEX', sector: 'Financeiro' },
  { frenteId: 'frente1', frenteLabel: 'Frente 1 — Loja FAST', area: 'Comercial & Mercado', sector: 'Comercial/Marketing' },

  // Frente 2 — Imobiliária
  { frenteId: 'frente2', frenteLabel: 'Frente 2 — Imobiliária', area: 'Estrutura Jurídica & Societária', sector: 'Jurídico' },
  { frenteId: 'frente2', frenteLabel: 'Frente 2 — Imobiliária', area: 'Parecer Fiscal & Tributário', sector: 'Contábil/Fiscal' },
  { frenteId: 'frente2', frenteLabel: 'Frente 2 — Imobiliária', area: 'Prospecção de Terrenos (10.000-20.000 m²)', sector: 'Engenharia' },
  { frenteId: 'frente2', frenteLabel: 'Frente 2 — Imobiliária', area: 'Projetos & Licenciamento', sector: 'Engenharia' },
  { frenteId: 'frente2', frenteLabel: 'Frente 2 — Imobiliária', area: 'Construção & Operação Galpão 1', sector: 'Engenharia' },
  { frenteId: 'frente2', frenteLabel: 'Frente 2 — Imobiliária', area: 'Financeiro & Contábil', sector: 'Financeiro' },

  // Frente 3 — MaxSteel
  { frenteId: 'frente3', frenteLabel: 'Frente 3 — MaxSteel', area: 'Estrutura Jurídica & Societária', sector: 'Jurídico' },
  { frenteId: 'frente3', frenteLabel: 'Frente 3 — MaxSteel', area: 'Programa de Maquila (Lei 7.547/2025) — CRÍTICO', sector: 'Jurídico' },
  { frenteId: 'frente3', frenteLabel: 'Frente 3 — MaxSteel', area: 'Parecer Fiscal & Tributário', sector: 'Contábil/Fiscal' },
  { frenteId: 'frente3', frenteLabel: 'Frente 3 — MaxSteel', area: 'Engenharia & Especificação de Máquinas', sector: 'Engenharia' },
  { frenteId: 'frente3', frenteLabel: 'Frente 3 — MaxSteel', area: 'Localização & Infraestrutura Industrial', sector: 'Engenharia' },
  { frenteId: 'frente3', frenteLabel: 'Frente 3 — MaxSteel', area: 'Cronograma & Construção Galpão 1', sector: 'Engenharia' },
  { frenteId: 'frente3', frenteLabel: 'Frente 3 — MaxSteel', area: 'Contratações & Operação', sector: 'RH/Operações' },
  { frenteId: 'frente3', frenteLabel: 'Frente 3 — MaxSteel', area: 'Logística & Exportação Brasil', sector: 'Comércio Exterior/Logística' },
  { frenteId: 'frente3', frenteLabel: 'Frente 3 — MaxSteel', area: 'Financeiro & Viabilidade', sector: 'Financeiro' },
]
