import type { Frente } from '@/data/frentes'
import type { Plano5w2h, TaskStatus } from '@/hooks/useTasksStore'

const STATUS_TEXT: Record<TaskStatus, string> = {
  nao_iniciado: 'Não iniciado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
}

export interface Excel5w2hData {
  taskStatus: (taskId: string) => TaskStatus
  deadlines: Record<string, string>
  owners: Record<string, string>
  plano5w2h: Record<string, Plano5w2h>
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toDate(iso: string) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export async function baixar5w2hExcel(frente: Frente, data: Excel5w2hData) {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Portal Projeto Paraguai'
  const sheet = workbook.addWorksheet('5W2H', {
    views: [{ state: 'frozen', ySplit: 3 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  })

  sheet.columns = [
    { key: 'secao', width: 26 },
    { key: 'what', width: 46 },
    { key: 'why', width: 36 },
    { key: 'where', width: 22 },
    { key: 'when', width: 13 },
    { key: 'who', width: 24 },
    { key: 'how', width: 50 },
    { key: 'howMuch', width: 16 },
    { key: 'status', width: 15 },
  ]

  sheet.mergeCells('A1:I1')
  sheet.getCell('A1').value = `5W2H — ${frente.title}`
  sheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFC41E3A' } }
  sheet.mergeCells('A2:I2')
  const hoje = todayISO()
  sheet.getCell('A2').value = `Gerado em ${hoje.split('-').reverse().join('/')}`
  sheet.getCell('A2').font = { italic: true, size: 9, color: { argb: 'FF6E6E6E' } }

  const header = sheet.getRow(3)
  header.values = [
    'Seção',
    'O quê (What)',
    'Por quê (Why)',
    'Onde (Where)',
    'Quando (When)',
    'Quem (Who)',
    'Como (How)',
    'Quanto (How much)',
    'Status',
  ]
  header.height = 22
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC41E3A' } }
    cell.alignment = { vertical: 'middle', wrapText: true }
  })

  for (const subfase of frente.subfases) {
    for (const task of subfase.tasks) {
      const plano = data.plano5w2h[task.id] ?? {}
      const row = sheet.addRow({
        secao: subfase.title,
        what: task.description ? `${task.label}\n${task.description}` : task.label,
        why: plano.why ?? '',
        where: plano.where ?? '',
        when: toDate(data.deadlines[task.id] ?? ''),
        who: data.owners[task.id] ?? '',
        how: plano.how ?? '',
        howMuch: plano.howMuch ?? '',
        status: STATUS_TEXT[data.taskStatus(task.id)],
      })
      row.alignment = { vertical: 'top', wrapText: true }
      row.getCell('when').numFmt = 'dd/mm/yyyy'
      row.getCell('what').font = { bold: true }
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } } }
      })
      if (data.taskStatus(task.id) === 'concluido') {
        row.getCell('status').font = { bold: true, color: { argb: 'FF16803D' } }
      }
    }
  }

  sheet.autoFilter = { from: 'A3', to: 'I3' }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `5w2h-${frente.id}-${hoje}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
