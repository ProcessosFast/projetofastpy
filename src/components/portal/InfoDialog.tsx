import * as React from 'react'

import { Download, ExternalLink, Paperclip, X } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CompareTable } from '@/components/portal/CompareTable'
import { ProsConsCard } from '@/components/portal/ProsConsCard'
import { RecoBox } from '@/components/portal/RecoBox'
import { useTasksStore, type Choice, type ListItem } from '@/hooks/useTasksStore'
import { downloadFile, formatFileSize, saveFile } from '@/lib/fileStore'
import {
  businessLicenseChecklist,
  businessLicenseDocsChecklist,
  municipalLicenseChecklist,
  suaceConstitutionOptions,
  type InfoModal,
} from '@/data/frentes'

const LICENCA_MUNICIPAL_INFO: Record<string, { businessNoun: string; municipio: string; artigo: string }> = {
  'licenca-municipal-f1': {
    businessNoun: 'loja',
    municipio: 'a Municipalidad de Ciudad del Este',
    artigo: 'a',
  },
  'licenca-municipal-f2': {
    businessNoun: 'empresa',
    municipio: 'a municipalidade competente',
    artigo: 'a',
  },
  'licenca-municipal-f3': {
    businessNoun: 'fábrica',
    municipio: 'a municipalidade competente',
    artigo: 'a',
  },
}

interface InfoDialogState {
  modal: InfoModal
  context?: string
}

interface InfoDialogProps {
  state: InfoDialogState | null
  onOpenChange: (open: boolean) => void
}

export function InfoDialog({ state, onOpenChange }: InfoDialogProps) {
  const { choices, chooseOption, clearChoice, isChecked, toggleTask, lists, addListItem, removeListItem } =
    useTasksStore()
  const [nameDraft, setNameDraft] = React.useState('')
  const [addressDraft, setAddressDraft] = React.useState('')
  const [proposalDraft, setProposalDraft] = React.useState('')
  const [proposalFile, setProposalFile] = React.useState<File | null>(null)
  const [proposalLink, setProposalLink] = React.useState('')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const context = state?.context ?? ''
  const currentChoice = choices[context]

  const isNameModal = state?.modal === 'representante' || state?.modal === 'banco'

  React.useEffect(() => {
    if (isNameModal) setNameDraft(currentChoice?.label ?? '')
    if (state?.modal === 'enderecos') setAddressDraft('')
    if (state?.modal === 'propostas') {
      setProposalDraft('')
      setProposalFile(null)
      setProposalLink('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.context, state?.modal])

  if (!state) return null

  const choose = (choice: Choice) => {
    chooseOption(context, choice)
    onOpenChange(false)
  }

  const saveName = () => {
    const trimmed = nameDraft.trim()
    if (!trimmed) return
    choose({ value: trimmed, label: trimmed })
  }

  const listItems = lists[context] ?? []

  const addAddress = () => {
    const trimmed = addressDraft.trim()
    if (!trimmed) return
    addListItem(context, { label: trimmed })
    setAddressDraft('')
  }

  const addProposal = async () => {
    const trimmed = proposalDraft.trim()
    const trimmedLink = proposalLink.trim()
    if (!trimmed && !proposalFile && !trimmedLink) return
    if (proposalFile) {
      const fileKey = `${context}-${Date.now()}`
      await saveFile(fileKey, proposalFile)
      addListItem(context, {
        label: trimmed || proposalFile.name,
        fileKey,
        fileName: proposalFile.name,
        fileSize: proposalFile.size,
        fileLink: trimmedLink || undefined,
      })
    } else if (trimmedLink) {
      addListItem(context, { label: trimmed || trimmedLink, fileLink: trimmedLink })
    } else {
      addListItem(context, { label: trimmed })
    }
    setProposalDraft('')
    setProposalFile(null)
    setProposalLink('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Dialog open={!!state} onOpenChange={onOpenChange}>
      <DialogContent>
        {currentChoice && !isNameModal && state.modal !== 'propostas' && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-success/40 bg-success/10 px-4 py-2.5 text-[12.5px]">
            <span className="text-success">
              ✓ Escolha atual: <strong>{currentChoice.label}</strong>
            </span>
            <button
              type="button"
              className="font-semibold text-text-dim underline-offset-2 hover:text-white hover:underline"
              onClick={() => clearChoice(context)}
            >
              Remover escolha
            </button>
          </div>
        )}
        {state.modal === 'socios' && (
          <>
            <DialogTitle>🤝 Sócios</DialogTitle>
            <DialogDescription>
              Composição societária definida para a operação no Paraguai.
            </DialogDescription>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {['Nicole', 'Josélio', 'Priscilla', 'Guilherme'].map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-[10px] border border-line bg-surface-2 p-4"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-fast-red text-sm font-extrabold text-white">
                    {name[0]}
                  </span>
                  <span className="text-[13px] font-semibold text-text">{name}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {state.modal === 'representante' && (
          <>
            <DialogTitle>🧑‍💼 Representante legal</DialogTitle>
            <DialogDescription>
              Informe o nome de quem vai atuar como representante legal desta empresa.
            </DialogDescription>
            {currentChoice && (
              <p className="mb-4 text-[12.5px] text-success">
                ✓ Definido atualmente: <strong>{currentChoice.label}</strong>
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                placeholder="Nome completo do representante"
                className="h-9 flex-1 rounded-md border border-line bg-surface-2 px-3 text-[13px] text-text placeholder:text-text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50"
                autoFocus
              />
              <Button type="button" onClick={saveName} disabled={!nameDraft.trim()}>
                Salvar
              </Button>
            </div>
            {currentChoice && (
              <button
                type="button"
                className="mt-3 text-[12.5px] font-semibold text-text-dim underline-offset-2 hover:text-white hover:underline"
                onClick={() => {
                  clearChoice(context)
                  setNameDraft('')
                }}
              >
                Remover nome
              </button>
            )}
          </>
        )}

        {state.modal === 'banco' && (
          <>
            <DialogTitle>🏦 Banco</DialogTitle>
            <DialogDescription>
              Informe qual banco será usado para a conta bancária empresarial.
            </DialogDescription>
            {currentChoice && (
              <p className="mb-4 text-[12.5px] text-success">
                ✓ Definido atualmente: <strong>{currentChoice.label}</strong>
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                placeholder="Nome do banco"
                className="h-9 flex-1 rounded-md border border-line bg-surface-2 px-3 text-[13px] text-text placeholder:text-text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50"
                autoFocus
              />
              <Button type="button" onClick={saveName} disabled={!nameDraft.trim()}>
                Salvar
              </Button>
            </div>
            {currentChoice && (
              <button
                type="button"
                className="mt-3 text-[12.5px] font-semibold text-text-dim underline-offset-2 hover:text-white hover:underline"
                onClick={() => {
                  clearChoice(context)
                  setNameDraft('')
                }}
              >
                Remover banco
              </button>
            )}
          </>
        )}

        {state.modal === 'enderecos' && (
          <>
            <DialogTitle>🏠 Opções de endereço</DialogTitle>
            <DialogDescription>
              Adicione os possíveis endereços/candidatos para a empresa.
            </DialogDescription>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={addressDraft}
                onChange={(e) => setAddressDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAddress()}
                placeholder="Endereço candidato (rua, bairro, cidade)"
                className="h-9 flex-1 rounded-md border border-line bg-surface-2 px-3 text-[13px] text-text placeholder:text-text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50"
                autoFocus
              />
              <Button type="button" onClick={addAddress} disabled={!addressDraft.trim()}>
                Adicionar
              </Button>
            </div>

            {listItems.length === 0 ? (
              <p className="text-[12.5px] text-text-dim">Nenhuma opção adicionada ainda.</p>
            ) : (
              <ul className="space-y-2">
                {listItems.map((raw, index) => {
                  const address: ListItem = typeof raw === 'string' ? { label: raw } : raw
                  return (
                    <li
                      key={`${address.label}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5"
                    >
                      <span className="text-[13px] text-text">{address.label}</span>
                      <button
                        type="button"
                        title="Remover opção"
                        className="flex size-5 shrink-0 items-center justify-center rounded-full text-text-dim hover:bg-danger/20 hover:text-danger"
                        onClick={() => removeListItem(context, index)}
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}

        {state.modal === 'propostas' && (
          <>
            <DialogTitle>📎 Propostas de assessoria jurídica/contábil</DialogTitle>
            <DialogDescription>
              Anexe as propostas recebidas e marque qual foi aprovada. Recomendado: cole o link do
              Drive/SharePoint em vez de subir o arquivo — assim ele fica visível em qualquer
              computador, não só no seu.
            </DialogDescription>

            <div className="mb-4 flex flex-col gap-2">
              <input
                type="text"
                value={proposalDraft}
                onChange={(e) => setProposalDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !proposalFile && addProposal()}
                placeholder="Nome do escritório / resumo da proposta"
                className="h-9 rounded-md border border-line bg-surface-2 px-3 text-[13px] text-text placeholder:text-text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50"
              />
              <input
                type="url"
                value={proposalLink}
                onChange={(e) => setProposalLink(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !proposalFile && addProposal()}
                placeholder="Link do arquivo (Google Drive, SharePoint, OneDrive...) — recomendado"
                className="h-9 rounded-md border border-line bg-surface-2 px-3 text-[13px] text-text placeholder:text-text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fast-red/50"
              />
              <p className="text-center text-[11px] text-text-dim">ou</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="flex h-9 flex-1 cursor-pointer items-center gap-2 rounded-md border border-dashed border-line bg-surface-2 px-3 text-[12.5px] text-text-dim hover:border-fast-red hover:text-fast-red">
                  <Paperclip className="size-3.5 shrink-0" />
                  <span className="truncate">
                    {proposalFile
                      ? proposalFile.name
                      : 'Anexar arquivo direto (só fica salvo neste computador)'}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => setProposalFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <Button
                  type="button"
                  onClick={addProposal}
                  disabled={!proposalDraft.trim() && !proposalFile && !proposalLink.trim()}
                >
                  Anexar
                </Button>
              </div>
            </div>

            {listItems.length === 0 ? (
              <p className="text-[12.5px] text-text-dim">Nenhuma proposta anexada ainda.</p>
            ) : (
              <ul className="space-y-2">
                {listItems.map((raw, index) => {
                  const proposal: ListItem = typeof raw === 'string' ? { label: raw } : raw
                  const isApproved = currentChoice?.value === proposal.label
                  return (
                    <li
                      key={`${proposal.label}-${index}`}
                      className={
                        'flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ' +
                        (isApproved ? 'border-success/40 bg-success/10' : 'border-line bg-surface-2')
                      }
                    >
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="flex items-center gap-2 text-[13px] text-text">
                          {isApproved && <span className="font-extrabold text-success">✓</span>}
                          <span className="truncate">{proposal.label}</span>
                          {isApproved && (
                            <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-wide text-success">
                              Aprovada
                            </span>
                          )}
                        </span>
                        {proposal.fileKey && (
                          <span className="flex items-center gap-1 text-[11px] text-text-dim">
                            <Paperclip className="size-3" />
                            {proposal.fileName}
                            {proposal.fileSize ? ` · ${formatFileSize(proposal.fileSize)}` : ''}
                            <span className="text-text-dim/70">(salvo só neste computador)</span>
                          </span>
                        )}
                        {proposal.fileLink && (
                          <a
                            href={proposal.fileLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-fast-red underline-offset-2 hover:underline"
                          >
                            <ExternalLink className="size-3 shrink-0" />
                            Link anexado
                          </a>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        {proposal.fileKey && (
                          <button
                            type="button"
                            title="Baixar arquivo"
                            className="flex size-6 items-center justify-center rounded-full text-text-dim hover:bg-fast-red/20 hover:text-fast-red"
                            onClick={() => downloadFile(proposal.fileKey!)}
                          >
                            <Download className="size-3.5" />
                          </button>
                        )}
                        {proposal.fileLink && !proposal.fileKey && (
                          <a
                            href={proposal.fileLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir link"
                            className="flex size-6 items-center justify-center rounded-full text-text-dim hover:bg-fast-red/20 hover:text-fast-red"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                        {!isApproved && (
                          <button
                            type="button"
                            className="rounded-md border border-wine-soft px-2 py-1 text-[11px] font-bold text-fast-red transition-colors hover:bg-fast-red hover:text-white"
                            onClick={() => choose({ value: proposal.label, label: proposal.label })}
                          >
                            Aprovar
                          </button>
                        )}
                        <button
                          type="button"
                          title="Remover proposta"
                          className="flex size-5 items-center justify-center rounded-full text-text-dim hover:bg-danger/20 hover:text-danger"
                          onClick={() => {
                            removeListItem(context, index)
                            if (isApproved) clearChoice(context)
                          }}
                        >
                          <X className="size-3.5" />
                        </button>
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}

        {state.modal === 'constituicao-suace' && (
          <>
            <DialogTitle>🏢 Constituir a empresa pelo SUACE</DialogTitle>
            <DialogDescription>
              Existem três caminhos possíveis para formalizar o ato constitutivo. Marque os
              passos conforme o caminho escolhido.
            </DialogDescription>
            {suaceConstitutionOptions.map((option, optIdx) => (
              <div key={option.title} className="mb-5 rounded-[10px] border border-line bg-surface-2 p-5">
                <h5 className="mb-1 text-sm font-extrabold text-white">{option.title}</h5>
                {option.note && (
                  <p className="mb-3 text-[12px] leading-relaxed text-text-dim">{option.note}</p>
                )}
                <ul className="space-y-2">
                  {option.items.map((item, idx) => {
                    const itemId = `${context}-opt${optIdx}-${idx}`
                    const done = isChecked(itemId)
                    return (
                      <li key={itemId}>
                        <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5">
                          <Checkbox
                            className="mt-0.5"
                            checked={done}
                            onCheckedChange={() => toggleTask(itemId)}
                          />
                          <span
                            className={
                              done
                                ? 'text-[13px] font-medium text-text-dim line-through'
                                : 'text-[13px] font-medium text-text'
                            }
                          >
                            {item}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </>
        )}

        {state.modal === 'licenca-municipal' && (
          <>
            <DialogTitle>🏛️ Habilitação Municipal do Estabelecimento</DialogTitle>
            <DialogDescription>
              Objetivo: deixar o endereço físico d
              {LICENCA_MUNICIPAL_INFO[context]?.artigo ?? 'a'}{' '}
              {LICENCA_MUNICIPAL_INFO[context]?.businessNoun ?? 'estabelecimento'} regularizado
              perante {LICENCA_MUNICIPAL_INFO[context]?.municipio ?? 'a municipalidade competente'}
              .
            </DialogDescription>
            <ul className="space-y-2">
              {municipalLicenseChecklist.map((item, idx) => {
                const itemId = `${context}-item-${idx}`
                const done = isChecked(itemId)
                return (
                  <li key={itemId}>
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
                      <Checkbox
                        className="mt-0.5"
                        checked={done}
                        onCheckedChange={() => toggleTask(itemId)}
                      />
                      <span
                        className={
                          done
                            ? 'text-[13px] font-medium text-text-dim line-through'
                            : 'text-[13px] font-medium text-text'
                        }
                      >
                        {item}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {state.modal === 'patente-comercial' && (
          <>
            <DialogTitle>🏪 Patente Comercial</DialogTitle>
            <DialogDescription>
              Objetivo: regularizar a atividade comercial da FAST perante a Municipalidad.
            </DialogDescription>
            <ul className="mb-6 space-y-2">
              {businessLicenseChecklist.map((item, idx) => {
                const itemId = `${context}-item-${idx}`
                const done = isChecked(itemId)
                return (
                  <li key={itemId}>
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
                      <Checkbox
                        className="mt-0.5"
                        checked={done}
                        onCheckedChange={() => toggleTask(itemId)}
                      />
                      <span
                        className={
                          done
                            ? 'text-[13px] font-medium text-text-dim line-through'
                            : 'text-[13px] font-medium text-text'
                        }
                      >
                        {item}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>

            <span className="mb-2 block text-[10.5px] font-bold uppercase tracking-wide text-text-dim">
              Documentação da empresa — como obter o comprovante da Patente Comercial
            </span>
            <ul className="space-y-2">
              {businessLicenseDocsChecklist.map((item, idx) => {
                const itemId = `${context}-doc-${idx}`
                const done = isChecked(itemId)
                return (
                  <li key={itemId}>
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
                      <Checkbox
                        className="mt-0.5"
                        checked={done}
                        onCheckedChange={() => toggleTask(itemId)}
                      />
                      <span
                        className={
                          done
                            ? 'text-[13px] font-medium text-text-dim line-through'
                            : 'text-[13px] font-medium text-text'
                        }
                      >
                        {item}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {state.modal === 'licenca-importacao' && (
          <>
            <DialogTitle>📋 Licença Prévia de Importação — produtos de ferro/aço</DialogTitle>
            <DialogDescription>
              O Paraguai possui Licença Prévia de Importação para determinadas categorias de
              produtos de ferro/aço.
            </DialogDescription>

            <div className="mb-5 rounded-[10px] border border-line bg-surface-2 p-5">
              <span className="mb-2 block text-[10.5px] font-bold uppercase tracking-wide text-text-dim">
                O MIC atualmente lista, entre outras
              </span>
              <ul className="space-y-2">
                {[
                  'Alambres',
                  'Barras de ferro/aço',
                  'Torres e castilletes',
                  'Uma categoria específica de produtos siderúrgicos',
                ].map((item) => (
                  <li key={item} className="relative pl-5 text-[12.5px] leading-relaxed text-text-dim">
                    <span className="absolute left-0 top-0 font-extrabold text-fast-red">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <RecoBox tone="info" title="⚠️ Isso não significa que todo produto com aço precise da licença">
              O que determina isso é principalmente a NCM/partida arancelária do produto.
            </RecoBox>

            <div className="mt-5 rounded-[10px] border border-line bg-surface-2 p-5">
              <span className="mb-2 block text-[10.5px] font-bold uppercase tracking-wide text-text-dim">
                Por exemplo, para vocês — verificar a NCM específica de
              </span>
              <ul className="space-y-2">
                {[
                  'Perfis de steel frame',
                  'Perfis metálicos para drywall',
                  'Chapas de aço',
                  'Estruturas metálicas',
                ].map((item) => (
                  <li key={item} className="relative pl-5 text-[12.5px] leading-relaxed text-text-dim">
                    <span className="absolute left-0 top-0 font-extrabold text-success">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {state.modal === 'struct' && (
          <>
            <DialogTitle>⚖️ E.A.S. vs S.A. — prós e contras</DialogTitle>
            <DialogDescription>
              Comparativo para apoiar a escolha da estrutura jurídica no Paraguai.
            </DialogDescription>
            <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ProsConsCard
                title="E.A.S. — Empresa por Ações Simplificadas"
                choiceLabel="E.A.S."
                selected={currentChoice?.value === 'eas'}
                onChoose={() => choose({ value: 'eas', label: 'E.A.S.' })}
                groups={[
                  {
                    label: 'Prós',
                    items: [
                      'Constituição 100% online, podendo sair em até 72h com estatuto padrão',
                      'Não exige capital mínimo',
                      'Pode ser aberta com apenas 1 sócio',
                      'Estrutura mais simples e flexível de administrar',
                    ],
                  },
                  {
                    label: 'Contras',
                    tone: 'con',
                    items: [
                      'Estrutura menos tradicional, pode gerar menos formalidade institucional',
                      'Menos reconhecida em negociações mais conservadoras',
                    ],
                  },
                ]}
              />
              <ProsConsCard
                title="S.A. — Sociedad Anónima"
                choiceLabel="S.A."
                selected={currentChoice?.value === 'sa'}
                onChoose={() => choose({ value: 'sa', label: 'S.A.' })}
                groups={[
                  {
                    label: 'Prós',
                    items: [
                      'Estrutura mais formal e institucional, com maior credibilidade',
                      'Modelo tradicional, bem consolidado no mercado',
                    ],
                  },
                  {
                    label: 'Contras',
                    tone: 'con',
                    items: [
                      'Constituição mais lenta, em até 15 dias úteis',
                      'Exige no mínimo 2 sócios',
                      'Estrutura de capital mais formal e processo mais burocrático',
                    ],
                  },
                ]}
              />
            </div>
            <CompareTable />

            <div className="mt-7 rounded-[10px] border border-line bg-surface-2 p-5">
              <span className="mb-2 block text-[10.5px] font-bold uppercase tracking-wide text-text-dim">
                Documentos/informações necessárias para a constituição
              </span>
              <ul className="space-y-2">
                {[
                  'Nome da empresa',
                  'Tipo societário: E.A.S., S.A., filial etc.',
                  'Sócios/acionistas',
                  'Percentual de participação de cada sócio',
                  'Capital social',
                  'Objeto social — precisa contemplar comércio/importação/exportação e os produtos/serviços relacionados a drywall, steel frame e materiais de construção, conforme a atividade que realmente será exercida',
                  'Endereço da empresa no Paraguai',
                  'Quem será o representante legal',
                ].map((item) => (
                  <li key={item} className="relative pl-5 text-[12.5px] leading-relaxed text-text-dim">
                    <span className="absolute left-0 top-0 font-extrabold text-success">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {state.modal === 'coworking' && (
          <>
            <DialogTitle>🏢 Escritório Coworking — qual opção escolher?</DialogTitle>
            <DialogDescription>
              Comparativo entre as duas opções de coworking disponíveis.
            </DialogDescription>
            <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ProsConsCard
                title="Coworking 1 — Domicilio Fiscal"
                choiceLabel="Coworking 1 — Domicilio Fiscal"
                selected={currentChoice?.value === 'domicilio-fiscal'}
                onChoose={() =>
                  choose({ value: 'domicilio-fiscal', label: 'Coworking 1 — Domicilio Fiscal' })
                }
                groups={[
                  {
                    label: 'O que é',
                    items: [
                      'Apenas endereço legal para constituição da empresa',
                      'Gs. 450.000/mês (ou Gs. 4.500.000/ano)',
                      'Inclui: RUC, patente municipal, conta bancária, representação fiscal',
                    ],
                  },
                  {
                    label: 'Contras',
                    tone: 'con',
                    items: [
                      '⚠️ NÃO vale para maquila/operação industrial — só para escritório administrativo',
                    ],
                  },
                  { label: 'Contato', items: ['Ireneo Rufinelli (Banco UENO)'] },
                ]}
              />
              <ProsConsCard
                title="Coworking 2 — Escritorio Compartido"
                choiceLabel="Coworking 2 — Escritorio Compartido"
                selected={currentChoice?.value === 'escritorio-compartido'}
                onChoose={() =>
                  choose({
                    value: 'escritorio-compartido',
                    label: 'Coworking 2 — Escritorio Compartido',
                  })
                }
                groups={[
                  {
                    label: 'O que é',
                    items: [
                      'Espaço físico de trabalho',
                      'Gs. 1.250.000/mês (ou Gs. 100.000/dia)',
                      'Inclui: mesas, energia, internet, ar-condicionado, café, limpeza',
                    ],
                  },
                  {
                    label: 'Observação',
                    tone: 'con',
                    items: [
                      'Escritório compartilhado — uso prático de espaço, não substitui galpão industrial',
                    ],
                  },
                  { label: 'Contato', items: ['Ireneo Rufinelli (mesmo contato)'] },
                ]}
              />
            </div>

            <h4 className="mb-3.5 text-[15px] font-extrabold text-white">
              Para a MaxSteel Paraguai, qual usar?
            </h4>
            <RecoBox tone="no" title="❌ Opção 1 (Domicilio Fiscal) — NÃO recomendado">
              O próprio documento diz: "procesos industriales, maquilas, depósitos... podrán
              necesitar una dirección diferente para su habilitación y operación".
            </RecoBox>
            <RecoBox tone="yes" title="✅ Opção 2 (Escritorio Compartido) — Complementar, não primário">
              Serve como escritório administrativo, mas a operação industrial (F530, corte,
              perfilamento) precisa do galpão real que será alugado no Km 14–16 (Frente 3 do
              passo a passo).
            </RecoBox>
            <RecoBox tone="info" title="Na prática">
              É preciso o galpão de 750 m² (Frente 3) para operar a máquina + estoque, não
              coworking. O Delta Coworking é apenas uma alternativa para respaldo de endereço
              administrativo, se necessário — mas o motor da operação é o galpão.
            </RecoBox>
          </>
        )}

        {state.modal === 'docs' && (
          <>
            <DialogTitle>🇵🇾 Documentos dos Sócios — o que providenciar no Brasil</DialogTitle>
            <DialogDescription>
              Para solicitar residência no Paraguai, cada sócio (Nicole, Josélio, Priscilla e
              Guilherme) normalmente vai precisar levar:
            </DialogDescription>
            <div className="mb-5 rounded-[10px] border border-line bg-surface-2 p-5">
              <span className="mb-2 block text-[10.5px] font-bold uppercase tracking-wide text-text-dim">
                Documentos pessoais
              </span>
              <ul className="space-y-2">
                {[
                  'RG/CIN ou passaporte válido',
                  'Certidão de nascimento',
                  'Certidão de casamento, se aplicável',
                  'Certidão de antecedentes criminais',
                  'Comprovantes/documentos que possam ser exigidos conforme a modalidade de residência',
                ].map((item) => (
                  <li key={item} className="relative pl-5 text-[12.5px] leading-relaxed text-text-dim">
                    <span className="absolute left-0 top-0 font-extrabold text-success">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-5 rounded-[10px] border border-line bg-surface-2 p-5">
              <span className="mb-3 block text-[10.5px] font-bold uppercase tracking-wide text-text-dim">
                Status por sócio
              </span>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {[
                  { id: 'socio-doc-nicole', name: 'Nicole' },
                  { id: 'socio-doc-joselio', name: 'Josélio' },
                  { id: 'socio-doc-priscilla', name: 'Priscilla' },
                  { id: 'socio-doc-guilherme', name: 'Guilherme' },
                ].map((socio) => {
                  const done = isChecked(socio.id)
                  return (
                    <label
                      key={socio.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5"
                    >
                      <Checkbox checked={done} onCheckedChange={() => toggleTask(socio.id)} />
                      <span
                        className={
                          done ? 'text-[13px] font-semibold text-text-dim line-through' : 'text-[13px] font-semibold text-text'
                        }
                      >
                        {socio.name}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
            <RecoBox tone="info" title="⚠️ Apostilamento">
              Os documentos emitidos no Brasil precisam estar apostilados, quando exigido. A
              própria Migraciones informa que documentos estrangeiros apostilados são
              reconhecidos no Paraguai sem outra legalização.
            </RecoBox>
          </>
        )}

        {state.modal === 'ruc' && (
          <>
            <DialogTitle>📄 Documentos para RUC de uma E.A.S.</DialogTitle>
            <DialogDescription>
              Lista de documentos exigidos para inscrever o RUC de uma Empresa por Ações
              Simplificadas junto à DNIT.
            </DialogDescription>
            <div className="mb-5 overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className="border-b-2 border-line pb-3 pr-4 text-left text-sm font-normal text-white">
                      Documento
                    </th>
                    <th className="border-b-2 border-line px-4 pb-3 text-left text-sm font-normal text-white">
                      Quem/onde obter
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      doc: 'Cédula de Identidade Paraguaia ou passaporte vigente do representante legal',
                      who: 'Representante legal',
                    },
                    {
                      doc: 'Cédula de Identidade ou documento de identidade vigente de todos os sócios',
                      who: 'Cada sócio',
                    },
                    { doc: 'Estatuto Social da E.A.S.', who: 'Documento de constituição da empresa' },
                    {
                      doc: 'Certificação da DGPEJBF',
                      who: 'Dirección General de Personas y Estructuras Jurídicas y de Beneficiarios Finales',
                    },
                    { doc: 'Solicitação de inscrição no RUC', who: 'Sistema da DNIT/Marangatu' },
                  ].map((row) => (
                    <tr key={row.doc}>
                      <th className="border-b border-line py-3 pr-4 text-left font-semibold text-text">
                        {row.doc}
                      </th>
                      <td className="border-b border-line px-4 py-3 text-text-dim">{row.who}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <RecoBox tone="info" title="⚠️ Canal de inscrição">
              A DNIT especifica que, no caso de E.A.S., a inscrição do RUC deve ser processada
              através do SUACE.
            </RecoBox>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
