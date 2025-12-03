import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    (set, get) => ({
      // Estado das cargas
      cargas: [],
      cargasKanban: [],
      
      // Estado da aplicação
      currentView: 'preparacao',
      cicloAtual: null,
      
      // Configurações
      tiposFrota: [
        { id: 'propria', label: 'Frota Própria', icon: '🚛', color: 'blue' },
        { id: 'contratada', label: 'Frota Contratada', icon: '🚚', color: 'green' },
        { id: 'retira', label: 'Retira', icon: '👷', color: 'orange' }
      ],
      
      statusKanban: [
        { id: 'aguardando-entrada', label: 'Aguardando Entrada', icon: '🕐' },
        { id: 'aguardando-carregamento', label: 'Aguardando Carregamento', icon: '🚛' },
        { id: 'carregando', label: 'Carregando', icon: '🏗️' },
        { id: 'aguardando-racao', label: 'Aguardando Ração', icon: '⏳' },
        { id: 'carregada', label: 'Carregada', icon: '✅' },
        { id: 'faturado', label: 'Faturado', icon: '💰' }
      ],
      
      // Configurações de Rações
      racoesCadastradas: [
        { id: 'r1', nome: 'Ração Frango Corte 1-21 dias', codigo: 'RFC-001' },
        { id: 'r2', nome: 'Ração Frango Corte 22-35 dias', codigo: 'RFC-002' },
        { id: 'r3', nome: 'Ração Frango Corte 36+ dias', codigo: 'RFC-003' },
        { id: 'r4', nome: 'Ração Postura Fase 1', codigo: 'RPO-001' },
        { id: 'r5', nome: 'Ração Postura Fase 2', codigo: 'RPO-002' },
        { id: 'r6', nome: 'Ração Suínos Inicial', codigo: 'RSU-001' },
        { id: 'r7', nome: 'Ração Suínos Crescimento', codigo: 'RSU-002' },
        { id: 'r8', nome: 'Ração Suínos Terminação', codigo: 'RSU-003' },
      ],
      
      statusFabricacao: [
        { id: 'aguardando', label: 'Aguardando Fabricação', color: 'gray', icon: '⏳' },
        { id: 'fabricando', label: 'Fabricando', color: 'blue', icon: '🏭' },
        { id: 'ensacando', label: 'Ensacando', color: 'purple', icon: '📦' },
        { id: 'disponivel', label: 'Disponível', color: 'green', icon: '✅' },
        { id: 'atrasado', label: 'Atrasado', color: 'red', icon: '⚠️' },
        { id: 'cancelado', label: 'Cancelado', color: 'gray', icon: '❌' },
      ],
      
      demandasRacao: [],
      
      // Actions para cargas
      setCargas: (cargas) => set({ cargas }),
      
      addCarga: (carga) => set((state) => ({
        cargas: [...state.cargas, { 
          ...carga, 
          id: Date.now().toString()
        }]
      })),
      
      updateCarga: (id, updates) => set((state) => ({
        cargas: state.cargas.map(carga => 
          carga.id.toString() === id.toString() ? { ...carga, ...updates } : carga
        )
      })),
      
      removeCarga: (id) => set((state) => ({
        cargas: state.cargas.filter(carga => carga.id.toString() !== id.toString())
      })),
      
      reorderCargas: (startIndex, endIndex) => set((state) => {
        const result = Array.from(state.cargas);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        
        const updatedCargas = result.map((carga, index) => ({
          ...carga,
          sequencia: index + 1
        }));
        
        return { cargas: updatedCargas };
      }),
      
      // Actions para Kanban
      setCargasKanban: (cargas) => set({ cargasKanban: cargas }),
      
      // ========== ATUALIZADO: Enviar para Kanban com lógica de tipo de frota ==========
      enviarParaKanban: () => set((state) => {
        const cargasComHistorico = state.cargas.map(carga => {
          // FROTA PRÓPRIA vai direto para "aguardando-carregamento"
          // RETIRA e CONTRATADA vão para "aguardando-entrada"
          const statusInicial = carga.tipoFrota === 'propria' 
            ? 'aguardando-carregamento' 
            : 'aguardando-entrada';
          
          return {
            ...carga,
            id: carga.id.toString(),
            status: statusInicial,
            historico: [{
              status: statusInicial,
              timestamp: new Date().toISOString(),
              usuario: 'Sistema'
            }],
            tempoTotal: 0,
            temposPorStatus: {}
          };
        });
        
        return { 
          cargasKanban: cargasComHistorico,
          currentView: 'kanban'
        };
      }),
      
      // Mover carga no Kanban
      moverCargaKanban: (cargaId, novoStatus, dadosRacao = null) => set((state) => {
        const agora = new Date().toISOString();
        
        const cargasAtualizadas = state.cargasKanban.map(carga => {
          if (carga.id.toString() === cargaId.toString()) {
            const ultimoHistorico = carga.historico[carga.historico.length - 1];
            const tempoNoStatusAnterior = new Date(agora) - new Date(ultimoHistorico.timestamp);
            
            const cargaAtualizada = {
              ...carga,
              status: novoStatus,
              historico: [
                ...carga.historico,
                {
                  status: novoStatus,
                  timestamp: agora,
                  usuario: 'Usuário'
                }
              ],
              temposPorStatus: {
                ...carga.temposPorStatus,
                [ultimoHistorico.status]: (carga.temposPorStatus[ultimoHistorico.status] || 0) + tempoNoStatusAnterior
              },
              tempoTotal: (carga.tempoTotal || 0) + tempoNoStatusAnterior
            };
            
            // Se está indo para "aguardando-racao", adicionar dados da ração
            if (novoStatus === 'aguardando-racao' && dadosRacao) {
              cargaAtualizada.racaoNecessaria = dadosRacao;
              cargaAtualizada.statusAnteriorRacao = carga.status; // Guardar status anterior
            }
            
            // Se está saindo de "aguardando-racao", limpar dados e voltar para status anterior
            if (carga.status === 'aguardando-racao' && novoStatus !== 'aguardando-racao') {
              cargaAtualizada.racaoNecessaria = null;
              cargaAtualizada.statusAnteriorRacao = null;
            }
            
            return cargaAtualizada;
          }
          return carga;
        });
        
        // Se está indo para aguardando-ração, criar demanda automaticamente
        if (novoStatus === 'aguardando-racao' && dadosRacao) {
          const carga = state.cargasKanban.find(c => c.id.toString() === cargaId.toString());
          
          const novaDemanda = {
            id: `dem-${Date.now()}`,
            cargaId: cargaId,
            romaneio: carga.romaneio,
            racaoId: dadosRacao.racaoId,
            racaoNome: dadosRacao.racaoNome,
            racaoCodigo: dadosRacao.racaoCodigo,
            quantidadeSacos: dadosRacao.quantidadeSacos,
            observacao: dadosRacao.observacao || '',
            prioridade: dadosRacao.prioridade || 'normal',
            statusFabricacao: 'aguardando',
            statusCargaOrigem: carga.status, // Guardar de onde veio
            criadaEm: new Date().toISOString(),
            historico: [{
              status: 'aguardando',
              timestamp: new Date().toISOString(),
              usuario: 'Sistema'
            }]
          };
          
          return {
            cargasKanban: cargasAtualizadas,
            demandasRacao: [...state.demandasRacao, novaDemanda]
          };
        }
        
        return { cargasKanban: cargasAtualizadas };
      }),
      
      // ========== NOVO: Voltar de aguardando-racao para status anterior ==========
      voltarDeAguardandoRacao: (cargaId) => set((state) => {
        const carga = state.cargasKanban.find(c => c.id.toString() === cargaId.toString());
        if (!carga || carga.status !== 'aguardando-racao') {
          return state;
        }
        
	        // O status de retorno deve ser 'carregando', conforme solicitado
	        const statusRetorno = 'carregando';
        
        return {
	          cargasKanban: state.cargasKanban.map(c => {
	            if (c.id.toString() === cargaId.toString()) {
	              return {
	                ...c,
	                status: statusRetorno,
	                racaoNecessaria: null,
	                statusAnteriorRacao: null,
	                historico: [
	                  ...c.historico,
	                  {
	                    status: statusRetorno,
	                    timestamp: new Date().toISOString(),
	                    usuario: 'Usuário',
	                    observacao: 'Ração disponível'
	                  }
	                ]
	              };
	            }
            return c;
          })
        };
      }),

      updateCargaKanban: (cargaId, updates) => set((state) => ({
        cargasKanban: state.cargasKanban.map(carga =>
          carga.id.toString() === cargaId.toString() ? { ...carga, ...updates } : carga
        )
      })),
      
      removeCargaKanban: (cargaId) => set((state) => ({
        cargasKanban: state.cargasKanban.filter(carga => carga.id.toString() !== cargaId.toString())
      })),
      
      // Actions para Rações
      adicionarDemandaRacao: (demanda) => set((state) => ({
        demandasRacao: [...state.demandasRacao, {
          ...demanda,
          id: `dem-${Date.now()}`,
          criadaEm: new Date().toISOString(),
          statusFabricacao: demanda.statusFabricacao || 'aguardando',
          historico: [{
            status: demanda.statusFabricacao || 'aguardando',
            timestamp: new Date().toISOString(),
            usuario: 'Sistema'
          }]
        }]
      })),
      
      atualizarStatusDemanda: (demandaId, novoStatus, observacao = '') => set((state) => ({
        demandasRacao: state.demandasRacao.map(dem => {
          if (dem.id === demandaId) {
            return {
              ...dem,
              statusFabricacao: novoStatus,
              observacao: observacao || dem.observacao,
              atualizadoEm: new Date().toISOString(),
              historico: [
                ...dem.historico,
                {
                  status: novoStatus,
                  timestamp: new Date().toISOString(),
                  usuario: 'Usuário PCP',
                  observacao
                }
              ]
            };
          }
          return dem;
        })
      })),
      
      removerDemandaRacao: (demandaId) => set((state) => ({
        demandasRacao: state.demandasRacao.filter(dem => dem.id !== demandaId)
      })),
      
      adicionarRacaoCatalogo: (racao) => set((state) => ({
        racoesCadastradas: [...state.racoesCadastradas, {
          ...racao,
          id: `r${state.racoesCadastradas.length + 1}`
        }]
      })),
      
      // Actions para navegação
      setCurrentView: (view) => set({ currentView: view }),
      
      // Actions para ciclo
      iniciarNovoCiclo: () => set({
        cicloAtual: {
          inicio: new Date().toISOString(),
          fim: null,
          cargas: []
        }
      }),
      
      finalizarCiclo: () => set((state) => ({
        cicloAtual: {
          ...state.cicloAtual,
          fim: new Date().toISOString(),
          cargas: state.cargasKanban
        }
      })),

      resetarSistema: () => set({
        cargas: [],
        cargasKanban: [],
        demandasRacao: [],
        currentView: 'preparacao',
        cicloAtual: null
      }),

      carregarDadosExemplo: () => set({
        cargas: [
          {
            id: '1',
            romaneio: 'ROM-001',
            peso: 25000,
            descricao: 'Carga ração frango - Frota Própria',
            tipoFrota: 'propria',
            sequencia: 1,
            status: 'preparacao'
          },
          {
            id: '2', 
            romaneio: 'ROM-002',
            peso: 30000,
            descricao: 'Carga ração postura - Retira',
            tipoFrota: 'retira',
            sequencia: 2,
            status: 'preparacao'
          },
          {
            id: '3', 
            romaneio: 'ROM-003',
            peso: 20000,
            descricao: 'Carga ração suínos - Contratada',
            tipoFrota: 'contratada',
            sequencia: 3,
            status: 'preparacao'
          }
        ]
      })
    }),
    {
      name: 'sistema-logistico-storage',
    }
  )
);

export default useStore;