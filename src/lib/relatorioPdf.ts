import type { Frente } from '@/data/frentes'
import type { TaskStatus } from '@/hooks/useTasksStore'
import type { RowInput } from 'jspdf-autotable'

const STATUS_TEXT: Record<TaskStatus, string> = {
  nao_iniciado: 'Não iniciado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
}

const RED: [number, number, number] = [196, 30, 58]
const DARK: [number, number, number] = [40, 40, 40]
const MUTED: [number, number, number] = [110, 110, 110]

export interface RelatorioData {
  taskStatus: (taskId: string) => TaskStatus
  deadlines: Record<string, string>
  owners: Record<string, string>
}

export interface CronogramaRow {
  id: string
  label: string
  frenteLabel: string
  subfaseTitle: string
  deadline: string
  owner: string
  status: TaskStatus
}

// As fontes padrão do PDF só cobrem Latin-1: troca o que fica fora disso.
function txt(value: string) {
  return value
    .replace(/[—–]/g, '-')
    .replace(/→/g, '->')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, '')
    .trim()
}

function formatDate(iso: string) {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function newDoc(title: string, subtitle: string) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  doc.setFillColor(...RED)
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...DARK)
  doc.text(txt(title), 14, 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text(txt(subtitle), 14, 25)

  return { doc, autoTable }
}

function addFooter(doc: import('jspdf').jsPDF) {
  const pages = doc.getNumberOfPages()
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('Projeto Paraguai - FAST Sistemas Construtivos', 14, height - 8)
    doc.text(`Página ${i} de ${pages}`, width - 14, height - 8, { align: 'right' })
  }
}

export async function baixarPlanoDeAcaoPdf(lista: Frente[], data: RelatorioData) {
  const hoje = todayISO()
  const titulo =
    lista.length === 1 ? `Plano de Ação - ${lista[0].title}` : 'Plano de Ação - Projeto Paraguai'
  const { doc, autoTable } = await newDoc(titulo, `Gerado em ${formatDate(hoje)}`)

  let y = 32
  lista.forEach((frente, index) => {
    const ids = frente.subfases.flatMap((s) => s.tasks.map((t) => t.id))
    const done = ids.filter((id) => data.taskStatus(id) === 'concluido').length
    const pct = ids.length ? Math.round((done / ids.length) * 100) : 0

    if (index > 0) {
      doc.addPage()
      y = 18
    }
    if (lista.length > 1) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(...RED)
      doc.text(txt(frente.title), 14, y)
      y += 6
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...DARK)
    doc.text(
      txt(`${frente.subtitle} | ${frente.meta} | ${done}/${ids.length} tarefas concluídas (${pct}%)`),
      14,
      y,
    )
    y += 4

    const body: RowInput[] = frente.subfases.flatMap((subfase): RowInput[] => {
      const header = [
        {
          content: txt(subfase.title),
          colSpan: 4,
          styles: { fontStyle: 'bold' as const, fillColor: [245, 228, 232] as [number, number, number], textColor: RED },
        },
      ]
      if (subfase.tasks.length === 0) {
        return [header, [{ content: 'Atividades a definir', colSpan: 4, styles: { textColor: MUTED } }]]
      }
      return [
        header,
        ...subfase.tasks.map((task) => {
          const status = data.taskStatus(task.id)
          return [
            txt(task.description ? `${task.label}\n${task.description}` : task.label),
            txt(data.owners[task.id] ?? '') || '-',
            formatDate(data.deadlines[task.id] ?? ''),
            {
              content: STATUS_TEXT[status],
              styles: {
                textColor: status === 'concluido' ? ([22, 128, 61] as [number, number, number]) : DARK,
                fontStyle: status === 'concluido' ? ('bold' as const) : ('normal' as const),
              },
            },
          ]
        }),
      ]
    })

    autoTable(doc, {
      startY: y,
      head: [['Tarefa', 'Responsável', 'Prazo', 'Status']],
      body,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2, textColor: DARK, lineColor: [220, 220, 220] },
      headStyles: { fillColor: RED, textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 50 }, 2: { cellWidth: 24 }, 3: { cellWidth: 28 } },
      margin: { left: 14, right: 14, bottom: 14 },
    })
  })

  addFooter(doc)
  const slug = lista.length === 1 ? `-${lista[0].id}` : ''
  doc.save(`plano-de-acao${slug}-${hoje}.pdf`)
}

export async function baixarCronogramaPdf(rows: CronogramaRow[], filtros: string, frenteLabel?: string) {
  const hoje = todayISO()
  const atrasadas = rows.filter((r) => r.deadline && r.deadline < hoje && r.status !== 'concluido').length
  const concluidas = rows.filter((r) => r.status === 'concluido').length
  const emAndamento = rows.filter((r) => r.status === 'em_andamento').length

  const { doc, autoTable } = await newDoc(
    frenteLabel ? `Cronograma - ${frenteLabel}` : 'Cronograma - Projeto Paraguai',
    `Gerado em ${formatDate(hoje)} | Filtros: ${filtros}`,
  )

  doc.setFontSize(9.5)
  doc.setTextColor(...DARK)
  doc.text(
    `${rows.length} tarefas | ${concluidas} concluídas | ${emAndamento} em andamento | ${atrasadas} atrasadas`,
    14,
    32,
  )

  autoTable(doc, {
    startY: 36,
    head: [['Frente', 'Tarefa', 'Responsável', 'Prazo', 'Status']],
    body: rows.map((row) => {
      const late = !!row.deadline && row.deadline < hoje && row.status !== 'concluido'
      return [
        txt(row.frenteLabel.replace(/^Frente \d+ — /, '')),
        txt(`${row.label}\n${row.subfaseTitle}`),
        txt(row.owner) || '-',
        {
          content: late ? `${formatDate(row.deadline)}\nATRASADA` : formatDate(row.deadline),
          styles: late ? { textColor: [200, 30, 30] as [number, number, number], fontStyle: 'bold' as const } : {},
        },
        STATUS_TEXT[row.status],
      ]
    }),
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2, textColor: DARK, lineColor: [220, 220, 220] },
    headStyles: { fillColor: RED, textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 32 }, 2: { cellWidth: 45 }, 3: { cellWidth: 26 }, 4: { cellWidth: 28 } },
    margin: { left: 14, right: 14, bottom: 14 },
  })

  addFooter(doc)
  const slug = frenteLabel
    ? '-' +
      frenteLabel
        .split('—')[0]
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
    : ''
  doc.save(`cronograma${slug}-${hoje}.pdf`)
}
