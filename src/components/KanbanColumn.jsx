import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';
import CardCargaKanban from './CardCargaKanban';
import useStore from '@/store/useStore'; // CORREÇÃO: Caminho absoluto ajustado

const KanbanColumn = ({ status, cargas, statusKanbanOrdenado }) => {
  const statusInfo = statusKanbanOrdenado.find(s => s.id === status);
  const cargasNaColuna = cargas.filter(carga => carga.status === status);
  
  const getCorHeader = (status) => {
    const cores = {
      'aguardando-entrada': 'from-gray-600 to-gray-700',
      'aguardando-carregamento': 'from-blue-600 to-blue-700',
      'aguardando-racao': 'from-yellow-600 to-yellow-700',
      'carregando': 'from-orange-600 to-orange-700',
      'carregada': 'from-green-600 to-green-700',
      'faturado': 'from-purple-600 to-purple-700'
    };
    return cores[status] || 'from-gray-600 to-gray-700';
  };
  
  return (
    <Card className="h-full flex flex-col shadow-2xl rounded-2xl overflow-hidden">
      <CardHeader className={`bg-gradient-to-r ${getCorHeader(status)} text-white p-4 sticky top-0 z-10`}>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <span className="text-xl">{statusInfo?.icon}</span>
            <span className="font-bold">{statusInfo?.label}</span>
          </div>
          <Badge className="bg-white/30 text-white font-bold px-3">
            {cargasNaColuna.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3 flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        <div className="min-h-[200px]">
          <AnimatePresence>
            {cargasNaColuna.map((carga) => (
              <CardCargaKanban key={carga.id} carga={carga} statusKanbanOrdenado={statusKanbanOrdenado} />
            ))}
          </AnimatePresence>
          
          {cargasNaColuna.length === 0 && (
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl bg-white">
              <div className="text-center text-gray-400">
                <Package className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Vazio</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KanbanColumn;
