export type InfoModal =
  | 'docs'
  | 'struct'
  | 'ruc'
  | 'socios'
  | 'representante'
  | 'banco'
  | 'licenca-importacao'
  | 'enderecos'
  | 'propostas'
  | 'licenca-municipal'
  | 'patente-comercial'
  | 'constituicao-suace'

export interface Task {
  id: string
  label: string
  description?: string
  info?: { modal: InfoModal; context?: string }
}

export interface Subfase {
  title: string
  tasks: Task[]
}

export interface Frente {
  id: 'frente1' | 'frente2' | 'frente3'
  navLabel: string
  title: string
  subtitle: string
  meta: string
  status: string
  blocker: string
  danger?: boolean
  subfases: Subfase[]
}

const socios = (id: string): Task => ({
  id,
  label:
    'Regularizar documentação dos sócios e representante legal conforme a estrutura societária escolhida',
  info: { modal: 'docs' },
})

export const municipalLicenseChecklist = [
  'Definir endereço definitivo',
  'Verificar se o imóvel pode exercer atividade comercial',
  'Verificar situação cadastral do imóvel',
  'Verificar situação do imposto imobiliário',
  'Ter contrato de locação ou documento que comprove o uso do imóvel',
  'Apresentar documentação da empresa',
  'Apresentar RUC',
  'Apresentar documentação do representante legal',
  'Solicitar Habilitação do Estabelecimento Comercial',
  'Realizar eventual vistoria municipal',
  'Obter comprovante/documento da habilitação',
]

export const businessLicenseChecklist = [
  'Empresa constituída',
  'RUC ativo',
  'Atividade econômica cadastrada corretamente',
  'Endereço comercial definido',
  'Documentação do imóvel',
  'Documentação do representante legal',
  'Solicitar Patente Comercial',
  'Apresentar declaração/documentação exigida pela Municipalidad',
  'Efetuar pagamento das taxas/tributos correspondentes',
  'Obter comprovante da Patente Comercial',
]

export const suaceConstitutionOptions = [
  {
    title: 'Opção 1 — Estatuto Proforma do SUACE',
    note: 'É a opção mais simples. O próprio sistema gera o estatuto conforme as informações inseridas no cadastro. O SUACE informa que o estatuto proforma não deve ser editado e que os dados declarados no cadastro devem ser exatamente compatíveis com o estatuto.',
    items: [
      'Preencher os dados da empresa',
      'Conferir o estatuto gerado',
      'Não alterar manualmente o modelo',
      'Baixar o documento',
      'Assinar',
      'Digitalizar e carregar no sistema',
    ],
  },
  {
    title: 'Opção 2 — Documento privado',
    items: [
      'Elaborar contrato/estatuto',
      'Assinaturas dos envolvidos',
      'Certificação das assinaturas por escribano público',
      'Carregar o documento na plataforma',
    ],
  },
  {
    title: 'Opção 3 — Escritura Pública',
    items: [
      'Elaborar a escritura com escribano público',
      'Formalizar o ato constitutivo',
      'Carregar a documentação no processo',
    ],
  },
]

export const businessLicenseDocsChecklist = [
  'Constancia de RUC da DNIT',
  'Declaração Jurada de Ativo assinada pelo contador e contribuinte',
  'Documento de identidade do representante/proponente, conforme exigência',
  'Contrato de aluguel com Cta. Cte. Ctral., autenticado quando exigido',
  'Comprovante de pagamento/regularidade do imposto imobiliário ou documento equivalente',
  'Fatura do extintor',
  'Comprovante de pagamento da coleta de lixo',
  'Patente profissional do contador, expedida pela Municipalidad de Ciudad del Este',
]

function societarioSection(
  prefix: string,
  structureTask: Task,
  businessNoun: string,
  detailedLicensing: boolean,
): Task[] {
  const tasks: Task[] = [
    { id: `${prefix}-socios-def`, label: 'Definir sócios', info: { modal: 'socios' } },
    structureTask,
    {
      id: `${prefix}-assessoria`,
      label: 'Contratar assessoria jurídica no Paraguai',
      info: { modal: 'propostas', context: `assessoria-${prefix}` },
    },
    {
      id: `${prefix}-representante`,
      label: 'Definir representante legal',
      info: { modal: 'representante', context: `representante-${prefix}` },
    },
    socios(`${prefix}-docs-socios`),
  ]

  tasks.push(
    {
      id: `${prefix}-endereco`,
      label: 'Definir endereço da empresa',
      info: { modal: 'enderecos', context: `enderecos-${prefix}` },
    },
    {
      id: `${prefix}-constituir`,
      label: 'Constituir a empresa pelo SUACE',
      info: { modal: 'constituicao-suace', context: `constituicao-suace-${prefix}` },
    },
    {
      id: `${prefix}-ruc`,
      label: 'Obter o RUC / regularização tributária na DNIT',
      info: { modal: 'ruc' },
    },
    {
      id: `${prefix}-licenca-municipal`,
      label: 'Providenciar habilitação/licença municipal',
      description: `A empresa precisa estar regular perante a municipalidade onde ${businessNoun} estará localizada.`,
      info: detailedLicensing
        ? { modal: 'licenca-municipal', context: `licenca-municipal-${prefix}` }
        : undefined,
    },
  )

  if (detailedLicensing) {
    tasks.push({
      id: `${prefix}-patente-comercial`,
      label: 'Solicitar Patente Comercial',
      description: `Regularizar a atividade comercial d${businessNoun} perante a Municipalidad.`,
      info: { modal: 'patente-comercial', context: `patente-comercial-${prefix}` },
    })
  }

  tasks.push(
    {
      id: `${prefix}-autorizacoes`,
      label: 'Providenciar as autorizações específicas da atividade',
      description: `Dependendo do que ${businessNoun} vender/operar, podem existir exigências adicionais.`,
      info: detailedLicensing ? { modal: 'licenca-importacao' } : undefined,
    },
    {
      id: `${prefix}-conta-bancaria`,
      label: 'Abrir conta bancária empresarial',
      info: { modal: 'banco', context: `banco-${prefix}` },
    },
  )

  return tasks
}

function bkmMilestones(prefix: string): Task[] {
  return [
    {
      id: `${prefix}-bkm-dados`,
      label: 'Enviar documentação para a BKM (coleta de dados)',
      description: 'Prazo combinado: 09 a 12/09/2026.',
    },
    {
      id: `${prefix}-bkm-reuniao1`,
      label: '1ª reunião técnica com a BKM (online)',
      description: 'Levantamento e entendimento dos negócios. Prazo: 15 ou 16/09/2026.',
    },
    {
      id: `${prefix}-bkm-parecer`,
      label: 'Receber parecer final da BKM (estruturação jurídica/tributária)',
      description: 'Conclusão da estruturação prevista até 30/09/2026.',
    },
    {
      id: `${prefix}-bkm-retainer`,
      label: 'Acionar o OFRB',
    },
  ]
}

export const frentes: Frente[] = [
  {
    id: 'frente1',
    navLabel: 'Frente 1 — Loja FAST',
    title: 'Frente 1 — Loja FAST Sistemas Construtivos PY',
    subtitle: 'Showroom 100–300m² + Comércio Varejo Paraguay',
    meta: 'Meta: Inauguração novembro 2026',
    status: '15% progresso',
    blocker: 'Imóvel não definido na Av. Monseñor Rodríguez, Ciudad del Este (setembro 2026)',
    subfases: [
      {
        title: '1. Administrativo & Societário',
        tasks: societarioSection(
          'f1',
          {
            id: 'f1-estrutura',
            label: 'Escolher estrutura jurídica (E.A.S. vs S.A.)',
            info: { modal: 'struct', context: 'struct-f1' },
          },
          'a loja',
          true,
        ),
      },
      {
        title: '2. Fiscal & Tributária',
        tasks: [
          {
            id: 'f1-viagem-contabil-dnit',
            label: 'Viagem da diretoria (dia 21 ou 22) — contratação da contabilidade e ida à DNIT',
            description: 'Fechar a contratação da empresa contábil e comparecer à DNIT.',
          },
          {
            id: 'f1-contabil',
            label: 'Contratar empresa contábil',
            info: { modal: 'propostas', context: 'contabil-f1' },
          },
          {
            id: 'f1-22',
            label: 'Contratar contador local',
            description: 'O contrato precisa incluir a gestão da folha de pagamento dos funcionários.',
          },
          {
            id: 'f1-6',
            label: 'Definir modelo tributário (Regime Simplificado vs. IRE GENERAL)',
            description:
              'Definir o modelo tributário aplicável à operação, considerando natureza das vendas, importação, comercialização local e prestação de serviços.',
          },
          { id: 'f1-7', label: 'Licença municipal en Ciudad del Este' },
          { id: 'f1-8', label: 'Inscrição no Instituto Previdência Social' },
          {
            id: 'f1-faturamento',
            label: 'Estruturar faturamento e emissão de documentos fiscais',
            description:
              'Definir o modelo de faturamento da loja, documentos fiscais aplicáveis, emissão e integração com o sistema.',
          },
          { id: 'f1-nota-remision', label: 'Estudar modelo de Nota de Remisión' },
        ],
      },
      {
        title: '3. Jurídico & Contratos',
        tasks: [
          { id: 'f1-9', label: 'Contrato franquia/parceria com FAST Brasil' },
          ...bkmMilestones('f1'),
        ],
      },
      {
        title: '4. Comércio Exterior & Importação',
        tasks: [
          {
            id: 'f1-fluxo-importacao',
            label: 'Mapear o fluxo de importação',
            description: 'Documentação, custos, impostos, despachante e responsabilidades envolvidas.',
          },
          {
            id: 'f1-11',
            label: 'Contratar despachante aduaneiro',
            info: { modal: 'propostas', context: 'despachante-f1' },
          },
          { id: 'f1-12', label: 'Montar matriz NCM/tarifário completa' },
          { id: 'f1-13', label: 'Registrar como importador junto Ministério Indústria' },
        ],
      },
      {
        title: '5. Engenharia',
        tasks: [
          { id: 'f1-14', label: 'Desenvolver projeto showroom 100-300 m²' },
          { id: 'f1-15', label: 'Especificar infraestrutura showroom' },
          {
            id: 'f1-reforma',
            label: 'Reforma',
            description:
              'Decidir se contrata equipe local ou envia equipe Fast Brasil. Escopo: pintura das paredes da loja, pintura do chão do galpão, montagem de móveis e estrutura do galpão.',
          },
        ],
      },
      {
        title: '6. Imóvel & Licenciamento',
        tasks: [
          { id: 'f1-17', label: 'Prospectar imóvel em Ciudad del Este' },
          { id: 'f1-18', label: 'Due diligence & negociação contrato aluguel' },
        ],
      },
      {
        title: '7. Financeiro & CAPEX',
        tasks: [
          { id: 'f1-orcamento-loja', label: 'Criar orçamento completo da loja' },
          { id: 'f1-20', label: 'Orçamento mobiliário e equipamentos' },
          { id: 'f1-21', label: 'Orçamento estoque inicial' },
          {
            id: 'f1-pagamento-cartao',
            label: 'Definir sistema de pagamento com cartão',
            description: 'Comparar Bancard, Ueno e Dinelco — taxas e modelos de contrato.',
          },
          {
            id: 'f1-moedas',
            label: 'Definir moedas aceitas (real, dólar e guarani)',
            description: 'Regra de cotação e conversão; avaliar uma conta bancária por moeda.',
          },
          {
            id: 'f1-cashback',
            label: 'Estudar cashback e reintegro',
            description: 'Benefícios conforme a bandeira e a modalidade do cartão.',
          },
        ],
      },
      {
        title: '8. Estrutura Loja',
        tasks: [
          { id: 'f1-16', label: 'Planejar estoque inicial e definir enxoval da loja' },
          { id: 'f1-mobiliario', label: 'Definir mobiliário e fachada da loja' },
          { id: 'f1-medidas-fachada', label: 'Retirar medidas da fachada da loja para enviar ao marketing' },
          {
            id: 'f1-equipamentos',
            label: 'Definir equipamentos que serão utilizados na loja',
            description: 'Computadores, impressora etc.',
          },
          { id: 'f1-mix-varejo', label: 'Definir mix de varejo entre Fast Aço e Fast Homes' },
          { id: 'f1-internet', label: 'Contratar empresa de internet para instalação na loja e no galpão' },
          { id: 'f1-luz', label: 'Ligar energia elétrica da loja (ANDE)' },
          { id: 'f1-coleta', label: 'Regularizar taxa de coleta de lixo' },
          {
            id: 'f1-seguranca',
            label: 'Definir esquema de segurança da loja',
            description:
              'Opções: (1) empresa de monitoramento; (2) segurança local compartilhada com a loja vizinha.',
          },
        ],
      },
      {
        title: '9. Estruturação Sistêmica',
        tasks: [
          { id: 'f1-estrutura-sistemica', label: 'Estruturar sistemas, funis de venda, acessos e criação da loja' },
          { id: 'f1-codigos', label: 'Estudar codificação dos produtos e tradução para o guarani' },
          { id: 'f1-acesso-vendedores', label: 'Criar acessos para os vendedores' },
          { id: 'f1-treinamento-portal', label: 'Treinar os vendedores no uso do portal' },
        ],
      },
      {
        title: '10. Logística',
        tasks: [
          { id: 'f1-caminhao', label: 'Estudar compra de caminhão próprio para o Paraguai' },
          {
            id: 'f1-agregados',
            label: 'Buscar agregados para transporte',
            description: 'Objetivo: ter um prestador de serviço fixo.',
          },
          { id: 'f1-empilhadeira', label: 'Pesquisar empresas de aluguel de empilhadeira' },
          { id: 'f1-hotel-diretoria', label: 'Reservar hotel para todas as idas da diretoria ao Paraguai' },
          {
            id: 'f1-hotel-feira',
            label: 'Reservar hotel para todos os participantes da feira',
            description: 'Paraguay Business Week 2026 (11-13 nov).',
          },
        ],
      },
      {
        title: '11. Pessoas & Contratação',
        tasks: [
          {
            id: 'f1-captacao',
            label: 'Mapear canais de captação de pessoal',
            description: 'Empresas de recrutamento, indicações, grupos de vagas no WhatsApp e no Facebook.',
          },
          { id: 'f1-vendedores', label: 'Contratar 2 vendedores' },
          { id: 'f1-caixa', label: 'Contratar 1 pessoa para o caixa da loja' },
          { id: 'f1-servicos-gerais', label: 'Contratar 1 pessoa para serviços gerais' },
          { id: 'f1-operador-empilhadeira', label: 'Contratar operador de empilhadeira + ajudante' },
          { id: 'f1-uniforme', label: 'Uniforme para funcionários' },
        ],
      },
      {
        title: '12. Marketing',
        tasks: [
          { id: 'f1-mkt-catalogo-homes', label: 'Catálogo Fast Homes traduzido' },
          { id: 'f1-mkt-catalogo-mix', label: 'Catálogo do mix de produtos' },
          { id: 'f1-mkt-amostras', label: 'Amostras de produtos para a loja' },
          {
            id: 'f1-mkt-personas',
            label: 'Montar as personas de atendimento no PY',
            description: 'Linguagem adaptada à cultura paraguaia (Loja e Fast Homes).',
          },
          {
            id: 'f1-mkt-trafego',
            label: 'Tráfego pago para a loja',
            description: 'Instagram, Facebook, Google e YouTube.',
          },
          {
            id: 'f1-mkt-fachada',
            label: 'Fachada da loja',
            description: 'Necessário tirar medidas e fotos da fachada real.',
          },
          { id: 'f1-mkt-concorrencia', label: 'Mapeamento da concorrência em Foz do Iguaçu' },
          { id: 'f1-mkt-instagram', label: 'Instagram da loja PY' },
          { id: 'f1-mkt-banner', label: 'Banner de comunicação' },
          {
            id: 'f1-mkt-tv',
            label: 'TV para usar na feira e depois levar para a loja',
            description: 'Definida a compra de uma TV de 65".',
          },
          {
            id: 'f1-26',
            label: 'Estratégia de lançamento',
            description: 'Influenciadores, coquetel de lançamento e imprensa local.',
          },
          { id: 'f1-27', label: 'Participar Paraguay Business Week 2026 (11-13 nov)' },
          { id: 'f1-mkt-abertura', label: 'Ação para abertura da loja' },
          {
            id: 'f1-mkt-brindes',
            label: 'Brindes e amostras para a inauguração',
            description: 'Brindes a serem estudados conforme a cultura local.',
          },
          { id: 'f1-mkt-musica', label: 'Música para a abertura', description: 'Voz e violão.' },
          { id: 'f1-mkt-refletor', label: 'Instalar refletor para a inauguração' },
          {
            id: 'f1-viagem-diretoria',
            label: 'Viagem da diretoria para a inauguração (dia 05)',
            description:
              'Levar tudo o que precisa sair do Brasil: uniformes, brindes produzidos no Brasil e amostras para a loja.',
          },
        ],
      },
    ],
  },
  {
    id: 'frente2',
    navLabel: 'Frente 2 — Incorporadora',
    title: 'Frente 2 — Incorporadora Paraguai',
    subtitle: 'Infraestrutura & Galpões',
    meta: 'Meta: Galpão 1 jan-fev 2027',
    status: '5% progresso',
    blocker: 'Terreno industrial não definido | Estrutura societária pendente',
    subfases: [
      {
        title: '1. Estrutura Jurídica & Societária',
        tasks: societarioSection(
          'f2',
          {
            id: 'f2-estrutura',
            label: 'Decidir estrutura: Filial vs. Empresa nova PY',
          },
          'a empresa',
          false,
        ),
      },
      {
        title: '2. Parecer Fiscal & Tributário',
        tasks: [
          {
            id: 'f2-contabil',
            label: 'Contratar empresa contábil',
            info: { modal: 'propostas', context: 'contabil-f2' },
          },
          { id: 'f2-6', label: 'Obter parecer tributário: Filial vs. Isolada' },
          { id: 'f2-7', label: 'Analisar tributação: aluguel galpão MaxSteel' },
          { id: 'f2-faturamento', label: 'Estruturar faturamento e emissão de documentos fiscais' },
        ],
      },
      {
        title: '3. Prospecção de Terrenos (10.000-20.000 m²)',
        tasks: [
          { id: 'f2-8', label: 'Mapear região industrial (CDE, Minga Guazú, Hernandarias)' },
          { id: 'f2-9', label: 'Contatar Migra Paraguai & imobiliárias locais' },
          { id: 'f2-10', label: 'Selecionar 3-5 terrenos para due diligence' },
          { id: 'f2-11', label: 'Realizar due diligence completa' },
          { id: 'f2-12', label: 'Negociar e assinar contrato compra/aluguel' },
        ],
      },
      {
        title: '4. Projetos & Licenciamento',
        tasks: [
          { id: 'f2-13', label: 'Desenvolver masterplan: 5 galpões estruturados' },
          { id: 'f2-14', label: 'Projeto executivo Galpão 1 (2.000-5.000 m²)' },
          { id: 'f2-15', label: 'Obter aprovação municipal & licenças obras' },
          { id: 'f2-16', label: 'Registrar propriedade em nome da empresa' },
        ],
      },
      {
        title: '5. Construção & Operação Galpão 1',
        tasks: [
          { id: 'f2-17', label: 'Orçamento construção Galpão 1' },
          { id: 'f2-18', label: 'Licitar/contratar construtor & fornecedores' },
          { id: 'f2-19', label: 'Alugar Galpão 1 para MaxSteel (contrato 3+ anos)' },
        ],
      },
      {
        title: '6. Financeiro & Contábil',
        tasks: [{ id: 'f2-20', label: 'Orçamento completo: Terreno + Masterplan + Galpão 1' }],
      },
    ],
  },
  {
    id: 'frente3',
    navLabel: 'Frente 3 — MaxSteel',
    title: 'Frente 3 — MaxSteel Paraguai Maquila',
    subtitle: 'Lei 7.547/2025 | 90% Exportação Brasil',
    meta: 'Meta: Operação industrial abril 2027',
    status: '8% progresso',
    blocker:
      'Programa Maquila (SIMEX) | Coeficientes INTN | Origem MERCOSUL | Iniciar SETEMBRO 2026',
    danger: true,
    subfases: [
      {
        title: '1. Estrutura Jurídica & Societária',
        tasks: [
          ...societarioSection(
            'f3',
            {
              id: 'f3-estrutura',
              label: 'Escolher estrutura jurídica (E.A.S. vs S.A.)',
              info: { modal: 'struct', context: 'struct-f3' },
            },
            'a fábrica',
            false,
          ),
          ...bkmMilestones('f3'),
        ],
      },
      {
        title: '2. Programa de Maquila (Lei 7.547/2025) — CRÍTICO',
        tasks: [
          {
            id: 'f3-consultoria-maquila',
            label: 'Contratar consultoria para o Programa de Maquila',
            description:
              'Contratada: Braspar (Asunción) — elaboração do projeto, apresentação ao CNIME e INTN, aprovação biministerial. Honorários USD 12.000 (50% na contratação, 50% na aprovação).',
            info: { modal: 'propostas', context: 'consultoria-maquila-f3' },
          },
          { id: 'f3-6', label: 'INICIAR Programa Maquila IMEDIATAMENTE (SETEMBRO 2026)' },
          { id: 'f3-7', label: 'Elaborar documentação técnica completa' },
          { id: 'f3-8', label: 'Certificar coeficientes junto INTN' },
          { id: 'f3-9', label: 'Confirmar origem MERCOSUL por NCM (60% extrazona / 40% regional)' },
          { id: 'f3-10', label: 'Apresentar Programa ao CNIME' },
          { id: 'f3-11', label: 'Obter aprovação biministerial (90-120 dias)' },
        ],
      },
      {
        title: '3. Parecer Fiscal & Tributário',
        tasks: [
          {
            id: 'f3-contabil',
            label: 'Contratar empresa contábil',
            info: { modal: 'propostas', context: 'contabil-f3' },
          },
          { id: 'f3-12', label: 'Obter parecer fiscal: Brasil vs. Paraguai isolado' },
          { id: 'f3-13', label: 'Validar cenários financeiros vs. CAPEX & receita' },
          { id: 'f3-faturamento', label: 'Estruturar faturamento e emissão de documentos fiscais' },
        ],
      },
      {
        title: '4. Engenharia & Especificação de Máquinas',
        tasks: [
          { id: 'f3-engenheiro', label: 'Contratar engenheiro para coordenar a estruturação operacional' },
          { id: 'f3-14', label: 'Investigar V8 (Piracicaba) — Slitter Alianza del Acero' },
          { id: 'f3-15', label: 'Comparar Slitter V8 vs. máquinas chinesas' },
          { id: 'f3-16', label: 'Especificar perfiladeiras (Linha Drywall)' },
          { id: 'f3-17', label: 'Especificar perfiladeiras (Linha Steel Frame Estrutural)' },
          { id: 'f3-18', label: 'Orçamento completo CAPEX: Máquinas + Instalações + Galpão' },
          { id: 'f3-19', label: 'Contratar Edgar Zelaya (90 dias) como consultor implantação' },
        ],
      },
      {
        title: '5. Localização & Infraestrutura Industrial',
        tasks: [
          { id: 'f3-20', label: 'Definir localização: Galpão 1 alugado da Incorporadora' },
          { id: 'f3-21', label: 'Desenvolver layout: 4 linhas de produção' },
          { id: 'f3-22', label: 'Especificar infraestrutura: Energia | Água | Ar comprimido' },
        ],
      },
      {
        title: '6. Cronograma & Construção Galpão 1',
        tasks: [
          { id: 'f3-23', label: 'Sincronizar com Frente 2: Galpão 1 pronto jan-fev 2027' },
          { id: 'f3-24', label: 'Instalação máquinas & equipamentos (fev-mar 2027)' },
          { id: 'f3-25', label: 'Testes + lote piloto (mar 2027)' },
          { id: 'f3-26', label: 'Operação industrial plena (abr 2027)' },
        ],
      },
      {
        title: '7. Contratações & Operação',
        tasks: [
          { id: 'f3-27', label: 'Estrutura de pessoal: Gerente + Supervisores + Operadores' },
          { id: 'f3-28', label: 'Treinar equipe: Slitter + Perfiladeiras + Qualidade' },
          { id: 'f3-29', label: 'Protocolo de qualidade & certificações (ISO/NBR)' },
          { id: 'f3-30', label: 'Contabilidade & reportes fiscais mensais' },
        ],
      },
      {
        title: '8. Logística & Exportação Brasil',
        tasks: [
          { id: 'f3-31', label: 'Definir rota logística: MaxSteel PY → Portos' },
          {
            id: 'f3-32',
            label: 'Contratar despachante aduaneiro Brasil',
            info: { modal: 'propostas', context: 'despachante-f3' },
          },
          { id: 'f3-33', label: 'Negociar freinte com operadores logísticos' },
        ],
      },
      {
        title: '9. Financeiro & Viabilidade',
        tasks: [
          { id: 'f3-34', label: 'Simulação financeira: CAPEX vs. Margem 1% maquila' },
          { id: 'f3-35', label: 'Go/No-go decisão: Aprovação financeira Conselho' },
        ],
      },
    ],
  },
]

export const totalSubfases = frentes.reduce((n, f) => n + f.subfases.length, 0)

export interface FlatTask {
  id: string
  label: string
  description?: string
  frenteId: Frente['id']
  frenteLabel: string
  subfaseTitle: string
}

export const allTasksFlat: FlatTask[] = frentes.flatMap((f) =>
  f.subfases.flatMap((s) =>
    s.tasks.map((t) => ({
      id: t.id,
      label: t.label,
      description: t.description,
      frenteId: f.id,
      frenteLabel: f.navLabel,
      subfaseTitle: s.title.replace(/^\d+\.\s*/, ''),
    })),
  ),
)
