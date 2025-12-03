import React from 'react';
import { motion } from 'framer-motion';
import { Package, Kanban, BarChart3, Settings, Clock, Calendar, LayoutDashboard, Factory, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import useStore from '../store/useStore';
import { useIsMobile } from '@/hooks/use-mobile';

const Layout = ({ children }) => {
  const { currentView, setCurrentView, cicloAtual } = useStore();
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  
  const menuItems = [
    {
      id: 'preparacao',
      label: 'Preparação',
      icon: Package,
      description: 'Importar e sequenciar cargas'
    },
    {
      id: 'kanban',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Acompanhamento logístico'
    },
    {
      id: 'pcp',
      label: 'PCP',
      icon: Factory,
      description: 'Gerenciamento de rações'
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: BarChart3,
      description: 'Indicadores e análises'
    }
  ];
  
  const getCicloAtual = () => {
    const agora = new Date();
    const hoje18h = new Date();
    hoje18h.setHours(18, 0, 0, 0);
    
    const ontem18h = new Date(hoje18h);
    ontem18h.setDate(ontem18h.getDate() - 1);
    
    const amanha18h = new Date(hoje18h);
    amanha18h.setDate(amanha18h.getDate() + 1);
    
    let inicioAtual, fimAtual;
    
    if (agora >= hoje18h) {
      inicioAtual = hoje18h;
      fimAtual = amanha18h;
    } else {
      inicioAtual = ontem18h;
      fimAtual = hoje18h;
    }
    
    return {
      inicio: inicioAtual,
      fim: fimAtual,
      formatado: `${inicioAtual.toLocaleDateString('pt-BR')} 18h - ${fimAtual.toLocaleDateString('pt-BR')} 18h`
    };
  };
  
  const ciclo = getCicloAtual();
  
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Sidebar - Desktop */}
      {!isMobile ? (
        <motion.div 
          className={`bg-white shadow-xl border-r border-gray-100 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}
          initial={{ width: 288 }}
          animate={{ width: isSidebarCollapsed ? 80 : 288 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header da Sidebar */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {!isSidebarCollapsed && (
              <h1 className="text-xl font-bold text-gray-900">
                Nutrane
              </h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:bg-gray-100"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Informações do Ciclo */}
          {!isSidebarCollapsed && (
            <Card className="m-4 p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Programação Atual
                </span>
              </div>
              <p className="text-xs text-blue-700">
                {ciclo.formatado}
              </p>
            </Card>
          )}
          
          {/* Menu de Navegação */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-auto ${isSidebarCollapsed ? 'p-2' : 'p-4'} ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentView(item.id)}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} w-full`}>
                      <Icon className="h-5 w-5" />
                      {!isSidebarCollapsed && (
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                          <div className={`text-xs ${
                            isActive ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </nav>
          
          {/* Footer da Sidebar */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className={`w-full justify-start text-gray-600 hover:text-gray-900 ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Settings className="h-4 w-4 mr-2" />
              {!isSidebarCollapsed && 'Configurações'}
            </Button>
          </div>
        </motion.div>
      ) : (
        /* Menu Mobile Inferior */
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <nav className="flex justify-around p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setCurrentView(item.id)}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
      
      {/* Conteúdo Principal */}
      <div className={`flex-1 flex flex-col ${isMobile ? 'pb-16' : ''} bg-gray-100 overflow-hidden`}>
        {/* Header Principal */}
        <header className="bg-white shadow-md border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 capitalize">
                {menuItems.find(item => item.id === currentView)?.label}
              </h2>
              <p className="text-gray-600 mt-1 text-sm hidden sm:block">
                {menuItems.find(item => item.id === currentView)?.description}
              </p>
            </div>
            
            {!isMobile && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            )}
          </div>
        </header>
        
        {/* Área de Conteúdo - Adicionando h-full para ocupar 100% da altura restante */}
        <main className="flex-1 p-2 sm:p-6 overflow-y-auto bg-gray-50 h-full">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
