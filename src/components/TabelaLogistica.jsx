import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Timer, TrendingUp, ArrowDown, FastForward, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import useStore from '@/store/useStore';
import ModalInformarRacao from './ModalInformarRacao';

const TabelaLogistica = ({ cargas, statusKanbanOrdenado }) => {
  const { moverCargaKanban, tiposFrota } = useStore();
  const [showModalRacao, setShowModalRacao] = useState(false);
  const [cargaSelecionada, setCargaSelecionada] = useState(null);

  const getTipoFrotaInfo = (tipo) => tiposFrota.find(t => t.id === tipo) || tiposFrota[0];

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

  const getCorStatus = (status) => {
    const cores = {
      'aguardando-entrada': 'bg-gray-500 hover:bg-gray-600',
      'aguardando-carregamento': 'bg-blue-500 hover:bg-blue-600',
      'aguardando-racao': 'bg-yellow-500 hover:bg-yellow-600',
      'carregando': 'bg-orange-500 hover:bg-orange-600',
      'carregada': 'bg-green-500 hover:bg-green-600',
      'faturado': 'bg-purple-500 hover:bg-purple-600'
    };
    return cores[status] || 'bg-gray-500 hover:bg-gray-600';
  };

  const handleStatusChange = (cargaId, novoStatus) => {
    const statusInfo = statusKanbanOrdenado.find(s => s.id === novoStatus);
    
    if (novoStatus === 'aguardando-racao') {
      setCargaSelecionada(cargas.find(c => c.id === cargaId));
      setShowModalRacao(true);
      return;
    }

    if (window.confirm(`Confirmar mudança de status da carga ${cargas.find(c => c.id === cargaId)?.romaneio} para "${statusInfo.label}"?`)) {
      moverCargaKanban(cargaId, novoStatus);
    }
  };

  const handleConfirmarRacao = (dadosRacao) => {
    if (cargaSelecionada) {
      moverCargaKanban(cargaSelecionada.id, 'aguardando-racao', dadosRacao);
    }
    setShowModalRacao(false);
    setCargaSelecionada(null);
  };

  const handleRacaoDisponivel = (cargaId) => {
    if (window.confirm(`Confirmar ração disponível para ${cargas.find(c => c.id === cargaId)?.romaneio}?`)) {
      moverCargaKanban(cargaId, 'carregando');
    }
  };

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="hidden md:block h-full">
        <ScrollArea className="h-full w-full">
          <Table className="w-full">
            <TableHeader className="sticky top-0 bg-white shadow-sm z-10">
              <TableRow>
                <TableHead className="w-[100px]">Romaneio</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[120px]">Peso (Kg)</TableHead>
                <TableHead className="w-[100px]">Frota</TableHead>
                <TableHead className="w-[150px]">Tempo</TableHead>
                <TableHead className="w-[200px]">Status Atual</TableHead>
                <TableHead className="w-[200px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {cargas.map((carga) => {
                  const tipoFrota = getTipoFrotaInfo(carga.tipoFrota);
                  const tempo = getTempoDesdeUltimaAcao(carga);
                  const statusInfo = statusKanbanOrdenado.find(s => s.id === carga.status);
                  
                  return (
                    <motion.tr
                      key={carga.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50 border-b"
                    >
                      <TableCell className="font-mono font-bold text-blue-600">{carga.romaneio}</TableCell>
                      <TableCell className="text-sm line-clamp-2">{carga.descricao}</TableCell>
                      <TableCell className="font-medium">{carga.peso.toLocaleString('pt-BR')} Kg</TableCell>
                      <TableCell className="text-center">
                        <span className="text-xl" title={tipoFrota.label}>{tipoFrota.icon}</span>
                      </TableCell>
                      <TableCell className="text-orange-600 font-medium flex items-center gap-1">
                        <Timer className="h-4 w-4" /> {tempo}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getCorStatus(carga.status)} text-white`}>
                          {statusInfo?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Select
                            value={carga.status}
                            onValueChange={(novoStatus) => handleStatusChange(carga.id, novoStatus)}
                          >
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                              <SelectValue placeholder="Mudar Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusKanbanOrdenado.map((status) => (
                                <SelectItem key={status.id} value={status.id} className="text-xs">
                                  {status.icon} {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {carga.status === 'aguardando-racao' && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleRacaoDisponivel(carga.id)}
                              title="Ração Disponível"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-gray-100">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Detalhes - {carga.romaneio}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-3">
                                {/* Detalhes da Carga (mesmo conteúdo do CardCargaKanban) */}
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
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      
      {/* Visualização Mobile (Cards Responsivos) */}
      <div className="md:hidden space-y-3 p-3 h-full overflow-y-auto">
        {cargas.map((carga) => {
          const tipoFrota = getTipoFrotaInfo(carga.tipoFrota);
          const tempo = getTempoDesdeUltimaAcao(carga);
          const statusInfo = statusKanbanOrdenado.find(s => s.id === carga.status);
          
          return (
            <motion.div
              key={carga.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white border rounded-xl shadow-md p-4 space-y-2"
            >
              <div className="flex justify-between items-center border-b pb-2">
                <Badge className="bg-blue-600 text-white font-bold text-sm">{carga.romaneio}</Badge>
                <Badge className={`${getCorStatus(carga.status)} text-white`}>{statusInfo?.label}</Badge>
              </div>
              
              <p className="text-sm font-semibold text-gray-900">{carga.descricao}</p>
              
              <div className="grid grid-cols-3 text-xs text-gray-600">
                <div className="flex flex-col">
                  <span className="font-medium">Peso:</span>
                  <span className="font-bold text-green-700">{carga.peso.toLocaleString('pt-BR')} Kg</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Frota:</span>
                  <span className="text-xl">{tipoFrota.icon}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Tempo:</span>
                  <span className="text-orange-600 font-bold flex items-center gap-1">
                    <Timer className="h-3 w-3" /> {tempo}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2 border-t">
                <Select
                  value={carga.status}
                  onValueChange={(novoStatus) => handleStatusChange(carga.id, novoStatus)}
                >
                  <SelectTrigger className="flex-1 h-9 text-xs">
                    <SelectValue placeholder="Mudar Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusKanbanOrdenado.map((status) => (
                      <SelectItem key={status.id} value={status.id} className="text-xs">
                        {status.icon} {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {carga.status === 'aguardando-racao' && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => handleRacaoDisponivel(carga.id)}
                    title="Ração Disponível"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 p-0 hover:bg-gray-100">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xs max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Detalhes - {carga.romaneio}</DialogTitle>
                    </DialogHeader>
                    {/* Conteúdo de Detalhes (simplificado para mobile) */}
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {cargaSelecionada && (
        <ModalInformarRacao
          isOpen={showModalRacao}
          onClose={() => setShowModalRacao(false)}
          carga={cargaSelecionada}
          onConfirm={handleConfirmarRacao}
        />
      )}
    </div>
  );
};

export default TabelaLogistica;
