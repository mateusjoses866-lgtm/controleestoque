import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  X,
  AlertTriangle,
  Boxes
} from 'lucide-react';
import { Department, Movement } from '../types';

interface DepartmentsViewProps {
  departments: Department[];
  movements: Movement[];
  onSaveDepartment: (data: Omit<Department, 'id' | 'createdAt'>, editId?: string) => Promise<void>;
  onDeleteDepartment: (id: string) => Promise<void>;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departments,
  movements,
  onSaveDepartment,
  onDeleteDepartment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    manager: '',
    costCenter: '',
    location: '',
    email: '',
    phone: ''
  });

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({
      code: `SET-${String(departments.length + 1).padStart(2, '0')}`,
      name: '',
      manager: '',
      costCenter: `CC-${1000 + (departments.length + 1) * 10}`,
      location: '',
      email: '',
      phone: ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      code: dept.code,
      name: dept.name,
      manager: dept.manager,
      costCenter: dept.costCenter,
      location: dept.location,
      email: dept.email || '',
      phone: dept.phone || ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setFormError('Código e Nome do Setor são obrigatórios.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await onSaveDepartment(formData, editingDept?.id);
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar departamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDepartments = departments.filter(d => {
    return (
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.costCenter.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            <span>Cadastro de Setores & Departamentos</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão dos centros de custo e departamentos solicitantes para rastreabilidade de consumo de materiais.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 px-4 py-2.5 rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Cadastrar Novo Setor</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, nome, responsável, centro de custo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <span className="text-xs text-slate-400">
          Total: <strong className="text-amber-400">{filteredDepartments.length}</strong> setores
        </span>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map((dept) => {
          // Count movements and volume for this department
          const deptMovements = movements.filter(m => m.departmentId === dept.id && m.type === 'SAIDA');
          const totalWithdrawn = deptMovements.reduce((acc, m) => acc + m.quantity, 0);

          return (
            <div
              key={dept.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4 group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    {dept.code}
                  </span>
                  <span className="font-mono text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 flex items-center space-x-1">
                    <CreditCard className="w-3 h-3 text-amber-400 inline" />
                    <span>{dept.costCenter}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {dept.name}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-300 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Responsável: <strong>{dept.manager}</strong></span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{dept.location || 'Localização não especificada'}</span>
                  </div>
                  {dept.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{dept.email}</span>
                    </div>
                  )}
                  {dept.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{dept.phone}</span>
                    </div>
                  )}
                </div>

                {/* Consumption Stats */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Materiais Requisitados:</span>
                  <span className="font-bold text-amber-400 font-mono">
                    {totalWithdrawn} itens ({deptMovements.length} requisições)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  onClick={() => openEditModal(dept)}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Editar Setor"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Confirma a exclusão do setor "${dept.name}"?`)) {
                      onDeleteDepartment(dept.id);
                    }
                  }}
                  className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                  title="Excluir Setor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>{editingDept ? 'Editar Setor' : 'Cadastrar Novo Setor'}</span>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Código do Setor *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SET-01"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Centro de Custo *</label>
                  <input
                    type="text"
                    required
                    value={formData.costCenter}
                    onChange={(e) => setFormData({ ...formData, costCenter: e.target.value.toUpperCase() })}
                    placeholder="CC-1001"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Setor / Departamento *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Manutenção Industrial & Utilidades"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Responsável / Gerente / Supervisor *</label>
                <input
                  type="text"
                  required
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="Ex: Eng. Ricardo Prado"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Localização Física / Pavilhão</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Galpão 03 - Oficina Geral"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">E-mail de Contato</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="setor@empresa.com.br"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ramal / Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 3450-2010"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

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
                  {isSubmitting ? 'Salvando...' : editingDept ? 'Atualizar Setor' : 'Salvar Setor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
