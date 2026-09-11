import React from 'react';
import { 
  Boxes, 
  BarChart3, 
  Package, 
  ArrowLeftRight, 
  FileText, 
  PieChart, 
  Building2, 
  BookOpen, 
  PlusCircle, 
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickMovement: () => void;
  criticalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickMovement,
  criticalCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: BarChart3 },
    { id: 'materials', label: 'Materiais', icon: Package, badge: criticalCount > 0 ? criticalCount : undefined },
    { id: 'movements', label: 'Movimentações', icon: ArrowLeftRight },
    { id: 'requisitions', label: 'Requisições Impressas', icon: FileText },
    { id: 'reports', label: 'Posição de Estoque', icon: PieChart },
    { id: 'departments', label: 'Setores', icon: Building2 },
    { id: 'best-practices', label: 'Boas Práticas', icon: BookOpen }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl print:hidden">
      {/* Top bar with corporate branding & technical lead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/10">
              <Boxes className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">ALMOX</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase tracking-wider">
                  Corporate
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Sistema Integrado de Controle de Estoques & Almoxarifado
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Technical Lead Badge */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-950/70 border border-slate-800 rounded-full px-3.5 py-1.5 text-xs text-slate-300 shadow-inner">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Responsável Técnico: <strong className="text-amber-300 font-semibold">Matheus Messias</strong>
              </span>
            </div>

            {/* Quick Action Button */}
            <button
              id="btn-quick-movement"
              onClick={onOpenQuickMovement}
              className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-md hover:shadow-amber-400/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Nova Movimentação</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-rose-500 text-white animate-pulse'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
