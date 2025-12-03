// Serviço de API Mock para simular comunicação com backend
import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Tratamento de erros globais
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Simulação de dados para desenvolvimento
const mockData = {
  cargas: [
    {
      id: 1,
      romaneio: 'CARGA-001',
      peso: 1500,
      descricao: 'Rota São Paulo - Rio de Janeiro',
      tipoFrota: 'propria',
      sequencia: 1,
      status: 'aguardando-entrada',
      criadoEm: new Date().toISOString(),
      historico: [
        {
          status: 'aguardando-entrada',
          timestamp: new Date().toISOString(),
          usuario: 'Sistema'
        }
      ],
      temposPorStatus: {}
    },
    {
      id: 2,
      romaneio: 'CARGA-002',
      peso: 2000,
      descricao: 'Rota Belo Horizonte - Salvador',
      tipoFrota: 'contratada',
      sequencia: 2,
      status: 'carregando',
      criadoEm: new Date().toISOString(),
      historico: [
        {
          status: 'aguardando-entrada',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          usuario: 'Sistema'
        },
        {
          status: 'carregando',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          usuario: 'João Silva'
        }
      ],
      temposPorStatus: {
        'aguardando-entrada': 60 * 60 * 1000 // 1 hora em ms
      }
    }
  ],
  usuarios: [
    { id: 1, nome: 'João Silva', email: 'joao@empresa.com', role: 'operador' },
    { id: 2, nome: 'Maria Santos', email: 'maria@empresa.com', role: 'supervisor' }
  ]
};

// Função para simular delay de rede
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Serviços da API
export const apiService = {
  // Cargas
  cargas: {
    // Listar todas as cargas
    listar: async (filtros = {}) => {
      await delay();
      
      // Simular filtros
      let cargas = [...mockData.cargas];
      
      if (filtros.status) {
        cargas = cargas.filter(carga => carga.status === filtros.status);
      }
      
      if (filtros.tipoFrota) {
        cargas = cargas.filter(carga => carga.tipoFrota === filtros.tipoFrota);
      }
      
      return {
        success: true,
        data: cargas,
        total: cargas.length
      };
    },
    
    // Criar nova carga
    criar: async (dadosCarga) => {
      await delay();
      
      const novaCarga = {
        ...dadosCarga,
        id: Date.now(),
        criadoEm: new Date().toISOString(),
        status: 'preparacao',
        historico: []
      };
      
      mockData.cargas.push(novaCarga);
      
      return {
        success: true,
        data: novaCarga,
        message: 'Carga criada com sucesso'
      };
    },
    
    // Atualizar carga
    atualizar: async (id, dadosAtualizacao) => {
      await delay();
      
      const index = mockData.cargas.findIndex(carga => carga.id === id);
      if (index === -1) {
        throw new Error('Carga não encontrada');
      }
      
      mockData.cargas[index] = {
        ...mockData.cargas[index],
        ...dadosAtualizacao,
        atualizadoEm: new Date().toISOString()
      };
      
      return {
        success: true,
        data: mockData.cargas[index],
        message: 'Carga atualizada com sucesso'
      };
    },
    
    // Mover carga no Kanban
    moverStatus: async (id, novoStatus, usuario = 'Usuário') => {
      await delay();
      
      const index = mockData.cargas.findIndex(carga => carga.id === id);
      if (index === -1) {
        throw new Error('Carga não encontrada');
      }
      
      const carga = mockData.cargas[index];
      const agora = new Date().toISOString();
      
      // Calcular tempo no status anterior
      if (carga.historico.length > 0) {
        const ultimoHistorico = carga.historico[carga.historico.length - 1];
        const tempoNoStatus = new Date(agora) - new Date(ultimoHistorico.timestamp);
        
        carga.temposPorStatus = {
          ...carga.temposPorStatus,
          [ultimoHistorico.status]: (carga.temposPorStatus[ultimoHistorico.status] || 0) + tempoNoStatus
        };
      }
      
      // Adicionar novo histórico
      carga.historico.push({
        status: novoStatus,
        timestamp: agora,
        usuario
      });
      
      carga.status = novoStatus;
      carga.atualizadoEm = agora;
      
      return {
        success: true,
        data: carga,
        message: 'Status atualizado com sucesso'
      };
    },
    
    // Importar cargas de planilha
    importarPlanilha: async (dadosCargas) => {
      await delay(1000); // Simular processamento mais longo
      
      const cargasImportadas = dadosCargas.map((dados, index) => ({
        id: Date.now() + index,
        ...dados,
        criadoEm: new Date().toISOString(),
        status: 'preparacao',
        historico: []
      }));
      
      mockData.cargas.push(...cargasImportadas);
      
      return {
        success: true,
        data: cargasImportadas,
        message: `${cargasImportadas.length} cargas importadas com sucesso`
      };
    },
    
    // Enviar cargas para Kanban
    enviarParaKanban: async (idsCargas) => {
      await delay();
      
      const cargasEnviadas = mockData.cargas.filter(carga => 
        idsCargas.includes(carga.id)
      ).map(carga => ({
        ...carga,
        status: 'aguardando-entrada',
        historico: [
          ...carga.historico,
          {
            status: 'aguardando-entrada',
            timestamp: new Date().toISOString(),
            usuario: 'Sistema'
          }
        ]
      }));
      
      return {
        success: true,
        data: cargasEnviadas,
        message: 'Cargas enviadas para o Kanban'
      };
    }
  },
  
  // Relatórios
  relatorios: {
    // Gerar relatório de produtividade
    produtividade: async (periodo = 'hoje') => {
      await delay();
      
      // Simular dados de relatório
      const dados = {
        periodo,
        totalCargas: mockData.cargas.length,
        cargasFinalizadas: mockData.cargas.filter(c => c.status === 'faturado').length,
        tempoMedio: 120, // minutos
        eficiencia: 85, // percentual
        distribuicaoStatus: mockData.cargas.reduce((acc, carga) => {
          acc[carga.status] = (acc[carga.status] || 0) + 1;
          return acc;
        }, {}),
        geradoEm: new Date().toISOString()
      };
      
      return {
        success: true,
        data: dados
      };
    },
    
    // Exportar relatório
    exportar: async (formato = 'pdf', dados) => {
      await delay(2000); // Simular geração de arquivo
      
      return {
        success: true,
        data: {
          url: `https://exemplo.com/relatorio.${formato}`,
          formato,
          tamanho: '2.5MB'
        },
        message: 'Relatório exportado com sucesso'
      };
    }
  },
  
  // Configurações
  configuracoes: {
    // Obter configurações do sistema
    obter: async () => {
      await delay();
      
      return {
        success: true,
        data: {
          cicloOperacional: {
            inicio: '18:00',
            fim: '18:00'
          },
          tiposFretas: [
            { id: 'propria', label: 'Frota Própria', cor: 'blue' },
            { id: 'contratada', label: 'Frota Contratada', cor: 'green' },
            { id: 'retira', label: 'Retira', cor: 'orange' }
          ],
          statusKanban: [
            { id: 'aguardando-entrada', label: 'Aguardando Entrada' },
            { id: 'aguardando-carregamento', label: 'Aguardando Carregamento' },
            { id: 'aguardando-racao', label: 'Aguardando Ração / Produção' },
            { id: 'carregando', label: 'Carregando' },
            { id: 'carregada', label: 'Carregada' },
            { id: 'faturado', label: 'Faturado / Liberado' }
          ]
        }
      };
    }
  }
};

// Função para verificar se está em modo desenvolvimento
export const isDevelopment = process.env.NODE_ENV === 'development';

// Função para usar dados mock em desenvolvimento
export const useMockData = () => {
  return isDevelopment && !process.env.REACT_APP_API_URL;
};

export default api;
