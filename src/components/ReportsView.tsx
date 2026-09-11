import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Layers, 
  ArrowDownRight, 
  ArrowUpRight,
  TrendingDown,
  FileSpreadsheet
} from 'lucide-react';
import { Material, Movement, Department } from '../types';
import { formatCurrency, formatDate, formatDateTime, getStockStatus, exportToCSV } from '../utils/formatters';

interface ReportsViewProps {
  materials: Material[];
  movements: Movement[];
  departments: Department[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  materials,
  movements,
  departments
}) => {
  const [reportType, setReportType] = useState<'POSICAO_ATUAL' | 'MOVIMENTACOES_PERIODO'>('POSICAO_ATUAL');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('TODOS');

  // Dates for period report (default current month)
  const now = new Date();
  const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(firstDayMonth);
  const [endDate, setEndDate] = useState(today);

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(materials.map(m => m.category))).sort();
  }, [materials]);

  // Filtered materials for current stock position report
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchCat = selectedCategory === 'TODAS' || m.category === selectedCategory;
      const status = getStockStatus(m);
      let matchStatus = true;
      if (statusFilter === 'CRITICO') matchStatus = status.status === 'CRITICO' || status.status === 'ABAIXO_MINIMO';
      if (statusFilter === 'NORMAL') matchStatus = status.status === 'NORMAL';
      if (statusFilter === 'EXCESSO') matchStatus = status.status === 'EXCESSO';
      return matchCat && matchStatus;
    });
  }, [materials, selectedCategory, statusFilter]);

  // Calculations for current position
  const totalItemsCount = filteredMaterials.reduce((acc, m) => acc + m.currentQuantity, 0);
  const totalStockValue = filteredMaterials.reduce((acc, m) => acc + (m.currentQuantity * m.unitPrice), 0);
  const criticalItemsCount = filteredMaterials.filter(m => m.currentQuantity <= m.minQuantity).length;

  // Filtered movements for period report
  const periodMovements = useMemo(() => {
    return movements.filter(m => {
      const moveDate = m.date.slice(0, 10);
      const matchStart = !startDate || moveDate >= startDate;
      const matchEnd = !endDate || moveDate <= endDate;
      const matchDep = selectedDepartment === 'TODOS' || m.departmentId === selectedDepartment;
      return matchStart && matchEnd && matchDep;
    });
  }, [movements, startDate, endDate, selectedDepartment]);

  const periodEntries = periodMovements.filter(m => m.type === 'ENTRADA');
  const periodExits = periodMovements.filter(m => m.type === 'SAIDA');
  const totalEntriesQty = periodEntries.reduce((acc, m) => acc + m.quantity, 0);
  const totalExitsQty = periodExits.reduce((acc, m) => acc + m.quantity, 0);
  const netBalance = totalEntriesQty - totalExitsQty;

  // Export current position to CSV
  const handleExportPositionCSV = () => {
    const headers = [
      { key: 'code', label: 'Código' },
      { key: 'name', label: 'Nome do Material' },
      { key: 'category', label: 'Categoria' },
      { key: 'unit', label: 'Unidade' },
      { key: 'currentQuantity', label: 'Estoque Atual' },
      { key: 'minQuantity', label: 'Estoque Mínimo' },
      { key: 'maxQuantity', label: 'Estoque Máximo' },
      { key: 'status', label: 'Status' },
      { key: 'unitPrice', label: 'Preço Unitário (R$)' },
      { key: 'totalValue', label: 'Valor Total (R$)' },
      { key: 'location', label: 'Localização' }
    ];

    const rows = filteredMaterials.map(m => {
      const s = getStockStatus(m);
      return {
        code: m.code,
        name: m.name,
        category: m.category,
        unit: m.unit,
        currentQuantity: m.currentQuantity,
        minQuantity: m.minQuantity,
        maxQuantity: m.maxQuantity,
        status: s.label,
        unitPrice: m.unitPrice.toFixed(2),
        totalValue: (m.currentQuantity * m.unitPrice).toFixed(2),
        location: m.location
      };
    });

    exportToCSV(`posicao_estoque_${today}`, rows, headers);
  };

  // Export period movements to CSV
  const handleExportMovementsCSV = () => {
    const headers = [
      { key: 'date', label: 'Data e Hora' },
      { key: 'type', label: 'Tipo' },
      { key: 'materialCode', label: 'Código Material' },
      { key: 'materialName', label: 'Material' },
      { key: 'quantity', label: 'Quantidade' },
      { key: 'unit', label: 'Unidade' },
      { key: 'balanceBefore', label: 'Saldo Anterior' },
      { key: 'balanceAfter', label: 'Saldo Resultante' },
      { key: 'department', label: 'Setor Responsável' },
      { key: 'requester', label: 'Solicitante' },
      { key: 'document', label: 'Documento' },
      { key: 'reason', label: 'Motivo' }
    ];

    const rows = periodMovements.map(m => ({
      date: formatDateTime(m.date),
      type: m.type,
      materialCode: m.materialCode,
      materialName: m.materialName,
      quantity: m.quantity,
      unit: m.materialUnit,
      balanceBefore: m.balanceBefore,
      balanceAfter: m.balanceAfter,
      department: m.departmentName,
      requester: m.requester,
      document: m.documentNumber || '',
      reason: m.reason
    }));

    exportToCSV(`movimentacoes_${startDate}_a_${endDate}`, rows, headers);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <PieChart className="w-6 h-6 text-amber-400" />
            <span>Relatórios & Posição de Estoque</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Auditoria de inventário físico, consolidação patrimonial e balanço de entradas e saídas por período.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={reportType === 'POSICAO_ATUAL' ? handleExportPositionCSV : handleExportMovementsCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Posição Atual vs Movimentações por Período */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 print:hidden">
        <button
          onClick={() => setReportType('POSICAO_ATUAL')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            reportType === 'POSICAO_ATUAL'
              ? 'bg-amber-400 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          1. Posição Atual do Inventário
        </button>
        <button
          onClick={() => setReportType('MOVIMENTACOES_PERIODO')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            reportType === 'MOVIMENTACOES_PERIODO'
              ? 'bg-amber-400 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          2. Movimentações por Período
        </button>
      </div>

      {/* VIEW 1: POSIÇÃO ATUAL */}
      {reportType === 'POSICAO_ATUAL' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total de Itens Físicos</span>
              <p className="text-2xl font-extrabold text-white mt-1">
                {totalItemsCount.toLocaleString('pt-BR')} <span className="text-xs text-slate-400 font-normal">unidades físicas</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{filteredMaterials.length} SKUs catalogados</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-semibold uppercase">Patrimônio em Estoque</span>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">
                {formatCurrency(totalStockValue)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Valoração pelo custo médio contábil</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-semibold uppercase">Itens em Risco (Abaixo Mín)</span>
              <p className="text-2xl font-extrabold text-rose-400 mt-1">
                {criticalItemsCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Necessitam de cotação ou reposição imediata</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap gap-3 items-center justify-between print:hidden">
            <div className="flex flex-wrap gap-3 items-center">
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="TODAS">Todas as Categorias</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="CRITICO">Abaixo do Mínimo / Ruptura</option>
                  <option value="NORMAL">Estoque Normal</option>
                  <option value="EXCESSO">Em Excesso</option>
                </select>
              </div>
            </div>

            <span className="text-xs text-slate-400">
              Exibindo <strong className="text-amber-400">{filteredMaterials.length}</strong> itens no relatório
            </span>
          </div>

          {/* Printable Report Sheet */}
          <div className="printable-area bg-white text-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl overflow-x-auto">
            {/* Report Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                    RELATÓRIO DE POSIÇÃO ATUAL DE ESTOQUE
                  </h2>
                  <p className="text-xs text-slate-600 font-semibold">
                    Divisão de Suprimentos & Almoxarifado Industrial • Sistema ALMOX CONTROL
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <p><strong>Emissão:</strong> {formatDateTime(new Date().toISOString())}</p>
                  <p><strong>Resp. Técnico:</strong> Matheus Messias</p>
                </div>
              </div>
            </div>

            {/* Position Table */}
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-2 border border-slate-300">Código</th>
                  <th className="p-2 border border-slate-300">Descrição do Material</th>
                  <th className="p-2 border border-slate-300">Categoria</th>
                  <th className="p-2 border border-slate-300 text-center">UN</th>
                  <th className="p-2 border border-slate-300 text-right">Saldo Atual</th>
                  <th className="p-2 border border-slate-300 text-center">Mín / Máx</th>
                  <th className="p-2 border border-slate-300 text-center">Status</th>
                  <th className="p-2 border border-slate-300 text-right">Custo Un.</th>
                  <th className="p-2 border border-slate-300 text-right">Valor Total</th>
                  <th className="p-2 border border-slate-300">Localização</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((mat) => {
                  const status = getStockStatus(mat);
                  const total = mat.currentQuantity * mat.unitPrice;
                  return (
                    <tr key={mat.id} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 font-mono font-bold">{mat.code}</td>
                      <td className="p-2 border border-slate-300 font-medium">{mat.name}</td>
                      <td className="p-2 border border-slate-300 text-slate-600">{mat.category}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{mat.unit}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold">{mat.currentQuantity}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono text-slate-600">
                        {mat.minQuantity} / {mat.maxQuantity}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-semibold text-[10px]">
                        {status.label}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">{formatCurrency(mat.unitPrice)}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold">{formatCurrency(total)}</td>
                      <td className="p-2 border border-slate-300 text-slate-600">{mat.location}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-slate-900">
                  <td colSpan={4} className="p-2 text-right">TOTAL GERAL CONSOLIDADO:</td>
                  <td className="p-2 text-right font-mono">{totalItemsCount}</td>
                  <td colSpan={3} className="p-2"></td>
                  <td className="p-2 text-right font-mono font-extrabold">{formatCurrency(totalStockValue)}</td>
                  <td className="p-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: MOVIMENTAÇÕES POR PERÍODO */}
      {reportType === 'MOVIMENTACOES_PERIODO' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 print:hidden">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total de Entradas</span>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1 flex items-center space-x-1">
                <ArrowDownRight className="w-5 h-5 inline" />
                <span>{totalEntriesQty}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{periodEntries.length} operações de entrada</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total de Saídas</span>
              <p className="text-2xl font-extrabold text-amber-400 mt-1 flex items-center space-x-1">
                <ArrowUpRight className="w-5 h-5 inline" />
                <span>{totalExitsQty}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{periodExits.length} operações de saída</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-semibold uppercase">Balanço Líquido</span>
              <p className={`text-2xl font-extrabold mt-1 ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netBalance > 0 ? `+${netBalance}` : netBalance}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Variação líquida do inventário no período</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <span className="text-xs text-slate-400 font-semibold uppercase">Setor Mais Ativo</span>
              <p className="text-lg font-bold text-white mt-1 truncate">
                {departments[0]?.name || 'Geral'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Maior volume de requisições</p>
            </div>
          </div>

          {/* Period Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap gap-4 items-center justify-between print:hidden">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-semibold">Período:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <span className="text-xs text-slate-400">até</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="TODOS">Todos os Setores</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <span className="text-xs text-slate-400">
              Total de <strong className="text-amber-400">{periodMovements.length}</strong> movimentações no período
            </span>
          </div>

          {/* Printable Period Report Sheet */}
          <div className="printable-area bg-white text-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl overflow-x-auto">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                    RELATÓRIO DE MOVIMENTAÇÕES POR PERÍODO
                  </h2>
                  <p className="text-xs text-slate-600 font-semibold">
                    Intervalo auditado: {formatDate(startDate)} a {formatDate(endDate)} • Sistema ALMOX CONTROL
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <p><strong>Emissão:</strong> {formatDateTime(new Date().toISOString())}</p>
                  <p><strong>Resp. Técnico:</strong> Matheus Messias</p>
                </div>
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-2 border border-slate-300">Data / Hora</th>
                  <th className="p-2 border border-slate-300 text-center">Tipo</th>
                  <th className="p-2 border border-slate-300">Código</th>
                  <th className="p-2 border border-slate-300">Material</th>
                  <th className="p-2 border border-slate-300 text-right">Qtd</th>
                  <th className="p-2 border border-slate-300 text-center">Saldo Resultante</th>
                  <th className="p-2 border border-slate-300">Setor Solicitante</th>
                  <th className="p-2 border border-slate-300">Solicitante</th>
                  <th className="p-2 border border-slate-300">Documento / Motivo</th>
                </tr>
              </thead>
              <tbody>
                {periodMovements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500">
                      Nenhuma movimentação registrada no intervalo selecionado.
                    </td>
                  </tr>
                ) : (
                  periodMovements.map((mov) => {
                    const isEntry = mov.type === 'ENTRADA';
                    return (
                      <tr key={mov.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 font-mono text-[10px]">{formatDateTime(mov.date)}</td>
                        <td className="p-2 border border-slate-300 text-center font-bold text-[10px]">
                          <span className={isEntry ? 'text-emerald-700' : 'text-amber-700'}>
                            {mov.type}
                          </span>
                        </td>
                        <td className="p-2 border border-slate-300 font-mono font-bold">{mov.materialCode}</td>
                        <td className="p-2 border border-slate-300 font-medium">{mov.materialName}</td>
                        <td className="p-2 border border-slate-300 text-right font-mono font-bold">
                          {isEntry ? '+' : '-'}{mov.quantity} {mov.materialUnit}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                          {mov.balanceAfter} {mov.materialUnit}
                        </td>
                        <td className="p-2 border border-slate-300">{mov.departmentName}</td>
                        <td className="p-2 border border-slate-300">{mov.requester}</td>
                        <td className="p-2 border border-slate-300 text-[10px] text-slate-600">
                          <strong>{mov.documentNumber || '-'}</strong>: {mov.reason}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
