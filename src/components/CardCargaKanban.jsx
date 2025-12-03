import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Package, Eye, Timer, Truck, ArrowRight, RefreshCw, ArrowUp, ArrowDown, FastForward, ChevronLeft, ChevronRight, PackageX, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ModalInformarRacao from './ModalInformarRacao'; // CORREÇÃO: Caminho ajustado
import useStore from '@/store/useStore'; // CORREÇÃO: Caminho absoluto ajustado

const CardCargaKanban = ({ carga, statusKanbanOrdenado }) => {
  const { moverCargaKanban, tiposFrota } = useStore();
  const [showModalRacao, setShowModalRacao] = useState(false);

  const getTipoFrotaInfo = (tipo) => tiposFrota.find(t => t.id === tipo) || tiposFrota[0];
  const tipoFrota = getTipoFrotaInfo(carga.tipoFrota);

  const getTempoDesdeUltimaAcao = (carga) => {
    if (!carga.historico || carga.historico.length === 0) return '';
    const ultimaAcao = carga.historico[carga.historico.length - 1];
    const agora = new Date();
    const timestampAcao = new Date(ultimaAcao.timestamp);
    const diffMs = agora - timestampAcao;
    
    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`;
  };
  const tempoDesdeUltima = getTempoDesdeUltimaAcao(carga);

  const getCorStatus = (status) => {
    const cores = {
      'aguardando-entrada': 'from-gray-100 to-gray-50 border-gray-300',
      'aguardando-carregamento': 'from-blue-100 to-blue-50 border-blue-300',
      'aguardando-racao': 'from-yellow-100 to-yellow-50 border-yellow-300',
      'carregando': 'from-orange-100 to-orange-50 border-orange-300',
      'carregada': 'from-green-100 to-green-50 border-green-300',
      'faturado': 'from-purple-100 to-purple-50 border-purple-300'
    };
    return cores[status] || 'from-gray-100 to-gray-50 border-gray-300';
  };

  const getProximoStatus = (statusAtual) => {
    const currentIndex = statusKanbanOrdenado.findIndex(s => s.id === statusAtual);
    return currentIndex < statusKanbanOrdenado.length - 1 ? statusKanbanOrdenado[currentIndex + 1] : null;
  };
  const proximoStatus = getProximoStatus(carga.status);

  const getStatusAnterior = (statusAtual) => {
    const currentIndex = statusKanbanOrdenado.findIndex(s => s.id === statusAtual);
    return currentIndex > 0 ? statusKanbanOrdenado[currentIndex - 1] : null;
  };
  const statusAnterior = getStatusAnterior(carga.status);

  const getOutrosStatus = (statusAtual) => {
    return statusKanbanOrdenado.filter(status => status.id !== statusAtual && status.id !== proximoStatus?.id && status.id !== statusAnterior?.id);
  };
  const outrosStatus = getOutrosStatus(carga.status);

  const moverCargaComConfirmacao = (cargaId, novoStatus, acao) => {
    const statusInfo = statusKanbanOrdenado.find(s => s.id === novoStatus);
    
    if (window.confirm(`Confirmar ${acao} da carga ${carga.romaneio} para "${statusInfo.label}"?`)) {
      moverCargaKanban(cargaId, novoStatus);
    }
  };

  const handleAvancar = () => {
    if (proximoStatus) {
      moverCargaComConfirmacao(carga.id, proximoStatus.id, 'avanço');
    }
  };

  const handleVoltar = () => {
    if (statusAnterior) {
      moverCargaComConfirmacao(carga.id, statusAnterior.id, 'retrocesso');
    }
  };

  const handlePularParaStatus = (novoStatus) => {
    moverCargaComConfirmacao(carga.id, novoStatus, 'pulo');
  };
  
  const handleConfirmarRacao = (dadosRacao) => {
    moverCargaKanban(carga.id, 'aguardando-racao', dadosRacao);
    setShowModalRacao(false);
  };
  
  const handleRacaoDisponivel = () => {
    if (window.confirm(`Confirmar ração disponível para ${carga.romaneio}?`)) {
      moverCargaKanban(carga.id, 'carregando');
    }
  };

  return (
    <>
      <motion.div
        className={`bg-gradient-to-br ${getCorStatus(carga.status)} border-2 rounded-2xl p-4 mb-3 shadow-xl hover:shadow-2xl transition-all`}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-3 py-1 shadow-md">
              {carga.romaneio}
            </Badge>
            <span className="text-2xl">{tipoFrota.icon}</span>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/50">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes - {carga.romaneio}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Peso</p>
                    <p className="font-bold">{carga.peso} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Frota</p>
                    <p className="font-bold">{tipoFrota.label}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Descrição</p>
                  <p className="text-sm">{carga.descricao}</p>
                </div>
                <Separator />
                <div>
                  <p className="font-semibold text-sm mb-2">Histórico</p>
                  <ScrollArea className="h-40">
                    {carga.historico?.map((evento, idx) => (
                      <div key={idx} className="text-xs py-1">
                        {statusKanbanOrdenado.find(s => s.id === evento.status)?.label} - 
                        {new Date(evento.timestamp).toLocaleString('pt-BR')}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <p className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
          {carga.descricao}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <span className="flex items-center gap-1 font-medium">
            <Package className="h-3 w-3" />
            {carga.peso.toLocaleString()} kg
          </span>
          {tempoDesdeUltima && (
            <span className="flex items-center gap-1 text-orange-600 font-medium">
              <Timer className="h-3 w-3" />
              {tempoDesdeUltima}
            </span>
          )}
        </div>
        
        {carga.racaoNecessaria && (
          <div className="bg-yellow-200/50 border border-yellow-400 rounded-lg p-2 mb-3">
            <p className="text-xs font-bold text-yellow-900">
              ⏳ Aguardando: {carga.racaoNecessaria.racaoNome}
            </p>
            <p className="text-xs text-yellow-800">
              {carga.racaoNecessaria.quantidadeSacos} sacos
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {proximoStatus && (
            <Button
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-lg"
              onClick={handleAvancar}
              size="sm"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Avançar →
            </Button>
          )}

          <div className="flex gap-2">
            {statusAnterior && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleVoltar}
                size="sm"
              >
                <ArrowDown className="h-3 w-3 mr-1" />
                Voltar
              </Button>
            )}

            {/* Lógica para Ração OK (Substitui o botão "Faltar Ração" removido) */}
            {carga.status === 'aguardando-racao' && (
              <Button
                variant="outline"
                className="flex-1 bg-green-50 border-green-500 text-green-700 hover:bg-green-100"
                onClick={handleRacaoDisponivel}
                size="sm"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Ração OK
              </Button>
            )}

            {outrosStatus.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2">
                    <FastForward className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {outrosStatus.map((status) => (
                    <DropdownMenuItem 
                      key={status.id}
                      onClick={() => handlePularParaStatus(status.id)}
                    >
                      {status.icon} {status.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </motion.div>
      
      <ModalInformarRacao
        isOpen={showModalRacao}
        onClose={() => setShowModalRacao(false)}
        carga={carga}
        onConfirm={handleConfirmarRacao}
      />
    </>
  );
};

export default CardCargaKanban;
