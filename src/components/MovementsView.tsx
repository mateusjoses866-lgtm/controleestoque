import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  ArrowDownRight, 
  ArrowUpRight, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  Building2, 
  User, 
  FileText,
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';
import { Movement, Material, Department, MovementType } from '../types';
import { formatDateTime } from '../utils/formatters';

interface MovementsViewProps {
  movements: Movement[];
  materials: Material[];
  departments: Department[];
  onRecordMovement: (data: {
    type: MovementType;
    materialId: string;
    quantity: number;
    departmentId: string;
    requester: string;
    documentNumber?: string;
    reason: string;
    date?: string;
  }) => Promise<void>;
  preselectedMaterial?: Material | null;
  preselectedType?: MovementType;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
  materials,
  departments,
  onRecordMovement,
  preselectedMaterial,
  preselectedType = 'ENTRADA'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'TODOS' | MovementType>('TODOS');
  const [departmentFilter, setDepartmentFilter] = useState<string>('TODOS');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<MovementType>(preselectedType);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(preselectedMaterial?.id || (materials[0]?.id || ''));
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(departments[0]?.id || '');
  const [requester, setRequester] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [reason, setReason] = useState('');
  const [movementDate, setMovementDate] = useState(new Date().toISOString().slice(0, 16));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedMaterial = useMemo(() => {
    return materials.find(m => m.id === selectedMaterialId);
  }, [materials, selectedMaterialId]);

  const openMovementModal = (type: MovementType = 'ENTRADA', mat?: Material) => {
    setModalType(type);
    if (mat) {
      setSelectedMaterialId(mat.id);
    } else if (!selectedMaterialId && materials.length > 0) {
      setSelectedMaterialId(materials[0].id);
    }
    setQuantity(1);
    setRequester('');
    setDocumentNumber(type === 'ENTRADA' ? 'NF-e ' : 'REQ-');
    setReason('');
    setMovementDate(new Date().toISOString().slice(0, 16));
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId) {
      setErrorMsg('Selecione um material.');
      return;
    }
    if (!selectedDepartmentId) {
      setErrorMsg('Selecione um setor.');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('A quantidade deve ser maior que zero.');
      return;
    }

    if (modalType === 'SAIDA' && selectedMaterial && quantity > selectedMaterial.currentQuantity) {
      setErrorMsg(`Saldo insuficiente! Saldo disponível: ${selectedMaterial.currentQuantity} ${selectedMaterial.unit}. Quantidade solicitada: ${quantity} ${selectedMaterial.unit}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onRecordMovement({
        type: modalType,
        materialId: selectedMaterialId,
        quantity,
        departmentId: selectedDepartmentId,
        requester: requester.trim() || 'Não especificado',
        documentNumber: documentNumber.trim(),
        reason: reason.trim() || (modalType === 'ENTRADA' ? 'Entrada regular em estoque' : 'Consumo interno setorial'),
        date: new Date(movementDate).toISOString()
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar movimentação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const matchesSearch = 
        m.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.documentNumber && m.documentNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        m.reason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'TODOS' || m.type === typeFilter;
      const matchesDepartment = departmentFilter === 'TODOS' || m.departmentId === departmentFilter;

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(m.date) >= new Date(startDate);
      }
      if (endDate) {
        // end of that day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(m.date) <= end;
      }

      return matchesSearch && matchesType && matchesDepartment && matchesDate;
    });
  }, [movements, searchTerm, typeFilter, departmentFilter, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <ArrowLeftRight className="w-6 h-6 text-amber-400" />
            <span>Registro de Movimentações de Estoque</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle rigoroso de entradas (compras, devoluções) e saídas (requisições, consumo operacional) com trilha de auditoria.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-add-entry"
            onClick={() => openMovementModal('ENTRADA')}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>+ Entrada</span>
          </button>
          <button
            id="btn-add-exit"
            onClick={() => openMovementModal('SAIDA')}
            className="flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 px-3.5 py-2 rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 text-slate-950" />
            <span>+ Saída</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por material, solicitante, documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="TODOS">Todos os Tipos</option>
              <option value="ENTRADA">↓ Apenas Entradas</option>
              <option value="SAIDA">↑ Apenas Saídas</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="TODOS">Todos os Setores</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Date range quick indicator */}
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Data Inicial"
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 focus:outline-none focus:border-amber-400"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Data Final"
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {(startDate || endDate || searchTerm || typeFilter !== 'TODOS' || departmentFilter !== 'TODOS') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>Filtros ativos aplicados.</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('TODOS');
                setDepartmentFilter('TODOS');
                setStartDate('');
                setEndDate('');
              }}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Movements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-850 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Código / Material</th>
                <th className="py-3 px-4 text-right">Qtd Movimentada</th>
                <th className="py-3 px-4 text-center">Saldo Anterior → Novo</th>
                <th className="py-3 px-4">Setor Responsável</th>
                <th className="py-3 px-4">Solicitante</th>
                <th className="py-3 px-4">Documento / Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Nenhuma movimentação encontrada para os filtros especificados.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isEntry = mov.type === 'ENTRADA';
                  return (
                    <tr key={mov.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {formatDateTime(mov.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold ${
                          isEntry 
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}>
                          {isEntry ? <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />}
                          <span>{isEntry ? 'ENTRADA' : 'SAÍDA'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-amber-300 text-xs">
                          {mov.materialCode}
                        </div>
                        <div className="font-semibold text-white truncate max-w-[200px]" title={mov.materialName}>
                          {mov.materialName}
                        </div>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-extrabold text-sm font-mono ${isEntry ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isEntry ? '+' : '-'}{mov.quantity} <span className="text-xs font-normal text-slate-400">{mov.materialUnit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300 whitespace-nowrap">
                        <span className="text-slate-400">{mov.balanceBefore}</span>
                        <span className="text-slate-600 mx-2">→</span>
                        <span className="font-bold text-white">{mov.balanceAfter}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-[180px] truncate" title={mov.departmentName}>
                        {mov.departmentName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {mov.requester}
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <span className="font-mono text-xs text-amber-300/90 font-medium block">
                          {mov.documentNumber || '-'}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block" title={mov.reason}>
                          {mov.reason}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <ArrowLeftRight className="w-5 h-5 text-amber-400" />
                <span>Registrar Nova Movimentação</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Tipo de Operação *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalType('ENTRADA')}
                    className={`py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                      modalType === 'ENTRADA'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                    <span>ENTRADA (Aquisição / Devolução)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalType('SAIDA')}
                    className={`py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                      modalType === 'SAIDA'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-amber-400" />
                    <span>SAÍDA (Consumo / Requisição)</span>
                  </button>
                </div>
              </div>

              {/* Material Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Material a Movimentar *</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium focus:outline-none focus:border-amber-400"
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.code}] {m.name} — Saldo Atual: {m.currentQuantity} {m.unit}
                    </option>
                  ))}
                </select>

                {selectedMaterial && (
                  <div className="mt-2 p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between text-slate-300 text-[11px]">
                    <div>
                      <span>Saldo em estoque: </span>
                      <strong className="text-white font-bold">{selectedMaterial.currentQuantity} {selectedMaterial.unit}</strong>
                    </div>
                    <div>
                      <span>Mínimo: <strong className="text-rose-400">{selectedMaterial.minQuantity}</strong></span>
                      <span className="mx-2">|</span>
                      <span>Máximo: <strong className="text-purple-400">{selectedMaterial.maxQuantity}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Quantidade Movimentada * ({selectedMaterial?.unit || 'UN'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={modalType === 'SAIDA' ? selectedMaterial?.currentQuantity : undefined}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                  />
                  {modalType === 'SAIDA' && selectedMaterial && quantity > selectedMaterial.currentQuantity && (
                    <p className="text-rose-400 text-[11px] mt-1">
                      ⚠️ Quantidade excede o saldo disponível ({selectedMaterial.currentQuantity} {selectedMaterial.unit}).
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Data e Hora *</label>
                  <input
                    type="datetime-local"
                    required
                    value={movementDate}
                    onChange={(e) => setMovementDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Department & Requester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Setor Responsável *</label>
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.costCenter})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {modalType === 'ENTRADA' ? 'Responsável pelo Recebimento' : 'Solicitante / Matrícula'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Maia (Mat. 4410)"
                    value={requester}
                    onChange={(e) => setRequester(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Document Number */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {modalType === 'ENTRADA' ? 'Número da Nota Fiscal (NF-e)' : 'Nº da Requisição / O.S.'}
                </label>
                <input
                  type="text"
                  placeholder={modalType === 'ENTRADA' ? 'NF-e 89401' : 'REQ-2026-0045'}
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Reason / Observations */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Finalidade / Observações *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Descreva o motivo da movimentação, máquina de destino ou aplicação..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-lg font-bold shadow-md cursor-pointer disabled:opacity-50 ${
                    modalType === 'ENTRADA'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  }`}
                >
                  {isSubmitting ? 'Registrando...' : modalType === 'ENTRADA' ? 'Confirmar Entrada' : 'Confirmar Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
