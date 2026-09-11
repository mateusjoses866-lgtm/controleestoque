import React, { useEffect, useState } from 'react';
import { X, History, ArrowDownRight, ArrowUpRight, Calendar, User, FileText, Tag, MapPin } from 'lucide-react';
import { Material, Movement } from '../types';
import { api } from '../services/api';
import { formatDateTime, getStockStatus } from '../utils/formatters';

interface MaterialHistoryModalProps {
  material: Material | null;
  onClose: () => void;
  onQuickMovement: (material: Material, type: 'ENTRADA' | 'SAIDA') => void;
}

export const MaterialHistoryModal: React.FC<MaterialHistoryModalProps> = ({
  material,
  onClose,
  onQuickMovement
}) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!material) return;
    setIsLoading(true);
    api.getMaterialHistory(material.id)
      .then(data => setMovements(data))
      .catch(err => console.error('Erro ao buscar histórico:', err))
      .finally(() => setIsLoading(false));
  }, [material]);

  if (!material) return null;

  const status = getStockStatus(material);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-amber-300">
                {material.code}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${status.badgeClass}`}>
                {status.label}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              {material.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>Categoria: <strong className="text-slate-200">{material.category}</strong></span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{material.location || 'Almoxarifado Geral'}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Material Balance Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Saldo Atual</span>
            <p className="text-lg font-extrabold text-white">
              {material.currentQuantity} <span className="text-xs text-slate-400 font-normal">{material.unit}</span>
            </p>
          </div>
          <div>
            <span className="text-slate-400">Estoque Mínimo</span>
            <p className="text-lg font-extrabold text-rose-400">
              {material.minQuantity} <span className="text-xs text-slate-400 font-normal">{material.unit}</span>
            </p>
          </div>
          <div>
            <span className="text-slate-400">Estoque Máximo</span>
            <p className="text-lg font-extrabold text-purple-400">
              {material.maxQuantity} <span className="text-xs text-slate-400 font-normal">{material.unit}</span>
            </p>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => {
                onClose();
                onQuickMovement(material, 'ENTRADA');
              }}
              className="px-2.5 py-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Entrada</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onQuickMovement(material, 'SAIDA');
              }}
              disabled={material.currentQuantity <= 0}
              className="px-2.5 py-1.5 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 font-bold flex items-center space-x-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Saída</span>
            </button>
          </div>
        </div>

        {/* Movements Chronology */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>Histórico Cronológico de Auditoria</span>
            </h3>
            <span className="text-xs text-slate-400">
              {movements.length} registro(s) encontrado(s)
            </span>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden max-h-[350px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Carregando movimentações...</div>
            ) : movements.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Nenhuma movimentação registrada para este material ainda.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-300 uppercase tracking-wider sticky top-0 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Data / Hora</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3 text-right">Qtd</th>
                    <th className="py-2.5 px-3 text-center">Saldo Anterior → Novo</th>
                    <th className="py-2.5 px-3">Setor / Solicitante</th>
                    <th className="py-2.5 px-3">Doc / Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {movements.map((mov) => {
                    const isEntry = mov.type === 'ENTRADA';
                    return (
                      <tr key={mov.id} className="hover:bg-slate-850/40">
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
                        <td className={`py-2.5 px-3 text-right font-bold font-mono ${isEntry ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isEntry ? '+' : '-'}{mov.quantity} {mov.materialUnit}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                          <span className="text-slate-400">{mov.balanceBefore}</span>
                          <span className="text-slate-600 mx-1.5">→</span>
                          <span className="font-bold text-white">{mov.balanceAfter}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          <p className="font-semibold text-white">{mov.departmentName}</p>
                          <p className="text-[11px] text-slate-400">{mov.requester}</p>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 max-w-[200px]">
                          <p className="font-mono text-[11px] text-amber-300">{mov.documentNumber || 'S/N'}</p>
                          <p className="text-[11px] text-slate-400 truncate" title={mov.reason}>{mov.reason}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer Close */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
