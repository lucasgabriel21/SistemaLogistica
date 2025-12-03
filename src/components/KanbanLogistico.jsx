import React from 'react';
import { Clock, Package, Truck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StatCard from './StatCard'; // Componente de estatísticas
import TabelaLogistica from './TabelaLogistica'; // NOVO Componente de Tabela
import useStore from '@/store/useStore';

const KanbanLogistico = () => {
  const { cargasKanban, statusKanban } = useStore();
  
  // Ordem corrigida dos status
  const statusOrdemCorreta = [
    'aguardando-entrada',
    'aguardando-carregamento',
    'carregando',
    'aguardando-racao',
    'carregada',
    'faturado'
  ];

  const statusKanbanOrdenado = statusOrdemCorreta
    .map(id => statusKanban.find(s => s.id === id))
    .filter(Boolean);
  
  // Estatísticas
  const stats = {
    total: cargasKanban.length,
    andamento: cargasKanban.filter(c => !['carregada', 'faturado'].includes(c.status)).length,
    carregadas: cargasKanban.filter(c => c.status === 'carregada').length,
    faturadas: cargasKanban.filter(c => c.status === 'faturado').length,
  };
  
  return (
    <div className="w-full h-full flex flex-col overflow-hidden p-2 sm:p-4">
      {/* Cards de Estatísticas - DASHBOARD (100% Responsivo) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0 mb-4">
        <StatCard
          icon={Package}
          label="Total"
          value={stats.total}
          gradient="from-blue-500 to-blue-700"
        />
        <StatCard
          icon={Clock}
          label="Andamento"
          value={stats.andamento}
          gradient="from-orange-500 to-orange-700"
        />
        <StatCard
          icon={Truck}
          label="Carregadas"
          value={stats.carregadas}
          gradient="from-green-500 to-green-700"
        />
        <StatCard
          icon={RefreshCw}
          label="Faturadas"
          value={stats.faturadas}
          gradient="from-purple-500 to-purple-700"
        />
      </div>
      
      {cargasKanban.length > 0 ? (
        <Card className="shadow-xl rounded-2xl flex-1 min-h-0 overflow-hidden">
          <CardContent className="p-0 h-full">
            <TabelaLogistica cargas={cargasKanban} statusKanbanOrdenado={statusKanbanOrdenado} />
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-xl rounded-2xl flex-1">
          <CardContent className="p-12 text-center h-full flex flex-col justify-center items-center">
            <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nenhuma carga no Logístico
            </h3>
            <p className="text-gray-500 mb-6">
              Importe cargas na Preparação para iniciar o acompanhamento logístico.
            </p>
            <Button
              onClick={() => useStore.getState().setCurrentView('preparacao')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ir para Preparação
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KanbanLogistico;
