import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { MaterialsView } from './components/MaterialsView';
import { MovementsView } from './components/MovementsView';
import { RequisitionsView } from './components/RequisitionsView';
import { ReportsView } from './components/ReportsView';
import { DepartmentsView } from './components/DepartmentsView';
import { BestPracticesView } from './components/BestPracticesView';
import { MaterialHistoryModal } from './components/MaterialHistoryModal';

import { Material, Department, Movement, Requisition, InventoryKPIs, MovementType } from './types';
import { api } from './services/api';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [materialsFilter, setMaterialsFilter] = useState<string | undefined>(undefined);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [kpis, setKpis] = useState<InventoryKPIs | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // History modal
  const [historyMaterial, setHistoryMaterial] = useState<Material | null>(null);

  // Quick Movement State
  const [quickMovementMaterial, setQuickMovementMaterial] = useState<Material | null>(null);
  const [quickMovementType, setQuickMovementType] = useState<MovementType>('ENTRADA');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [mats, deps, moves, reqs, kp] = await Promise.all([
        api.getMaterials(),
        api.getDepartments(),
        api.getMovements(),
        api.getRequisitions(),
        api.getKPIs()
      ]);

      setMaterials(mats);
      setDepartments(deps);
      setMovements(moves);
      setRequisitions(reqs);
      setKpis(kp);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      showToast(err.message || 'Erro de conexão com o banco de dados.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // --- Actions ---

  const handleSaveMaterial = async (data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => {
    if (editId) {
      const updated = await api.updateMaterial(editId, data);
      setMaterials(prev => prev.map(m => m.id === editId ? updated : m));
      showToast(`Material "${updated.name}" atualizado com sucesso!`);
    } else {
      const created = await api.createMaterial(data);
      setMaterials(prev => [created, ...prev]);
      showToast(`Material "${created.name}" cadastrado com sucesso!`);
    }
    const kp = await api.getKPIs();
    setKpis(kp);
  };

  const handleDeleteMaterial = async (id: string) => {
    await api.deleteMaterial(id);
    setMaterials(prev => prev.filter(m => m.id !== id));
    showToast('Material removido do cadastro.');
    const kp = await api.getKPIs();
    setKpis(kp);
  };

  const handleRecordMovement = async (data: {
    type: MovementType;
    materialId: string;
    quantity: number;
    departmentId: string;
    requester: string;
    documentNumber?: string;
    reason: string;
    date?: string;
  }) => {
    const result = await api.recordMovement(data);
    // Update materials and movements
    setMaterials(prev => prev.map(m => m.id === result.material.id ? result.material : m));
    setMovements(prev => [result.movement, ...prev]);
    showToast(
      `Movimentação de ${data.type === 'ENTRADA' ? 'Entrada (+)' : 'Saída (-)'} registrada com sucesso!`
    );
    const kp = await api.getKPIs();
    setKpis(kp);
  };

  const handleCreateRequisition = async (data: {
    departmentId: string;
    requester: string;
    approver?: string;
    warehouseKeeper?: string;
    purpose: string;
    items: { materialId: string; quantityRequested: number; quantityDelivered?: number }[];
    notes?: string;
    autoProcessStock?: boolean;
  }) => {
    const newReq = await api.createRequisition(data);
    setRequisitions(prev => [newReq, ...prev]);
    showToast(`Requisição ${newReq.requisitionNumber} emitida com sucesso!`);
    await loadAllData();
  };

  const handleSaveDepartment = async (data: Omit<Department, 'id' | 'createdAt'>, editId?: string) => {
    if (editId) {
      const updated = await api.updateDepartment(editId, data);
      setDepartments(prev => prev.map(d => d.id === editId ? updated : d));
      showToast(`Setor "${updated.name}" atualizado com sucesso!`);
    } else {
      const created = await api.createDepartment(data);
      setDepartments(prev => [...prev, created]);
      showToast(`Setor "${created.name}" cadastrado com sucesso!`);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    await api.deleteDepartment(id);
    setDepartments(prev => prev.filter(d => d.id !== id));
    showToast('Setor removido com sucesso.');
  };

  const handleResetData = async () => {
    if (!confirm('Deseja realmente restaurar os dados de exemplo padrão do almoxarifado? Todas as alterações serão reiniciadas.')) {
      return;
    }
    await api.resetDemoData();
    await loadAllData();
    showToast('Dados de demonstração restaurados com sucesso!');
  };

  const navigateToMaterialsWithFilter = (filter?: string) => {
    setMaterialsFilter(filter);
    setActiveTab('materials');
  };

  const handleQuickMovement = (mat: Material, type: 'ENTRADA' | 'SAIDA') => {
    setQuickMovementMaterial(mat);
    setQuickMovementType(type);
    setActiveTab('movements');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950 border-rose-500/40 text-rose-300'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Corporate Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setMaterialsFilter(undefined);
          setActiveTab(tab);
        }}
        onOpenQuickMovement={() => {
          setQuickMovementMaterial(null);
          setQuickMovementType('ENTRADA');
          setActiveTab('movements');
        }}
        criticalCount={kpis?.belowMinCount || 0}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            kpis={kpis}
            onNavigateToMaterials={navigateToMaterialsWithFilter}
            onNavigateToMovements={() => setActiveTab('movements')}
            onQuickMovementWithMaterial={handleQuickMovement}
            onViewMaterialHistory={(m) => setHistoryMaterial(m)}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsView
            materials={materials}
            initialFilter={materialsFilter}
            onSaveMaterial={handleSaveMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onViewHistory={(m) => setHistoryMaterial(m)}
            onQuickMovement={handleQuickMovement}
          />
        )}

        {activeTab === 'movements' && (
          <MovementsView
            movements={movements}
            materials={materials}
            departments={departments}
            onRecordMovement={handleRecordMovement}
            preselectedMaterial={quickMovementMaterial}
            preselectedType={quickMovementType}
          />
        )}

        {activeTab === 'requisitions' && (
          <RequisitionsView
            requisitions={requisitions}
            materials={materials}
            departments={departments}
            onCreateRequisition={handleCreateRequisition}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            materials={materials}
            movements={movements}
            departments={departments}
          />
        )}

        {activeTab === 'departments' && (
          <DepartmentsView
            departments={departments}
            movements={movements}
            onSaveDepartment={handleSaveDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        )}

        {activeTab === 'best-practices' && (
          <BestPracticesView />
        )}
      </main>

      {/* History Modal */}
      <MaterialHistoryModal
        material={historyMaterial}
        onClose={() => setHistoryMaterial(null)}
        onQuickMovement={handleQuickMovement}
      />

      {/* Footer */}
      <Footer onResetData={handleResetData} isLoading={isLoading} />
    </div>
  );
}
