import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  X, 
  ArrowDownCircle,
  Package
} from 'lucide-react';
import { Requisition, Material, Department } from '../types';
import { formatDate, formatDateTime } from '../utils/formatters';

interface RequisitionsViewProps {
  requisitions: Requisition[];
  materials: Material[];
  departments: Department[];
  onCreateRequisition: (data: {
    departmentId: string;
    requester: string;
    approver?: string;
    warehouseKeeper?: string;
    purpose: string;
    items: { materialId: string; quantityRequested: number; quantityDelivered?: number }[];
    notes?: string;
    autoProcessStock?: boolean;
  }) => Promise<void>;
}

export const RequisitionsView: React.FC<RequisitionsViewProps> = ({
  requisitions,
  materials,
  departments,
  onCreateRequisition
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [printingRequisition, setPrintingRequisition] = useState<Requisition | null>(null);

  // Form states
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [requester, setRequester] = useState('');
  const [approver, setApprover] = useState('Eng. Ricardo Prado (Chefia)');
  const [warehouseKeeper, setWarehouseKeeper] = useState('Matheus Messias');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [autoProcessStock, setAutoProcessStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dynamic items in requisition
  const [items, setItems] = useState<{ materialId: string; quantity: number }[]>([
    { materialId: materials[0]?.id || '', quantity: 1 }
  ]);

  const addItemRow = () => {
    if (materials.length === 0) return;
    setItems([...items, { materialId: materials[0].id, quantity: 1 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const updateItemRow = (index: number, field: 'materialId' | 'quantity', value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !requester.trim() || !purpose.trim()) {
      setFormError('Por favor, preencha todos os campos obrigatórios (Setor, Solicitante, Finalidade).');
      return;
    }

    if (items.length === 0) {
      setFormError('Inclua pelo menos 1 material na requisição.');
      return;
    }

    // Verify quantities
    for (const item of items) {
      if (item.quantity <= 0) {
        setFormError('A quantidade de todos os itens deve ser maior que zero.');
        return;
      }
      if (autoProcessStock) {
        const mat = materials.find(m => m.id === item.materialId);
        if (mat && item.quantity > mat.currentQuantity) {
          setFormError(`Saldo insuficiente para o item "${mat.name}". Saldo disponível: ${mat.currentQuantity} ${mat.unit}. Solicitado: ${item.quantity}.`);
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await onCreateRequisition({
        departmentId,
        requester: requester.trim(),
        approver: approver.trim(),
        warehouseKeeper: warehouseKeeper.trim(),
        purpose: purpose.trim(),
        notes: notes.trim(),
        autoProcessStock,
        items: items.map(it => ({
          materialId: it.materialId,
          quantityRequested: it.quantity,
          quantityDelivered: it.quantity
        }))
      });
      setIsNewModalOpen(false);
      // Auto open print view for the newly created one
    } catch (err: any) {
      setFormError(err.message || 'Erro ao emitir requisição.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequisitions = requisitions.filter(r => {
    return (
      r.requisitionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <FileText className="w-6 h-6 text-amber-400" />
            <span>Emissão de Requisições Impressas</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gere guias oficiais de retirada de materiais formatadas para conferência, assinatura física e arquivamento contábil.
          </p>
        </div>

        <button
          onClick={() => {
            setItems([{ materialId: materials[0]?.id || '', quantity: 1 }]);
            setRequester('');
            setPurpose('');
            setNotes('');
            setFormError(null);
            setIsNewModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 px-4 py-2.5 rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Nova Requisição de Material</span>
        </button>
      </div>

      {/* Filter / Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nº da requisição, setor, solicitante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <span className="text-xs text-slate-400">
          Total de Requisições: <strong className="text-amber-400">{filteredRequisitions.length}</strong>
        </span>
      </div>

      {/* Requisitions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequisitions.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-200">Nenhuma requisição encontrada</p>
            <p className="text-xs text-slate-500 mt-1">Clique em "Nova Requisição de Material" para emitir uma nova guia de saída.</p>
          </div>
        ) : (
          filteredRequisitions.map((req) => (
            <div
              key={req.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4 group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    {req.requisitionNumber}
                  </span>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{req.status}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {req.departmentName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Solicitante: <strong className="text-slate-300">{req.requester}</strong>
                  </p>
                  <p className="text-xs text-slate-400">
                    Data de Emissão: <span className="text-slate-300">{formatDate(req.date)}</span>
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-850 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400 font-semibold border-b border-slate-800 pb-1">
                    <span>Itens Requisitados</span>
                    <span className="text-amber-400 font-bold">{req.items.length} item(ns)</span>
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                    {req.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] text-slate-300">
                        <span className="truncate max-w-[170px]" title={it.materialName}>
                          • {it.materialName}
                        </span>
                        <span className="font-mono text-amber-300 font-semibold">
                          {it.quantityDelivered} {it.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {req.purpose && (
                  <p className="text-[11px] text-slate-400 italic line-clamp-2" title={req.purpose}>
                    "{req.purpose}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Almoxarife: {req.warehouseKeeper}
                </span>
                <button
                  onClick={() => setPrintingRequisition(req)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Visualizar & Imprimir</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: New Requisition */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Emitir Nova Requisição de Almoxarifado</span>
              </h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Department */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Setor / Departamento Solicitante *</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.costCenter})</option>
                    ))}
                  </select>
                </div>

                {/* Requester */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nome do Solicitante / Matrícula *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo (Mat. 201)"
                    value={requester}
                    onChange={(e) => setRequester(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Approver */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Aprovação da Chefia / Supervisor</label>
                  <input
                    type="text"
                    value={approver}
                    onChange={(e) => setApprover(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Warehouse Keeper */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Almoxarife Responsável</label>
                  <input
                    type="text"
                    value={warehouseKeeper}
                    onChange={(e) => setWarehouseKeeper(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-semibold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Finalidade / Aplicação Operacional *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manutenção periódica dos geradores, fornecimento mensal de EPIs..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Items Section */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Lista de Materiais Requisitados</span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Adicionar Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item, idx) => {
                    const currentMat = materials.find(m => m.id === item.materialId);
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <div className="flex-1">
                          <select
                            value={item.materialId}
                            onChange={(e) => updateItemRow(idx, 'materialId', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white text-xs"
                          >
                            {materials.map(m => (
                              <option key={m.id} value={m.id}>
                                [{m.code}] {m.name} (Saldo: {m.currentQuantity} {m.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemRow(idx, 'quantity', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white font-mono text-center text-xs"
                            placeholder="Qtd"
                          />
                        </div>

                        <div className="w-12 text-slate-400 font-mono text-center text-[11px]">
                          {currentMat?.unit || 'UN'}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          disabled={items.length <= 1}
                          className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Checkbox auto process stock */}
              <div className="flex items-center space-x-2 pt-2 text-slate-300">
                <input
                  type="checkbox"
                  id="autoProcess"
                  checked={autoProcessStock}
                  onChange={(e) => setAutoProcessStock(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 bg-slate-950 border-slate-700"
                />
                <label htmlFor="autoProcess" className="text-xs cursor-pointer">
                  Dar baixa imediata no saldo físico do estoque ao confirmar esta requisição
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Observações Adicionais</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações complementares de entrega, transporte ou justificativa..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Emitindo...' : 'Emitir Requisição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Requisition Sheet */}
      {printingRequisition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-6">
            {/* Modal Actions Bar (hidden on print) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:hidden">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-white text-sm">Visualização de Impressão Oficial</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir em A4</span>
                </button>
                <button
                  onClick={() => setPrintingRequisition(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE DOCUMENT AREA */}
            <div className="printable-area bg-white text-slate-900 p-8 rounded-lg shadow-inner border border-slate-300 space-y-6 text-xs">
              {/* Document Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-lg tracking-wider text-slate-900 uppercase">
                      INDÚSTRIA & TECNOLOGIA S.A.
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 uppercase font-semibold">
                    Divisão de Almoxarifado Central & Gestão de Suprimentos
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Sistema Integrado de Controle de Estoques (ALMOX CONTROL)
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-block border-2 border-slate-900 px-3 py-1 bg-slate-100 font-mono font-extrabold text-base text-slate-900">
                    {printingRequisition.requisitionNumber}
                  </div>
                  <p className="text-[10px] text-slate-600 font-semibold">
                    Data de Emissão: {formatDateTime(printingRequisition.date)}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Status: <strong className="text-slate-900">{printingRequisition.status}</strong>
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2 bg-slate-100 border border-slate-300 rounded font-extrabold text-sm uppercase tracking-wider text-slate-900">
                REQUISIÇÃO FORMAL DE SAÍDA DE MATERIAL DE ALMOXARIFADO
              </div>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 rounded bg-slate-50/50">
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Setor Solicitante</p>
                  <p className="font-bold text-slate-900 text-xs">{printingRequisition.departmentName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Solicitante Responsável</p>
                  <p className="font-bold text-slate-900 text-xs">{printingRequisition.requester}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Finalidade / Aplicação</p>
                  <p className="text-slate-800 text-xs">{printingRequisition.purpose}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                      <th className="p-2 border border-slate-300 text-center w-10">Item</th>
                      <th className="p-2 border border-slate-300 w-24">Código</th>
                      <th className="p-2 border border-slate-300">Descrição do Material</th>
                      <th className="p-2 border border-slate-300 text-center w-14">UN</th>
                      <th className="p-2 border border-slate-300 text-center w-20">Qtd Solicitada</th>
                      <th className="p-2 border border-slate-300 text-center w-20">Qtd Entregue</th>
                      <th className="p-2 border border-slate-300 text-center w-20">Visto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printingRequisition.items.map((it, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                        <td className="p-2 border border-slate-300 font-mono font-bold">{it.materialCode}</td>
                        <td className="p-2 border border-slate-300 font-medium">{it.materialName}</td>
                        <td className="p-2 border border-slate-300 text-center font-mono">{it.unit}</td>
                        <td className="p-2 border border-slate-300 text-center font-mono font-bold">{it.quantityRequested}</td>
                        <td className="p-2 border border-slate-300 text-center font-mono font-bold">{it.quantityDelivered}</td>
                        <td className="p-2 border border-slate-300 text-center">✓</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {printingRequisition.notes && (
                <div className="border border-slate-300 p-2.5 rounded bg-slate-50 text-[10px] text-slate-700">
                  <strong>Observações do Almoxarifado:</strong> {printingRequisition.notes}
                </div>
              )}

              {/* Term of Responsibility */}
              <div className="p-2.5 border border-dashed border-slate-400 rounded text-[10px] text-slate-600 italic text-center">
                "Declaro ter conferido e recebido os materiais discriminados nesta requisição em perfeito estado e quantidade exata, assumindo a responsabilidade por seu uso adequado conforme normas de segurança e processos da organização."
              </div>

              {/* Signatures Block */}
              <div className="pt-8 grid grid-cols-3 gap-6 text-center text-[10px] print-avoid-break">
                <div className="space-y-1">
                  <div className="border-t border-slate-800 w-full pt-1.5 font-bold text-slate-900">
                    {printingRequisition.requester}
                  </div>
                  <p className="text-slate-500">Assinatura do Solicitante</p>
                </div>

                <div className="space-y-1">
                  <div className="border-t border-slate-800 w-full pt-1.5 font-bold text-slate-900">
                    {printingRequisition.warehouseKeeper || 'Matheus Messias'}
                  </div>
                  <p className="text-slate-500">Almoxarife Responsável Técnico</p>
                </div>

                <div className="space-y-1">
                  <div className="border-t border-slate-800 w-full pt-1.5 font-bold text-slate-900">
                    {printingRequisition.approver || 'Chefia Imediata'}
                  </div>
                  <p className="text-slate-500">Aprovação / Gerência</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
