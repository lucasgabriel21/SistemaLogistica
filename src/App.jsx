import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import PreparacaoCargas from './components/PreparacaoCargas';
import KanbanLogistico from './components/KanbanLogistico';
import RelatoriosIndicadores from './components/RelatoriosIndicadores';
import AreaPCP from './components/AreaPCP'; // NOVO
import useStore from './store/useStore';
import './App.css';

function App() {
  const { currentView } = useStore();
  
  const renderCurrentView = () => {
    switch (currentView) {
      case 'preparacao':
        return <PreparacaoCargas />;
      case 'kanban':
        return <KanbanLogistico />;
      case 'pcp':
        return <AreaPCP />; // NOVO
      case 'relatorios':
        return <RelatoriosIndicadores />;
      default:
        return <PreparacaoCargas />;
    }
  };
  
  return (
    <div className="App">
      <Layout>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </div>
  );
}

export default App;