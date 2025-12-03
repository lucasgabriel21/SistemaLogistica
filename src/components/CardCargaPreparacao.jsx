import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, GripVertical, Trash2, Edit, X, Package, Truck, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import useStore from '@/store/useStore'; // CORREÇÃO: Caminho absoluto ajustado

const CardCargaPreparacao = ({ carga, index, provided, snapshot }) => {
  const { updateCarga, removeCarga, reorderCargas, tiposFrota } = useStore();
  const [editando, setEditando] = useState(false);

  const getTipoFrotaInfo = (tipo) => tiposFrota.find(t => t.id === tipo) || tiposFrota[0];
  const tipoFrota = getTipoFrotaInfo(carga.tipoFrota);
  const isDragging = snapshot?.isDragging;

  const handleUpdate = (field, value) => {
    let finalValue = value;
    if (field === 'peso') {
      finalValue = Number(value);
      if (isNaN(finalValue)) finalValue = 0;
    }
    updateCarga(carga.id, { [field]: finalValue });
  };

  const moverCarga = (direcao) => {
    const novoIndex = direcao === 'up' ? index - 1 : index + 1;
    if (novoIndex >= 0 && novoIndex < useStore.getState().cargas.length) {
      reorderCargas(index, novoIndex);
    }
  };

  return (
    <motion.div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      className={`bg-white border-2 rounded-xl p-3 mb-3 shadow-sm hover:shadow-md transition-all ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : 'border-gray-200'
      }`}
      layout
    >
      {/* Linha 1: Ordem, Descrição, Observação (Layout Compacto) */}
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-1" {...provided?.dragHandleProps}>
          <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
          <Badge className="bg-blue-600 text-white font-bold px-3 py-1 text-sm shrink-0">
            #{carga.sequencia}
          </Badge>
        </div>
        
        <div className="flex-1 min-w-0 text-center px-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">DESCRIÇÃO</p>
          {editando ? (
            <Input
              value={carga.descricao}
              onChange={(e) => handleUpdate('descricao', e.target.value)}
              className="h-8 text-sm text-center"
            />
          ) : (
            <p className="text-sm font-semibold text-gray-900 line-clamp-2">
              {carga.descricao || 'Sem descrição'}
            </p>
          )}
        </div>
        
        <div className="w-16 text-center hidden sm:block">
          <p className="text-xs text-gray-500 uppercase tracking-wide">OBS</p>
          <p className="text-sm font-semibold text-gray-400 line-clamp-2">
            {/* Placeholder para Observação */}
            SÓ CARREGA AMANHÃ
          </p>
        </div>
      </div>

      {/* Linha 2: Captação, Peso, Frota, Controles (Grid Responsivo) */}
      <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center pt-2">
        
        {/* Captação */}
        <div className="text-center">
          <p className="text-xs text-blue-600 uppercase font-medium flex items-center justify-center gap-1"><Package className="h-3 w-3"/> CAPTAÇÃO</p>
          {editando ? (
            <Input
              value={carga.romaneio}
              onChange={(e) => handleUpdate('romaneio', e.target.value)}
              className="h-8 text-xs font-mono text-center"
            />
          ) : (
            <p className="text-base font-bold text-blue-900 font-mono truncate">
              {carga.romaneio}
            </p>
          )}
        </div>

        {/* Peso */}
        <div className="text-center">
          <p className="text-xs text-green-600 uppercase font-medium flex items-center justify-center gap-1"><Scale className="h-3 w-3"/> PESO</p>
          {editando ? (
            <Input
              type="number"
              value={carga.peso}
              onChange={(e) => handleUpdate('peso', e.target.value)}
              className="h-8 text-xs text-center"
            />
          ) : (
            <p className="text-base font-bold text-green-900 truncate">
              {carga.peso.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} KG
            </p>
          )}
        </div>
        
        {/* Frota */}
        <div className="text-center hidden sm:block">
          <p className="text-xs text-purple-600 uppercase font-medium flex items-center justify-center gap-1"><Truck className="h-3 w-3"/> FROTA</p>
          {editando ? (
            <Select
              value={carga.tipoFrota}
              onValueChange={(value) => handleUpdate('tipoFrota', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposFrota.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id} className="text-xs">
                    {tipo.icon} {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <span className="text-xl">{tipoFrota.icon}</span>
              <p className="text-sm font-bold text-purple-900 truncate">
                {tipoFrota.label}
              </p>
            </div>
          )}
        </div>

        {/* Controles (Sempre visíveis e lado a lado) */}
        <div className="col-span-2 sm:col-span-1 flex gap-1 justify-center items-center pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-100 sm:pl-3">
          <Button variant="outline" size="sm" onClick={() => moverCarga('up')} disabled={index === 0} className="h-8 w-8 p-0">
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => moverCarga('down')} disabled={index === useStore.getState().cargas.length - 1} className="h-8 w-8 p-0">
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditando(!editando)} className="h-8 w-8 p-0">
            {editando ? <X className="h-4 w-4 text-red-500" /> : <Edit className="h-4 w-4 text-gray-500" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => removeCarga(carga.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CardCargaPreparacao;
