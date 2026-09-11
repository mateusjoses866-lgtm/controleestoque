import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  History, 
  ArrowDownRight, 
  ArrowUpRight, 
  AlertTriangle,
  X,
  MapPin,
  Tag
} from 'lucide-react';
import { Material, StockStatus, UnitOfMeasure } from '../types';
import { formatCurrency, getStockStatus } from '../utils/formatters';

interface MaterialsViewProps {
  materials: Material[];
  initialFilter?: string;
  onSaveMaterial: (data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
  onViewHistory: (material: Material) => void;
  onQuickMovement: (material: Material, type: 'ENTRADA' | 'SAIDA') => void;
}

const COMMON_UNITS: UnitOfMeasure[] = ['UN', 'KG', 'CX', 'LT', 'MT', 'PC', 'PAR', 'ROLO', 'FARDO'];

const CATEGORIES = [
  'EPI & Proteção Individual',
  'Peças & Componentes Mecânicos',
  'Lubrificantes & Químicos',
  'Ferramentas & Abrasivos',
  'Soldagem & Serralheria',
  'Tecnologia da Informação & Redes',
  'Materiais de Escritório & Papelaria',
  'Embalagem & Expedição',
  'Elétrica & Iluminação',
  'Outros'
];

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  initialFilter,
  onSaveMaterial,
  onDeleteMaterial,
  onViewHistory,
  onQuickMovement
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [statusFilter, setStatusFilter] = useState<string>(
    initialFilter === 'critical' ? 'CRITICO_OU_MINIMO' : initialFilter === 'excess' ? 'EXCESSO' : 'TODOS'
  );

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: CATEGORIES[0],
    unit: 'UN' as UnitOfMeasure,
    minQuantity: 10,
    maxQuantity: 100,
    currentQuantity: 20,
    unitPrice: 15.0,
    location: '',
    description: ''
  });

  const openCreateModal = () => {
    setEditingMaterial(null);
    setFormData({
      code: `MAT-${String(materials.length + 1).padStart(4, '0')}`,
      name: '',
      category: CATEGORIES[0],
      unit: 'UN',
      minQuantity: 10,
      maxQuantity: 100,
      currentQuantity: 0,
      unitPrice: 0,
      location: 'Almoxarifado Central',
      description: ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      code: material.code,
      name: material.name,
      category: material.category,
      unit: material.unit as UnitOfMeasure,
      minQuantity: material.minQuantity,
      maxQuantity: material.maxQuantity,
      currentQuantity: material.currentQuantity,
      unitPrice: material.unitPrice,
      location: material.location,
      description: material.description || ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setFormError('Código e Nome do Material são obrigatórios.');
      return;
    }
    if (formData.minQuantity < 0 || formData.maxQuantity < formData.minQuantity) {
      setFormError('A quantidade máxima deve ser maior ou igual à quantidade mínima.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await onSaveMaterial(formData, editingMaterial?.id);
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'TODAS' || m.category === selectedCategory;

      const status = getStockStatus(m);
      let matchesStatus = true;
      if (statusFilter === 'CRITICO_OU_MINIMO') {
        matchesStatus = status.status === 'CRITICO' || status.status === 'ABAIXO_MINIMO';
      } else if (statusFilter === 'EXCESSO') {
        matchesStatus = status.status === 'EXCESSO';
      } else if (statusFilter === 'NORMAL') {
        matchesStatus = status.status === 'NORMAL';
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [materials, searchTerm, selectedCategory, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Package className="w-6 h-6 text-amber-400" />
            <span>Cadastro & Controle de Materiais</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerenciamento do catálogo do almoxarifado, cotas mínimas e máximas, precificação e localização física.
          </p>
        </div>

        <button
          id="btn-add-material"
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 px-4 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Cadastrar Novo Material</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, nome, local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            >
              <option value="TODAS">Todas as Categorias</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            >
              <option value="TODOS">Todos os Níveis de Estoque</option>
              <option value="CRITICO_OU_MINIMO">⚠️ Abaixo do Mínimo / Ruptura</option>
              <option value="NORMAL">✅ Normal / Regular</option>
              <option value="EXCESSO">📦 Em Excesso / Superestocagem</option>
            </select>
          </div>

          {/* Counter Badge */}
          <div className="flex items-center justify-end text-xs text-slate-400 px-1">
            <span>
              Exibindo <strong className="text-amber-400">{filteredMaterials.length}</strong> de <strong className="text-white">{materials.length}</strong> materiais
            </span>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-850 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="py-3 px-4">Código / Identificação</th>
                <th className="py-3 px-4">Material / Categoria</th>
                <th className="py-3 px-4 text-center">Unidade</th>
                <th className="py-3 px-4">Nível de Estoque</th>
                <th className="py-3 px-4 text-center">Mín / Máx</th>
                <th className="py-3 px-4 text-right">Preço Un.</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Nenhum material encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => {
                  const status = getStockStatus(material);
                  const totalValue = material.currentQuantity * material.unitPrice;
                  const ratio = material.maxQuantity > 0 
                    ? Math.min(Math.round((material.currentQuantity / material.maxQuantity) * 100), 100)
                    : 0;

                  return (
                    <tr key={material.id} className="hover:bg-slate-850/60 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-300 whitespace-nowrap">
                        {material.code}
                      </td>

                      {/* Name & Category */}
                      <td className="py-3.5 px-4 max-w-[260px]">
                        <p className="font-semibold text-white hover:text-amber-300 transition-colors cursor-pointer" onClick={() => onViewHistory(material)}>
                          {material.name}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Tag className="w-3 h-3 text-slate-500 inline" />
                          <span>{material.category}</span>
                        </p>
                      </td>

                      {/* Unit */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-medium">
                          {material.unit}
                        </span>
                      </td>

                      {/* Current Stock & Status */}
                      <td className="py-3.5 px-4 min-w-[170px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-white">
                              {material.currentQuantity} <span className="text-xs text-slate-400 font-normal">{material.unit}</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.badgeClass}`}>
                              {status.label}
                            </span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                status.status === 'CRITICO' || status.status === 'ABAIXO_MINIMO'
                                  ? 'bg-rose-500'
                                  : status.status === 'EXCESSO'
                                  ? 'bg-purple-500'
                                  : 'bg-amber-400'
                              }`}
                              style={{ width: `${Math.max(ratio, 4)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Min / Max */}
                      <td className="py-3.5 px-4 text-center text-slate-300 font-mono text-[11px] whitespace-nowrap">
                        <span className="text-rose-400 font-semibold">{material.minQuantity}</span> / <span className="text-purple-400 font-semibold">{material.maxQuantity}</span>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300 whitespace-nowrap">
                        {formatCurrency(material.unitPrice)}
                      </td>

                      {/* Total Value */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                        {formatCurrency(totalValue)}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span className="truncate max-w-[120px]" title={material.location}>{material.location || 'Geral'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          {/* Quick Entry */}
                          <button
                            onClick={() => onQuickMovement(material, 'ENTRADA')}
                            className="p-1.5 rounded hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                            title="Entrada Rápida"
                          >
                            <ArrowDownRight className="w-4 h-4" />
                          </button>

                          {/* Quick Exit */}
                          <button
                            onClick={() => onQuickMovement(material, 'SAIDA')}
                            disabled={material.currentQuantity <= 0}
                            className="p-1.5 rounded hover:bg-amber-500/20 text-amber-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Saída Rápida"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          {/* History */}
                          <button
                            onClick={() => onViewHistory(material)}
                            className="p-1.5 rounded hover:bg-slate-750 text-blue-400 transition-colors cursor-pointer"
                            title="Histórico de Movimentações"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(material)}
                            className="p-1.5 rounded hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Editar Material"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Confirma a exclusão do material "${material.name}" (${material.code})?`)) {
                                onDeleteMaterial(material.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                            title="Excluir Material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Package className="w-5 h-5 text-amber-400" />
                <span>{editingMaterial ? 'Editar Material' : 'Cadastrar Novo Material'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Code */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Código / SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="MAT-0101"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Category */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descrição / Nome do Material *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Luva de Vaqueta Mista Petroleira"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Unit, Min, Max */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unidade *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitOfMeasure })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  >
                    {COMMON_UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Qtd. Mínima *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Qtd. Máxima *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.maxQuantity}
                    onChange={(e) => setFormData({ ...formData, maxQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Current Quantity, Unit Price, Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Qtd. Atual em Estoque</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentQuantity}
                    onChange={(e) => setFormData({ ...formData, currentQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Localização Física</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Prateleira A-01 / Gaveta 04"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Observações Técnicas / Aplicação</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Especificações técnicas, normas atendidas ou recomendações de manuseio..."
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
                  className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : editingMaterial ? 'Atualizar Material' : 'Salvar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
