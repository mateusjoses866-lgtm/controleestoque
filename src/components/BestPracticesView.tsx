import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Calculator, 
  BarChart2, 
  Clock, 
  ShieldAlert, 
  Layers, 
  TrendingUp, 
  HelpCircle,
  Lightbulb,
  Sparkles
} from 'lucide-react';

export const BestPracticesView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'TECNICAS' | 'CURVA_ABC' | 'FREQUENCIA' | 'MIN_MAX' | 'SIMULADOR'>('TECNICAS');

  // Interactive Calculator State
  const [dailyDemand, setDailyDemand] = useState<number>(15);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);
  const [safetyDays, setSafetyDays] = useState<number>(3);
  const [batchLotSize, setBatchLotSize] = useState<number>(100);

  // Calculations:
  // Safety Stock = Daily Demand * Safety Days
  const calculatedSafetyStock = dailyDemand * safetyDays;
  // Reorder Point = (Daily Demand * Lead Time) + Safety Stock
  const calculatedReorderPoint = (dailyDemand * leadTimeDays) + calculatedSafetyStock;
  // Max Stock = Reorder Point + Lot Size
  const calculatedMaxStock = calculatedReorderPoint + batchLotSize;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Manual Corporativo & Capacitação</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Boas Práticas em Gestão de Almoxarifado & Estoque
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Diretrizes operacionais, métodos quantitativos de suprimento e simulador interativo de ponto de reposição para maximizar o nível de serviço e mitigar custos de posse.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-300 self-start lg:self-auto">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Padrão ISO 9001 / WMS</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'TECNICAS', label: '1. Técnicas de Controle', icon: Layers },
          { id: 'CURVA_ABC', label: '2. Curva ABC & Criticidade', icon: BarChart2 },
          { id: 'FREQUENCIA', label: '3. Frequência & Auditoria', icon: Clock },
          { id: 'MIN_MAX', label: '4. Estoque Mínimo e Máximo', icon: ShieldAlert },
          { id: 'SIMULADOR', label: '5. Calculadora de Ponto de Pedido', icon: Calculator }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TÉCNICAS DE CONTROLE */}
      {activeSubTab === 'TECNICAS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <span className="font-extrabold text-sm font-mono">PEPS</span>
            </div>
            <h3 className="text-base font-bold text-white">PEPS / FIFO (Primeiro a Entrar, Primeiro a Sair)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              O material mais antigo no estoque deve ser o primeiro a ser consumido ou expedido. Ideal para itens perecíveis, óleos com prazo de validade ou materiais sujeitos a obsolescência tecnológica.
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[11px] text-slate-400">
              <strong className="text-amber-400 block mb-1">Vantagem Contábil:</strong>
              Valoriza o estoque final a preços de aquisição mais recentes e evita descarte por vencimento ou desgaste de embalagens.
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <span className="font-extrabold text-sm font-mono">UEPS</span>
            </div>
            <h3 className="text-base font-bold text-white">UEPS / LIFO (Último a Entrar, Primeiro a Sair)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              O último lote adquirido é o primeiro a ser despachado. Usado estritamente para análises de custo gerencial ou estoques não perecíveis a granel.
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[11px] text-slate-400">
              <strong className="text-rose-400 block mb-1">Atenção Tributária:</strong>
              Não é aceito pela Receita Federal do Brasil (RFB) para apuração de IRPJ, sendo seu uso restrito à gestão de custos industriais internos.
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <span className="font-extrabold text-sm font-mono">CMP</span>
            </div>
            <h3 className="text-base font-bold text-white">Custo Médio Ponderado (CMP)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              A cada nova entrada de mercadoria por preço diferente, calcula-se um novo custo unitário médio dividindo o valor total acumulado pela quantidade física existente.
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[11px] text-slate-400">
              <strong className="text-emerald-400 block mb-1">Recomendação:</strong>
              Método padrão utilizado no sistema ALMOX CONTROL para precificação e consolidação do inventário patrimonial.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CURVA ABC & CRITICIDADE */}
      {activeSubTab === 'CURVA_ABC' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-amber-400" />
              <span>Metodologia da Curva ABC (Princípio de Pareto 80/20)</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              A Curva ABC segmenta os materiais de acordo com sua representatividade no valor financeiro total de consumo ou estoque, permitindo focar a energia e o rigor de controle nos itens de maior impacto.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950 border border-amber-400/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-lg text-amber-400">Classe A</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/10 text-amber-300 font-bold border border-amber-400/20">
                    Altíssimo Valor
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Corresponde a cerca de <strong>20% dos itens</strong> em catálogo, mas representa aproximadamente <strong>80% do valor monetário</strong> investido.
                </p>
                <p className="text-[11px] text-amber-300 font-medium">
                  → Controle diário rigoroso, inventários semanais, pedidos fracionados e estoque de segurança reduzido.
                </p>
              </div>

              <div className="bg-slate-950 border border-blue-500/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-lg text-blue-400">Classe B</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20">
                    Valor Intermediário
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Corresponde a aproximadamente <strong>30% dos itens</strong> e cerca de <strong>15% do valor total</strong> em estoque.
                </p>
                <p className="text-[11px] text-blue-300 font-medium">
                  → Controle quinzenal ou mensal, acompanhamento de lotes e reposição programada.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-lg text-slate-300">Classe C</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-bold">
                    Baixo Custo / Alto Volume
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Corresponde a <strong>50% dos itens</strong> físicos (porcas, parafusos, formulários), mas apenas <strong>5% do capital imobilizado</strong>.
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  → Controle simplificado (ex: sistema de duas gavetas), compras em lotes maiores para diluir frete.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Classificação XYZ de Criticidade Operacional</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Além do valor contábil (ABC), é vital classificar materiais pelo impacto que sua falta causa na produção:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                <span className="font-bold text-rose-400">Classe X (Críticos):</span>
                <p className="text-slate-400 mt-1">Materiais insubstituíveis cuja falta paralisa linhas produtivas inteiras. Devem ter estoque de segurança garantido mesmo que sejam caros.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                <span className="font-bold text-amber-400">Classe Y (Médios):</span>
                <p className="text-slate-400 mt-1">Materiais que possuem substitutos imediatos no mercado local ou cuja falta pode ser tolerada por curto período.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                <span className="font-bold text-slate-300">Classe Z (Não Críticos):</span>
                <p className="text-slate-400 mt-1">Materiais de consumo geral e fácil obtenção que não impactam diretamente a operação fabril.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FREQUÊNCIA & AUDITORIA */}
      {activeSubTab === 'FREQUENCIA' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Inventário Cíclico vs. Inventário Geral</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1">
                <strong className="text-amber-400 text-sm block">Inventário Cíclico / Rotativo (Recomendado)</strong>
                <p>
                  Contagens diárias ou semanais de pequenas amostras de itens programados ao longo do ano.
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 mt-2">
                  <li>Não exige parada total da fábrica ou almoxarifado.</li>
                  <li>Erros de registro são detectados e corrigidos em tempo hábil.</li>
                  <li>Itens Classe A são contados 1x ao mês; Classe B a cada trimestre; Classe C semestralmente.</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1">
                <strong className="text-slate-300 text-sm block">Inventário Geral Anual</strong>
                <p>
                  Contagem física de 100% dos itens do almoxarifado no encerramento do exercício contábil (geralmente dezembro).
                </p>
                <p className="text-slate-400">
                  Gera paralisação operacional e não impede desvios ocorridos meses antes. Deve ser apenas a formalização contábil final.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Procedimentos Padrão de Conferência</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
                <div>
                  <strong className="text-white block mb-0.5">Conferência Cega no Recebimento</strong>
                  <p className="text-slate-400">O conferente conta o material físico sem saber previamente a quantidade declarada na nota fiscal, evitando viés de confirmação.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
                <div>
                  <strong className="text-white block mb-0.5">Lançamento Imediato no Sistema</strong>
                  <p className="text-slate-400">Nenhum item pode sair do almoxarifado sem a emissão prévia da Requisição assinada no sistema, eliminando notas de papel avulsas.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">3</span>
                <div>
                  <strong className="text-white block mb-0.5">Auditoria e Conciliação de Sobras / Faltas</strong>
                  <p className="text-slate-400">Divergências superiores a 1% devem exigir abertura de Relatório de Não Conformidade (RNC) e apuração pelo gestor do almoxarifado.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ESTOQUE MÍNIMO E MÁXIMO */}
      {activeSubTab === 'MIN_MAX' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Equações Fundamentais de Dimensionamento de Estoque</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              O dimensionamento correto do estoque mínimo e máximo impede dois riscos financeiros graves: a ruptura operacional (prejuízo por máquina parada) e o custo de posse excessivo (capital imobilizado, perda de espaço e risco de avaria).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold uppercase text-amber-400">1. Estoque de Segurança ($ES$)</div>
                <p className="font-mono text-xs font-bold text-white bg-slate-900 p-2 rounded border border-slate-800">
                  ES = Consumo Diário (D) × Margem de Segurança (K)
                </p>
                <p className="text-xs text-slate-400">
                  Reserva para cobrir atrasos do fornecedor ou picos imprevistos de requisição pelos setores.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold uppercase text-blue-400">2. Ponto de Reposição ($PR$)</div>
                <p className="font-mono text-xs font-bold text-white bg-slate-900 p-2 rounded border border-slate-800">
                  PR = (Consumo Diário × Lead Time) + ES
                </p>
                <p className="text-xs text-slate-400">
                  O nível de estoque no qual o setor de compras deve disparar o pedido de fornecimento imediatamente.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold uppercase text-purple-400">3. Estoque Máximo ($EM$)</div>
                <p className="font-mono text-xs font-bold text-white bg-slate-900 p-2 rounded border border-slate-800">
                  EM = Estoque Mínimo + Lote Econômico de Compra (LEC)
                </p>
                <p className="text-xs text-slate-400">
                  O teto físico e financeiro. Superar esse valor indica compras antecipadas desnecessárias.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SIMULADOR INTERATIVO */}
      {activeSubTab === 'SIMULADOR' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Calculadora Prática de Dimensionamento de Reposição</h2>
          </div>
          <p className="text-xs text-slate-300">
            Preencha os parâmetros médios do item para calcular instantaneamente o Estoque de Segurança, Ponto de Pedido e Estoque Máximo sugerido.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Input Form */}
            <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <label>Consumo Médio Diário ($D$):</label>
                  <span className="font-mono text-amber-400 font-bold">{dailyDemand} unidades/dia</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={dailyDemand}
                  onChange={(e) => setDailyDemand(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <label>Tempo de Reposição do Fornecedor / Lead Time ($TR$):</label>
                  <span className="font-mono text-blue-400 font-bold">{leadTimeDays} dias</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="45"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  className="w-full accent-blue-400"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <label>Margem de Cobertura de Segurança ($K$):</label>
                  <span className="font-mono text-emerald-400 font-bold">{safetyDays} dias de consumo</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={safetyDays}
                  onChange={(e) => setSafetyDays(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <label>Lote Econômico de Compra Padrão ($LEC$):</label>
                  <span className="font-mono text-purple-400 font-bold">{batchLotSize} unidades</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={batchLotSize}
                  onChange={(e) => setBatchLotSize(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>
            </div>

            {/* Results Output Card */}
            <div className="bg-slate-950 border-2 border-amber-400/40 rounded-xl p-6 space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Parâmetros Calculados para o Material
              </span>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-300">Estoque de Segurança ($ES$):</span>
                  <span className="font-mono text-base font-extrabold text-emerald-400">
                    {calculatedSafetyStock} un.
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-300">Ponto de Reposição / Disparo ($PR$):</span>
                  <span className="font-mono text-xl font-extrabold text-amber-400">
                    {calculatedReorderPoint} un.
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-300">Estoque Máximo Recomendado ($EM$):</span>
                  <span className="font-mono text-base font-extrabold text-purple-400">
                    {calculatedMaxStock} un.
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-white block mb-1">Regra de Ouro do Almoxarife:</strong>
                Quando o saldo físico em estoque atingir <strong>{calculatedReorderPoint} unidades</strong>, gere uma requisição de compra de <strong>{batchLotSize} unidades</strong> imediatamente.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
