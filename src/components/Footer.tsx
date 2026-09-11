import React from 'react';
import { ShieldCheck, RefreshCw, Database } from 'lucide-react';

interface FooterProps {
  onResetData: () => void;
  isLoading: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onResetData, isLoading }) => {
  return (
    <footer className="bg-slate-900/90 border-t border-slate-800 text-slate-400 py-6 text-xs mt-12 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
          <div className="flex items-center space-x-2 text-slate-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>ALMOX CONTROL v2.4</span>
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <div>
            Responsável Técnico: <strong className="text-amber-400 font-medium">Matheus Messias</strong>
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Persistência Ativa (Full-Stack Express + JSON DB)</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            id="btn-footer-reset-data"
            onClick={onResetData}
            disabled={isLoading}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors p-1.5 rounded hover:bg-slate-800/80 cursor-pointer disabled:opacity-50"
            title="Restaurar banco de dados com dados de exemplo originais"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Restaurar Amostra de Dados</span>
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 pt-3 border-t border-slate-800/50 text-center text-slate-500 text-[11px]">
        Desenvolvido para gestão rigorosa de almoxarifados industriais e controle de inventário corporativo. Todos os direitos reservados.
      </div>
    </footer>
  );
};
