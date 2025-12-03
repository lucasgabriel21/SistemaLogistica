import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Send, Trash2, Plus, AlertCircle, CheckCircle, Package, GripVertical, Edit, X, ChevronUp, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useStore from '@/store/useStore';

// ============================================
// COMPONENTE CARD DE CARGA
// ============================================
const CardCargaPreparacao = ({ carga, index, onUpdate, onRemove, onMoveUp, onMoveDown, isDragging, dragHandleProps, isFirst, isLast }) => {
  const [editando, setEditando] = useState(false);

  const tiposFrota = [
    { id: 'propria', label: 'Própria', icon: '🚛' },
    { id: 'terceiro', label: 'Terceiro', icon: '🚚' },
    { id: 'Retira', label: 'Retira', icon: '📦' }
  ];

  const getTipoFrotaInfo = (tipo) => tiposFrota.find(t => t.id === tipo) || tiposFrota[0];
  const tipoFrota = getTipoFrotaInfo(carga.tipoFrota);

  const handleUpdate = (field, value) => {
    let finalValue = value;
    if (field === 'peso') {
      finalValue = Number(value);
      if (isNaN(finalValue)) finalValue = 0;
    }
    onUpdate(carga.id, { [field]: finalValue });
  };

  return (
    <div
      className={`relative bg-gradient-to-br from-white to-gray-50 rounded-lg border transition-all ${
        isDragging 
          ? 'shadow-2xl ring-2 ring-blue-400 scale-105 border-blue-300' 
          : 'shadow-sm hover:shadow-md border-gray-200'
      }`}
    >
      <div className="flex items-center gap-2 p-2">
        {/* Drag Handle + Badge + Controles de Posição */}
        <div className="flex items-center gap-1">
          <div 
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing flex items-center"
          >
            <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
          </div>
          
          <div className="flex flex-col items-center gap-0.5 ml-1">
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className={`h-5 w-5 flex items-center justify-center rounded hover:bg-gray-100 transition-colors ${
                isFirst ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title="Mover para cima"
            >
              <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
            </button>
            
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xs shadow-md">
              {carga.sequencia}
            </div>
            
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className={`h-5 w-5 flex items-center justify-center rounded hover:bg-gray-100 transition-colors ${
                isLast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title="Mover para baixo"
            >
              <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Captação */}
        <div className="flex-shrink-0 w-24">
          {editando ? (
            <input
              value={carga.romaneio}
              onChange={(e) => handleUpdate('romaneio', e.target.value)}
              className="h-7 text-xs font-mono border rounded px-2 w-full"
              placeholder="Captação"
            />
          ) : (
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-medium">Captação</p>
              <p className="text-sm font-bold text-blue-900 font-mono truncate">{carga.romaneio}</p>
            </div>
          )}
        </div>

        {/* Descrição */}
        <div className="flex-1 min-w-0 px-2">
          {editando ? (
            <input
              value={carga.descricao}
              onChange={(e) => handleUpdate('descricao', e.target.value)}
              className="h-7 text-xs border rounded px-2 w-full"
              placeholder="Descrição"
            />
          ) : (
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-medium">Descrição</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {carga.descricao || 'Sem descrição'}
              </p>
            </div>
          )}
        </div>

        {/* Peso */}
        <div className="flex-shrink-0 w-20 text-right">
          {editando ? (
            <input
              type="number"
              value={carga.peso}
              onChange={(e) => handleUpdate('peso', e.target.value)}
              className="h-7 text-xs text-right border rounded px-2 w-full"
              placeholder="0"
            />
          ) : (
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-medium">Peso</p>
              <p className="text-sm font-bold text-green-700">
                {carga.peso.toLocaleString('pt-BR')} <span className="text-[10px]">kg</span>
              </p>
            </div>
          )}
        </div>

        {/* Frota */}
        <div className="flex-shrink-0 w-32">
          <p className="text-[10px] text-gray-500 uppercase font-medium mb-0.5">Frota</p>
          <select
            value={carga.tipoFrota}
            onChange={(e) => handleUpdate('tipoFrota', e.target.value)}
            className="h-7 text-xs border rounded px-2 w-full cursor-pointer hover:border-gray-400 transition-colors bg-white"
          >
            {tiposFrota.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.icon} {tipo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Controles */}
        <div className="flex-shrink-0 flex items-center gap-1 pl-2 border-l border-gray-200">
          <button 
            onClick={() => setEditando(!editando)} 
            className="h-7 w-7 rounded hover:bg-blue-50 flex items-center justify-center transition-colors"
            title={editando ? "Cancelar edição" : "Editar"}
          >
            {editando ? (
              <X className="h-3.5 w-3.5 text-blue-600" />
            ) : (
              <Edit className="h-3.5 w-3.5 text-gray-500" />
            )}
          </button>
          <button 
            onClick={() => onRemove(carga.id)} 
            className="h-7 w-7 rounded text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
            title="Remover"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const PreparacaoCargas = () => {
  const { 
    cargas, 
    setCargas, 
    addCarga, 
    reorderCargas,
    enviarParaKanban,
    updateCarga,
    removeCarga
  } = useStore();
  
  const [arquivo, setArquivo] = useState(null);
  const [carregandoArquivo, setCarregandoArquivo] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);
  
  const processarArquivo = async (file) => {
    setCarregandoArquivo(true);
    setErro('');
    setSucesso('');
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        throw new Error('A planilha está vazia ou não foi possível ler os dados');
      }
      
      const primeiraLinha = jsonData[0] || {};
      const colunasEncontradas = Object.keys(primeiraLinha);
      
      const encontrarColuna = (keywords) => {
        return colunasEncontradas.find(col => 
          keywords.some(keyword => 
            col.toUpperCase().includes(keyword.toUpperCase())
          )
        );
      };
      
      const colunaRomaneio = encontrarColuna(['CAPTAÇÃO', 'CAPTACAO', 'ROMANEIO', 'NUMERO', 'NÚMERO']);
      const colunaPeso = encontrarColuna(['PESO', 'KG', 'QUILOS', 'LIQUIDO', 'LÍQUIDO']);
      const colunaDescricao = encontrarColuna(['DESCRIÇÃO', 'DESCRICAO', 'DESC', 'PRODUTO', 'ITEM']);
      
      if (!colunaRomaneio) {
        throw new Error('Não foi possível identificar a coluna de Romaneio/Captação.');
      }
      
      if (!colunaPeso) {
        throw new Error('Não foi possível identificar a coluna de Peso.');
      }
      
      const cargasProcessadas = jsonData
        .map((linha, index) => {
          const romaneio = linha[colunaRomaneio];
          const peso = linha[colunaPeso];
          const descricao = colunaDescricao ? linha[colunaDescricao] : '';
          
          return { linha, index, romaneio, peso, descricao };
        })
        .filter(({ romaneio, peso }) => {
          const romaneioStr = String(romaneio || '').trim();
          const pesoNum = Number(String(peso || '0').replace(/[^\d.,]/g, '').replace(',', '.'));
          
          const isValid = (
            romaneioStr && 
            romaneioStr.toUpperCase() !== 'TOTAL' && 
            !romaneioStr.toUpperCase().includes('SUBTOTAL') && 
            pesoNum > 0
          );
          
          return isValid;
        })
        .map(({ romaneio, peso, descricao }, arrayIndex) => {
          const romaneioStr = String(romaneio || '').trim();
          const pesoNum = Number(String(peso || '0').replace(/[^\d.,]/g, '').replace(',', '.'));
          const descricaoStr = String(descricao || '').trim() || `Carga ${romaneioStr}`;
          
          return {
            id: Date.now() + arrayIndex,
            romaneio: romaneioStr,
            peso: pesoNum,
            descricao: descricaoStr,
            tipoFrota: 'propria',
            sequencia: arrayIndex + 1,
            status: 'preparacao',
            criadoEm: new Date().toISOString()
          };
        });
      
      if (cargasProcessadas.length === 0) {
        throw new Error('Nenhuma carga válida foi encontrada na planilha. Verifique se há linhas com Romaneio e Peso válidos.');
      }
      
      setCargas(cargasProcessadas);
      setSucesso(`${cargasProcessadas.length} cargas importadas com sucesso!`);
      
    } catch (error) {
      setErro(`Erro ao processar arquivo: ${error.message}`);
    } finally {
      setCarregandoArquivo(false);
    }
  };
  
  const adicionarCargaManual = () => {
    const novaCarga = {
      id: Date.now(),
      romaneio: `CARGA-${String(Date.now()).slice(-4)}`,
      peso: 0,
      descricao: 'Nova carga manual',
      tipoFrota: 'propria',
      sequencia: cargas.length + 1,
      status: 'preparacao',
      criadoEm: new Date().toISOString()
    };
    addCarga(novaCarga);
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newCargas = [...cargas];
      const temp = newCargas[index];
      newCargas[index] = newCargas[index - 1];
      newCargas[index - 1] = temp;
      
      // Reajusta as sequências
      const reordered = newCargas.map((carga, idx) => ({
        ...carga,
        sequencia: idx + 1
      }));
      
      setCargas(reordered);
    }
  };

  const handleMoveDown = (index) => {
    if (index < cargas.length - 1) {
      const newCargas = [...cargas];
      const temp = newCargas[index];
      newCargas[index] = newCargas[index + 1];
      newCargas[index + 1] = temp;
      
      // Reajusta as sequências
      const reordered = newCargas.map((carga, idx) => ({
        ...carga,
        sequencia: idx + 1
      }));
      
      setCargas(reordered);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newCargas = [...cargas];
    const draggedItem = newCargas[draggedIndex];
    newCargas.splice(draggedIndex, 1);
    newCargas.splice(index, 0, draggedItem);

    // Reajusta as sequências
    const reordered = newCargas.map((carga, idx) => ({
      ...carga,
      sequencia: idx + 1
    }));

    setCargas(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  const handleUpdateCarga = (id, updates) => {
    updateCarga(id, updates);
  };
  
  const handleRemoveCarga = (id) => {
    removeCarga(id);
  };
  
  return (
    <div className="space-y-4 w-full h-screen flex flex-col p-4 bg-gray-50">
      {/* Seção de Importação */}
      <div className="shadow-lg rounded-xl border-t-4 border-blue-600 flex-shrink-0 bg-white">
        <div className="p-3 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <Upload className="h-5 w-5 text-blue-600" />
              Preparação de Cargas
            </div>
            {cargas.length > 0 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={adicionarCargaManual}
                  className="h-8 px-3 text-xs border rounded hover:bg-gray-50 flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </button>
                <button 
                  onClick={enviarParaKanban} 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white h-8 px-3 rounded text-xs font-semibold shadow-md flex items-center gap-1 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" /> Enviar ({cargas.length})
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-3 pt-0">
          <div 
            className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all bg-blue-50/30 cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setArquivo(file);
                  processarArquivo(file);
                }
              }}
              className="hidden"
            />
            <FileText className="h-10 w-10 text-blue-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-gray-900">
              {carregandoArquivo ? 'Processando...' : 'Clique para importar planilha'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Arquivos .xlsx, .xls ou .csv
            </p>
          </div>
          
          <AnimatePresence>
            {erro && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2">
                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{erro}</span>
                </div>
              </motion.div>
            )}
            {sucesso && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2">
                <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">{sucesso}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Lista de Cargas */}
      {cargas.length > 0 && (
        <div className="shadow-lg rounded-xl border-t-4 border-green-600 flex-1 min-h-0 overflow-hidden bg-gradient-to-br from-white to-gray-50">
          <div className="p-3 pb-2 bg-white/80 backdrop-blur-sm border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                <Package className="h-5 w-5 text-green-600" />
                Fila de Cargas
                <span className="ml-1 px-2 py-0.5 bg-gray-200 rounded-full text-xs font-bold">{cargas.length}</span>
              </div>
              <p className="text-xs text-gray-500">
                Arraste para reordenar ou use as setas
              </p>
            </div>
          </div>
          <div className="p-2 overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
            <div className="space-y-1.5 rounded-lg p-1">
              {cargas.map((carga, index) => (
                <div
                  key={carga.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <CardCargaPreparacao 
                    carga={carga} 
                    index={index}
                    onUpdate={handleUpdateCarga}
                    onRemove={handleRemoveCarga}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    isDragging={draggedIndex === index}
                    dragHandleProps={{}}
                    isFirst={index === 0}
                    isLast={index === cargas.length - 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Estado Vazio */}
      {cargas.length === 0 && !carregandoArquivo && (
        <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 flex-1 flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma carga preparada</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Importe uma planilha Excel ou adicione cargas manualmente para começar a organizar sua operação
          </p>
          <button 
            onClick={adicionarCargaManual} 
            className="px-4 py-2 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Adicionar Carga Manual
          </button>
        </div>
      )}
    </div>
  );
};

export default PreparacaoCargas;