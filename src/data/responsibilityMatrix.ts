import { frentes, type Frente } from '@/data/frentes'

export type Sector =
  | 'Jurídico'
  | 'Contábil/Fiscal'
  | 'Financeiro'
  | 'Engenharia'
  | 'Comercial/Marketing'
  | 'RH/Operações'
  | 'Comércio Exterior/Logística'
  | 'TI/Sistemas'
  | 'A definir'

export interface ResponsibilityRow {
  frenteId: Frente['id']
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
  'TI/Sistemas',
  'A definir',
]

// Setor responsável por seção (título sem o número). Seção nova sem setor aparece como "A definir".
const sectorByArea: Record<Frente['id'], Record<string, Sector>> = {
  frente1: {
    'Administrativo & Societário': 'Jurídico',
    'Fiscal & Tributária': 'Contábil/Fiscal',
    'Jurídico & Contratos': 'Jurídico',
    'Comércio Exterior & Importação': 'Comércio Exterior/Logística',
    Engenharia: 'Engenharia',
    'Imóvel & Licenciamento': 'Engenharia',
    'Financeiro & CAPEX': 'Financeiro',
    'Estrutura Loja': 'RH/Operações',
    'Estruturação Sistêmica': 'TI/Sistemas',
    Logística: 'Comércio Exterior/Logística',
    'Pessoas & Contratação': 'RH/Operações',
    Marketing: 'Comercial/Marketing',
  },
  frente2: {
    'Estrutura Jurídica & Societária': 'Jurídico',
    'Parecer Fiscal & Tributário': 'Contábil/Fiscal',
    'Prospecção de Terrenos (10.000-20.000 m²)': 'Engenharia',
    'Projetos & Licenciamento': 'Engenharia',
    'Construção & Operação Galpão 1': 'Engenharia',
    'Financeiro & Contábil': 'Financeiro',
  },
  frente3: {
    'Estrutura Jurídica & Societária': 'Jurídico',
    'Programa de Maquila (Lei 7.547/2025) — CRÍTICO': 'Jurídico',
    'Parecer Fiscal & Tributário': 'Contábil/Fiscal',
    'Engenharia & Especificação de Máquinas': 'Engenharia',
    'Localização & Infraestrutura Industrial': 'Engenharia',
    'Cronograma & Construção Galpão 1': 'Engenharia',
    'Contratações & Operação': 'RH/Operações',
    'Logística & Exportação Brasil': 'Comércio Exterior/Logística',
    'Financeiro & Viabilidade': 'Financeiro',
  },
}

export const responsibilityMatrix: ResponsibilityRow[] = frentes.flatMap((frente) =>
  frente.subfases.map((subfase) => {
    const area = subfase.title.replace(/^\d+\.\s*/, '')
    return {
      frenteId: frente.id,
      frenteLabel: frente.navLabel,
      area,
      sector: sectorByArea[frente.id][area] ?? 'A definir',
    }
  }),
)
