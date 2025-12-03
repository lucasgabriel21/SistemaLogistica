import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Clock, Package, Truck, Download, Filter, Calendar, AlertTriangle, CheckCircle, Timer, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import useStore from '../store/useStore';

const RelatoriosIndicadores = () => {
  const { cargasKanban, statusKanban, tiposFrota } = useStore();
  const [filtroTipoFrota, setFiltroTipoFrota] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [periodoSelecionado, setPeriodoSelecionado] = useState('hoje');
  
  // Cores para os gráficos
  const CORES = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  
  // Cores fixas para KPIs (Tailwind não suporta cores dinâmicas)
  const CORES_KPI = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-100' },
    green: { text: 'text-green-600', bg: 'bg-green-100' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-100' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-100' }
  };

  // Dados processados para os relatórios
  const dadosProcessados = useMemo(() => {
    let cargasFiltradas = [...cargasKanban];
    
    // Filtrar por tipo de frota
    if (filtroTipoFrota !== 'todos') {
      cargasFiltradas = cargasFiltradas.filter(carga => carga.tipoFrota === filtroTipoFrota);
    }
    
    // Filtrar por status
    if (filtroStatus !== 'todos') {
      cargasFiltradas = cargasFiltradas.filter(carga => carga.status === filtroStatus);
    }
    
    // Calcular métricas
    const totalCargas = cargasFiltradas.length;
    const cargasCarregadas = cargasFiltradas.filter(c => c.status === 'carregada').length;
    const cargasFaturadas = cargasFiltradas.filter(c => c.status === 'faturado').length;
    const cargasEmAndamento = cargasFiltradas.filter(c => !['carregada', 'faturado'].includes(c.status)).length;
    
    // Distribuição por status
    const distribuicaoStatus = statusKanban.map(status => ({
      name: status.label,
      value: cargasFiltradas.filter(c => c.status === status.id).length,
      icon: status.icon
    }));
    
    // Distribuição por tipo de frota
    const distribuicaoFrota = tiposFrota.map(tipo => ({
      name: tipo.label,
      value: cargasFiltradas.filter(c => c.tipoFrota === tipo.id).length,
      icon: tipo.icon,
      color: tipo.color
    }));

    // Tempo médio por status (baseado no histórico real)
    const tempoMedioPorStatus = statusKanban.map(status => {
      const cargasNoStatus = cargasFiltradas.filter(carga => 
        carga.historico?.some(h => h.status === status.id)
      );

      if (cargasNoStatus.length === 0) {
        return {
          name: status.label,
          tempo: 0,
          icon: status.icon
        };
      }

      // Calcular tempo médio no status
      const tempoTotal = cargasNoStatus.reduce((acc, carga) => {
        const eventosStatus = carga.historico?.filter(h => h.status === status.id) || [];
        let tempoNoStatus = 0;
        
        eventosStatus.forEach(evento => {
          const proximoEvento = carga.historico?.find(h => 
            new Date(h.timestamp) > new Date(evento.timestamp)
          );
          
          if (proximoEvento) {
            tempoNoStatus += new Date(proximoEvento.timestamp) - new Date(evento.timestamp);
          }
        });
        
        return acc + tempoNoStatus;
      }, 0);

      const tempoMedioMinutos = Math.round(tempoTotal / (cargasNoStatus.length * 1000 * 60));
      
      return {
        name: status.label,
        tempo: tempoMedioMinutos,
        icon: status.icon
      };
    });

    // Tempo total até faturamento
    const tempoAteFaturamento = cargasFiltradas
      .filter(carga => carga.status === 'faturado' && carga.historico?.length >= 2)
      .map(carga => {
        const primeiroEvento = carga.historico[0];
        const ultimoEvento = carga.historico[carga.historico.length - 1];
        return new Date(ultimoEvento.timestamp) - new Date(primeiroEvento.timestamp);
      });

    const tempoMedioFaturamento = tempoAteFaturamento.length > 0 
      ? Math.round(tempoAteFaturamento.reduce((a, b) => a + b, 0) / tempoAteFaturamento.length / (1000 * 60))
      : 0;
    
    // Produtividade por ciclo 18h-18h
    const produtividadeCiclo = (() => {
      const agora = new Date();
      const ciclos = [];
      
      // Últimos 7 ciclos
      for (let i = 6; i >= 0; i--) {
        const inicioCiclo = new Date(agora);
        inicioCiclo.setDate(inicioCiclo.getDate() - i);
        inicioCiclo.setHours(18, 0, 0, 0);
        
        const fimCiclo = new Date(inicioCiclo);
        fimCiclo.setDate(fimCiclo.getDate() + 1);
        
        const cargasNoCiclo = cargasFiltradas.filter(carga => {
          const dataCriacao = new Date(carga.criadoEm);
          return dataCriacao >= inicioCiclo && dataCriacao < fimCiclo;
        });
        
        const totalPeso = cargasNoCiclo.reduce((acc, carga) => acc + carga.peso, 0);
        
        ciclos.push({
          ciclo: inicioCiclo.toLocaleDateString('pt-BR'),
          cargas: cargasNoCiclo.length,
          toneladas: totalPeso / 1000,
          carregadas: cargasNoCiclo.filter(c => c.status === 'carregada').length,
          faturadas: cargasNoCiclo.filter(c => c.status === 'faturado').length
        });
      }
      
      return ciclos;
    })();

    // Evolução - Métricas por tonelada por ciclo
    const evolucaoPorCiclo = (() => {
      const agora = new Date();
      const ciclos = [];
      
      // Últimos 7 ciclos
      for (let i = 6; i >= 0; i--) {
        const inicioCiclo = new Date(agora);
        inicioCiclo.setDate(inicioCiclo.getDate() - i);
        inicioCiclo.setHours(18, 0, 0, 0);
        
        const fimCiclo = new Date(inicioCiclo);
        fimCiclo.setDate(fimCiclo.getDate() + 1);
        
        const cargasNoCiclo = cargasFiltradas.filter(carga => {
          const dataCriacao = new Date(carga.criadoEm);
          return dataCriacao >= inicioCiclo && dataCriacao < fimCiclo;
        });
        
        const cargasFaturadas = cargasNoCiclo.filter(c => c.status === 'faturado');
        const totalToneladas = cargasFaturadas.reduce((acc, carga) => acc + (carga.peso / 1000), 0);
        
        // Calcular tempo médio por tonelada
        const temposPorTonelada = cargasFaturadas.map(carga => {
          if (carga.historico?.length >= 2) {
            const primeiroEvento = carga.historico[0];
            const ultimoEvento = carga.historico[carga.historico.length - 1];
            const tempoTotal = new Date(ultimoEvento.timestamp) - new Date(primeiroEvento.timestamp);
            return tempoTotal / (carga.peso / 1000); // ms por tonelada
          }
          return 0;
        }).filter(t => t > 0);
        
        const tempoMedioPorTonelada = temposPorTonelada.length > 0
          ? Math.round(temposPorTonelada.reduce((a, b) => a + b, 0) / temposPorTonelada.length / (1000 * 60)) // minutos por tonelada
          : 0;
        
        ciclos.push({
          ciclo: inicioCiclo.toLocaleDateString('pt-BR').slice(0, 5), // "22/10"
          toneladas: Math.round(totalToneladas * 10) / 10, // 1 casa decimal
          tempoPorTonelada: tempoMedioPorTonelada,
          eficiencia: totalToneladas > 0 ? Math.round((totalToneladas / 50) * 100) : 0 // meta de 50 ton/ciclo
        });
      }
      
      return ciclos;
    })();
    
    return {
      totalCargas,
      cargasCarregadas,
      cargasFaturadas,
      cargasEmAndamento,
      distribuicaoStatus,
      distribuicaoFrota,
      tempoMedioPorStatus,
      tempoMedioFaturamento,
      produtividadeCiclo,
      evolucaoPorCiclo,
      percentualConcluidas: totalCargas > 0 ? 
        Math.round(((cargasCarregadas + cargasFaturadas) / totalCargas) * 100) : 0,
      tempoMedioTotal: tempoMedioFaturamento
    };
  }, [cargasKanban, filtroTipoFrota, filtroStatus, statusKanban, tiposFrota]);
  
  // Função para exportar relatório
  const exportarRelatorio = (formato) => {
    // Implementação da exportação seria feita aqui
    console.log(`Exportando relatório em formato ${formato}`);
  };
  
  // Componente de KPI
  const KPICard = ({ titulo, valor, icone: Icone, cor, descricao, tendencia }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{titulo}</p>
            <p className={`text-3xl font-bold ${CORES_KPI[cor].text} mt-2`}>{valor}</p>
            {descricao && (
              <p className="text-sm text-gray-500 mt-1">{descricao}</p>
            )}
          </div>
          <div className={`p-3 ${CORES_KPI[cor].bg} rounded-full`}>
            <Icone className={`h-6 w-6 ${CORES_KPI[cor].text}`} />
          </div>
        </div>
        {tendencia && (
          <div className="flex items-center mt-4">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">{tendencia}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Período
              </label>
              <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="ontem">Ontem</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="mes">Este Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tipo de Frota
              </label>
              <Select value={filtroTipoFrota} onValueChange={setFiltroTipoFrota}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  {tiposFrota.map(tipo => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      <div className="flex items-center gap-2">
                        <span>{tipo.icon}</span>
                        <span>{tipo.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  {statusKanban.map(status => (
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
            
            <div className="flex items-end">
              <Button onClick={() => exportarRelatorio('pdf')} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          titulo="Total de Cargas"
          valor={dadosProcessados.totalCargas}
          icone={Package}
          cor="blue"
          descricao="No período selecionado"
        />
        
        <KPICard
          titulo="Cargas Carregadas"
          valor={dadosProcessados.cargasCarregadas}
          icone={CheckCircle}
          cor="green"
          descricao={`${dadosProcessados.percentualConcluidas}% do total`}
        />
        
        <KPICard
          titulo="Em Andamento"
          valor={dadosProcessados.cargasEmAndamento}
          icone={Timer}
          cor="orange"
          descricao="Aguardando processamento"
        />
        
        <KPICard
          titulo="Tempo Médio"
          valor={`${dadosProcessados.tempoMedioTotal}min`}
          icone={Clock}
          cor="purple"
          descricao="Até faturamento"
        />
      </div>
      
      {/* Tabs com Gráficos */}
      <Tabs defaultValue="distribuicao" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
          <TabsTrigger value="tempos">Tempos</TabsTrigger>
          <TabsTrigger value="produtividade">Produtividade</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
        </TabsList>
        
        {/* Tab Distribuição */}
        <TabsContent value="distribuicao" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Distribuição por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosProcessados.distribuicaoStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {dadosProcessados.distribuicaoStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Distribuição por Tipo de Frota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosProcessados.distribuicaoFrota}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tab Tempos */}
        <TabsContent value="tempos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tempo Médio por Status (minutos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dadosProcessados.tempoMedioPorStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} min`, 'Tempo Médio']} />
                  <Bar dataKey="tempo" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Indicadores de Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Meta de Tempo</h3>
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Atual: {dadosProcessados.tempoMedioTotal}min</span>
                    <span>Meta: 120min</span>
                  </div>
                  <Progress 
                    value={Math.min((120 / Math.max(dadosProcessados.tempoMedioTotal, 1)) * 100, 100)} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-600">
                    {dadosProcessados.tempoMedioTotal <= 120 ? '✅ Meta atingida!' : '⚠️ Acima da meta'}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Eficiência</h3>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-green-600">
                    {dadosProcessados.percentualConcluidas}%
                  </div>
                  <p className="text-sm text-gray-600">
                    Cargas finalizadas
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Tempo até Faturamento</h3>
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-orange-600">
                    {dadosProcessados.tempoMedioFaturamento}min
                  </div>
                  <p className="text-sm text-gray-600">
                    Média por carga
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tab Produtividade */}
        <TabsContent value="produtividade" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Produtividade por Ciclo (18h-18h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dadosProcessados.produtividadeCiclo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ciclo" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="toneladas" fill="#3B82F6" name="Toneladas" />
                  <Bar dataKey="cargas" fill="#10B981" name="Cargas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab Evolução */}
        <TabsContent value="evolucao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Evolução por Ciclo (18h-18h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dadosProcessados.evolucaoPorCiclo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ciclo" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="toneladas" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Toneladas Faturadas"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="tempoPorTonelada" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Minutos por Tonelada"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Estado Vazio */}
      {dadosProcessados.totalCargas === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <BarChart3 className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Nenhum dado para relatório
          </h3>
          <p className="text-gray-500 mb-6">
            Processe algumas cargas no Kanban para gerar relatórios e indicadores
          </p>
          <Button
            onClick={() => useStore.getState().setCurrentView('kanban')}
            variant="outline"
          >
            Ir para Kanban
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default RelatoriosIndicadores;