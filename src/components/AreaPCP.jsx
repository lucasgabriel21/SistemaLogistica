import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Factory, Edit, Save, PackageCheck, Clock, 
  AlertTriangle, TrendingUp, Filter, Package 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import useStore from '../store/useStore';

const AreaPCP = () => {
  const { demandasRacao, statusFabricacao, atualizarStatusDemanda, cargasKanban } = useStore();
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [demandaSelecionada, setDemandaSelecionada] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [observacao, setObservacao] = useState('');
  
  const demandasFiltradas = filtroStatus === 'todos'
    ? demandasRacao
    : demandasRacao.filter(d => d.statusFabricacao === filtroStatus);
  
  const handleAtualizarStatus = () => {
    if (!novoStatus) {
      alert('Selecione um status');
      return;
    }
    
    atualizarStatusDemanda(demandaSelecionada.id, novoStatus, observacao);
    setDemandaSelecionada(null);
    setNovoStatus('');
    setObservacao('');
  };
  
  const getStatusInfo = (statusId) => {
    return statusFabricacao.find(s => s.id === statusId) || statusFabricacao[0];
  };
  
  const getPrioridadeCor = (prioridade) => {
    const cores = {
      baixa: 'bg-green-100 text-green-800 border-green-300',
      normal: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      alta: 'bg-red-100 text-red-800 border-red-300'
    };
    return cores[prioridade] || cores.normal;
  };
  
  const getStatusColor = (statusId) => {
    const statusInfo = getStatusInfo(statusId);
    const cores = {
      green: '#10B981',
      blue: '#3B82F6',
      purple: '#8B5CF6',
      red: '#EF4444',
      gray: '#6B7280'
    };
    return cores[statusInfo.color] || cores.gray;
  };
  
  // Estatísticas
  const stats = {
    total: demandasRacao.length,
    aguardando: demandasRacao.filter(d => d.statusFabricacao === 'aguardando').length,
    fabricando: demandasRacao.filter(d => d.statusFabricacao === 'fabricando').length,
    ensacando: demandasRacao.filter(d => d.statusFabricacao === 'ensacando').length,
    disponivel: demandasRacao.filter(d => d.statusFabricacao === 'disponivel').length,
    atrasado: demandasRacao.filter(d => d.statusFabricacao === 'atrasado').length,
  };
  
  return (
    <div className="space-y-4">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-yellow-700 mb-1">⏳ Aguardando</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.aguardando}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-blue-700 mb-1">🏭 Fabricando</p>
              <p className="text-2xl font-bold text-blue-600">{stats.fabricando}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-purple-700 mb-1">📦 Ensacando</p>
              <p className="text-2xl font-bold text-purple-600">{stats.ensacando}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-green-700 mb-1">✅ Disponível</p>
              <p className="text-2xl font-bold text-green-600">{stats.disponivel}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-red-700 mb-1">⚠️ Atrasado</p>
              <p className="text-2xl font-bold text-red-600">{stats.atrasado}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Demandas de Ração
            </CardTitle>
            <Badge variant="secondary" className="text-sm">
              {demandasFiltradas.length} {demandasFiltradas.length === 1 ? 'demanda' : 'demandas'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Filtrar por Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Todos os Status</span>
                    </div>
                  </SelectItem>
                  {statusFabricacao.map(status => (
                    <SelectItem key={status.id} value={status.id}>
                      <div className="flex items-center gap-2">
                        <span>{status.icon}</span>
                        <span>{status.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de Demandas */}
      <div className="grid gap-3">
        <AnimatePresence>
          {demandasFiltradas.map(demanda => {
            const statusInfo = getStatusInfo(demanda.statusFabricacao);
            const tempoDecorrido = Math.floor(
              (new Date() - new Date(demanda.criadaEm)) / (1000 * 60)
            );
            
            const carga = cargasKanban.find(c => c.id === demanda.cargaId);
            
            return (
              <motion.div
                key={demanda.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                      <div className="flex-1">
                        {/* Header da Demanda */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="outline" className="font-mono text-sm">
                            {demanda.romaneio}
                          </Badge>
                          <Badge className={`${getPrioridadeCor(demanda.prioridade)} border`}>
                            {demanda.prioridade === 'alta' ? '🔴' : demanda.prioridade === 'baixa' ? '🟢' : '🟡'} 
                            {demanda.prioridade.toUpperCase()}
                          </Badge>
                          <Badge 
                            className="text-white border-0"
                            style={{ backgroundColor: getStatusColor(demanda.statusFabricacao) }}
                          >
                            {statusInfo.icon} {statusInfo.label}
                          </Badge>
                        </div>
                        
                        {/* Info da Ração */}
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                          {demanda.racaoNome}
                        </h3>
                        
                        {/* Detalhes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span><strong>Quantidade:</strong> {demanda.quantidadeSacos} sacos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span><strong>Tempo:</strong> {tempoDecorrido}min atrás</span>
                          </div>
                          {carga && (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-gray-400" />
                              <span><strong>Status Carga:</strong> {carga.status.replace('-', ' ')}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Observação */}
                        {demanda.observacao && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                            <p className="text-sm text-yellow-900">
                              <strong>💬 Observação:</strong> {demanda.observacao}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Botão Atualizar */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDemandaSelecionada(demanda);
                          setNovoStatus(demanda.statusFabricacao);
                        }}
                        className="shrink-0"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Atualizar Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Estado Vazio */}
        {demandasFiltradas.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <PackageCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma demanda de ração
                </h3>
                <p className="text-sm">
                  {filtroStatus === 'todos' 
                    ? 'Não há demandas de ração no momento'
                    : `Não há demandas com status "${getStatusInfo(filtroStatus).label}"`
                  }
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      
      {/* Modal de Atualização */}
      <Dialog 
        open={!!demandaSelecionada} 
        onOpenChange={() => {
          setDemandaSelecionada(null);
          setNovoStatus('');
          setObservacao('');
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Atualizar Status de Fabricação</DialogTitle>
            <DialogDescription>
              {demandaSelecionada?.racaoNome} - {demandaSelecionada?.quantidadeSacos} sacos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Status Atual */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <Label className="text-xs text-gray-600 mb-1 block">Status Atual</Label>
              <Badge 
                className="text-white"
                style={{ backgroundColor: getStatusColor(demandaSelecionada?.statusFabricacao) }}
              >
                {getStatusInfo(demandaSelecionada?.statusFabricacao).icon} {getStatusInfo(demandaSelecionada?.statusFabricacao).label}
              </Badge>
            </div>
            
            {/* Novo Status */}
            <div>
              <Label>Novo Status *</Label>
              <Select value={novoStatus} onValueChange={setNovoStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o novo status" />
                </SelectTrigger>
                <SelectContent>
                  {statusFabricacao.map(status => (
                    <SelectItem key={status.id} value={status.id}>
                      <div className="flex items-center gap-2">
                        <span>{status.icon}</span>
                        <span>{status.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Observação */}
            <div>
              <Label>Observação (opcional)</Label>
              <Textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Informações sobre o status, previsão, problemas..."
                className="mt-1"
                rows={3}
              />
            </div>
            
            {/* Histórico */}
            {demandaSelecionada?.historico && demandaSelecionada.historico.length > 0 && (
              <div>
                <Label className="mb-2 block">Histórico de Movimentações</Label>
                <ScrollArea className="h-48 border rounded-lg p-3">
                  <div className="space-y-2">
                    {demandaSelecionada.historico.slice().reverse().map((hist, idx) => {
                      const statusInfo = getStatusInfo(hist.status);
                      const isUltimo = idx === 0;
                      
                      return (
                        <div 
                          key={idx} 
                          className={`text-xs p-3 rounded-lg ${
                            isUltimo ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{statusInfo.icon}</span>
                              <span className="font-medium text-gray-900">{statusInfo.label}</span>
                              {isUltimo && (
                                <Badge variant="secondary" className="text-xs">Atual</Badge>
                              )}
                            </div>
                            <span className="text-gray-500">
                              {new Date(hist.timestamp).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs">
                            Por: {hist.usuario}
                          </p>
                          {hist.observacao && (
                            <p className="text-gray-700 mt-2 italic bg-white p-2 rounded">
                              💬 {hist.observacao}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDemandaSelecionada(null);
                setNovoStatus('');
                setObservacao('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAtualizarStatus} 
              disabled={!novoStatus || novoStatus === demandaSelecionada?.statusFabricacao}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AreaPCP;