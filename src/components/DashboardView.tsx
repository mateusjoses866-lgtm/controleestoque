import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight, 
  Layers, 
  DollarSign, 
  Building2, 
  Calendar,
  AlertCircle,
  Plus
} from 'lucide-react';
import { InventoryKPIs, Material, Movement } from '../types';
import { formatCurrency, formatDateTime, getStockStatus } from '../utils/formatters';

interface DashboardViewProps {
  kpis: InventoryKPIs | null;
  onNavigateToMaterials: (filter?: string) => void;
  onNavigateToMovements: () => void;
  onQuickMovementWithMaterial: (material: Material, type: 'ENTRADA' | 'SAIDA') => void;
  onViewMaterialHistory: (material: Material) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  onNavigateToMaterials,
  onNavigateToMovements,
  onQuickMovementWithMaterial,
  onViewMaterialHistory
}) => {
  if (!kpis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Carregando indicadores do almoxarifado...</p>
        </div>
      </div>
    );
  }

  const maxDepQuantity = Math.max(...kpis.movementsByDepartment.map(d => d.totalQuantity), 1);

  return (
    <div className="space-y-6">
      {/* Top Banner / Corporate Headline */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-400/5 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Painel Executivo de Almoxarifado</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Controle Geral de Estoques & Movimentações
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Monitore níveis de estoque em tempo real, identifique riscos de ruptura ou excesso e audite as saídas por setor da empresa.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-800/90 rounded-lg p-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Referência Contábil</p>
              <p className="text-sm font-semibold text-white">
                {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Materials & Value */}
        <div 
          onClick={() => onNavigateToMaterials()}
          className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Itens em Catálogo</span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-white tracking-tight">{kpis.totalMaterials}</p>
            <div className="flex items-center space-x-1 mt-1 text-xs text-slate-400">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Valor Total: <strong className="text-slate-200">{formatCurrency(kpis.totalStockValue)}</strong></span>
            </div>
          </div>
        </div>

        {/* Below Minimum / Rupture */}
        <div 
          onClick={() => onNavigateToMaterials('critical')}
          className={`border rounded-xl p-5 shadow-lg transition-all cursor-pointer group ${
            kpis.belowMinCount > 0 
              ? 'bg-rose-950/20 hover:bg-rose-950/30 border-rose-500/30 hover:border-rose-500/50' 
              : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Abaixo do Mínimo</span>
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-extrabold text-rose-400 tracking-tight">{kpis.belowMinCount}</p>
              <span className="text-xs text-rose-400/80 font-medium">itens críticos</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Risco iminente de ruptura operacional
            </p>
          </div>
        </div>

        {/* Excess Stock */}
        <div 
          onClick={() => onNavigateToMaterials('excess')}
          className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 rounded-xl p-5 shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Acima do Máximo</span>
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-extrabold text-purple-400 tracking-tight">{kpis.aboveMaxCount}</p>
              <span className="text-xs text-purple-400/80 font-medium">itens em excesso</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Capital imobilizado acima da cota
            </p>
          </div>
        </div>

        {/* Turnover / Giro de Estoque */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taxa de Rotatividade</span>
            <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-extrabold text-amber-400 tracking-tight">{kpis.turnoverRate}%</p>
              <span className="text-xs text-slate-400">giro do estoque</span>
            </div>
            <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
              <span className="text-emerald-400">↓ {kpis.entriesCountMonth} Entradas</span>
              <span className="text-amber-400">↑ {kpis.exitsCountMonth} Saídas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Row: Critical Alert Items + Movements by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Stock List (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="text-base font-bold text-white">
                  Materiais Críticos / Reposição Urgente ({kpis.criticalMaterials.length})
                </h2>
              </div>
              <button
                onClick={() => onNavigateToMaterials('critical')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                Ver todos os materiais →
              </button>
            </div>

            {kpis.criticalMaterials.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <AlertCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-200">Estoque em Nível Seguro</p>
                <p className="text-xs text-slate-500 mt-0.5">Nenhum material está abaixo do limite mínimo no momento.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 mt-2">
                {kpis.criticalMaterials.slice(0, 5).map((mat) => {
                  const status = getStockStatus(mat);
                  const percentOfMin = Math.round((mat.currentQuantity / mat.minQuantity) * 100);

                  return (
                    <div key={mat.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/40 px-2 rounded-lg transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                            {mat.code}
                          </span>
                          <span className="text-sm font-semibold text-white hover:text-amber-300 cursor-pointer" onClick={() => onViewMaterialHistory(mat)}>
                            {mat.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-slate-400">
                          <span>Categoria: <strong className="text-slate-300">{mat.category}</strong></span>
                          <span>•</span>
                          <span>Local: <strong className="text-slate-300">{mat.location}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-1.5 justify-end">
                            <span className="text-lg font-extrabold text-rose-400">{mat.currentQuantity}</span>
                            <span className="text-xs text-slate-400">{mat.unit}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Mínimo: {mat.minQuantity} {mat.unit} ({percentOfMin}%)
                          </p>
                        </div>

                        <button
                          onClick={() => onQuickMovementWithMaterial(mat, 'ENTRADA')}
                          className="flex items-center space-x-1 bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer"
                          title="Registrar Entrada / Reposição"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Repor</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Movements by Department Distribution (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-800">
            <Building2 className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Consumo por Setor</h2>
          </div>

          <div className="mt-4 space-y-4 flex-1">
            {kpis.movementsByDepartment.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Nenhuma movimentação setorial registrada.</p>
            ) : (
              kpis.movementsByDepartment.map((dep, idx) => {
                const percentage = Math.round((dep.totalQuantity / maxDepQuantity) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300 truncate max-w-[200px]" title={dep.departmentName}>
                        {dep.departmentName}
                      </span>
                      <span className="font-bold text-amber-400">
                        {dep.totalQuantity} <span className="text-[10px] text-slate-400 font-normal">itens ({dep.movementCount} req.)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h2 className="text-base font-bold text-white">Últimas Movimentações Registradas</h2>
          </div>
          <button
            onClick={onNavigateToMovements}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
          >
            Acessar Histórico Completo →
          </button>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Material</th>
                <th className="py-2.5 px-3 text-right">Qtd</th>
                <th className="py-2.5 px-3 text-right">Saldo Atual</th>
                <th className="py-2.5 px-3">Setor Solicitante</th>
                <th className="py-2.5 px-3">Documento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {kpis.recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhuma movimentação recente registrada.
                  </td>
                </tr>
              ) : (
                kpis.recentMovements.map((mov) => {
                  const isEntry = mov.type === 'ENTRADA';
                  return (
                    <tr key={mov.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {formatDateTime(mov.date)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          isEntry 
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}>
                          {isEntry ? <ArrowDownRight className="w-3 h-3 text-emerald-400" /> : <ArrowUpRight className="w-3 h-3 text-amber-400" />}
                          <span>{isEntry ? 'ENTRADA' : 'SAÍDA'}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-300 whitespace-nowrap">
                        {mov.materialCode}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white max-w-[220px] truncate" title={mov.materialName}>
                        {mov.materialName}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isEntry ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isEntry ? '+' : '-'}{mov.quantity} {mov.materialUnit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-300 font-mono">
                        {mov.balanceAfter} {mov.materialUnit}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 truncate max-w-[180px]" title={mov.departmentName}>
                        {mov.departmentName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                        {mov.documentNumber || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
