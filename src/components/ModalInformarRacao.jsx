import React, { useState } from 'react';
import { PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
// import useStore from '../store/useStore'; // Não é mais necessário importar useStore aqui

const ModalInformarRacao = ({ isOpen, onClose, carga, onConfirm }) => {
  // Removido racoesCadastradas pois a entrada será manual
  const [racaoNomeManual, setRacaoNomeManual] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [prioridade, setPrioridade] = useState('normal');
  const [erro, setErro] = useState('');
  
  const handleConfirmar = () => {
    // Validações
    if (!racaoNomeManual.trim()) {
      setErro('Informe o nome da ração');
      return;
    }
    
    if (!quantidade || parseInt(quantidade) <= 0) {
      setErro('Informe uma quantidade válida');
      return;
    }
    
    // Preparar dados
    const dadosRacao = {
      racaoId: null, // Não há ID, pois a entrada é manual
      racaoNome: racaoNomeManual.trim(),
      racaoCodigo: null, // Não há código, pois a entrada é manual
      quantidadeSacos: parseInt(quantidade),
      observacao: observacao.trim(),
      prioridade
    };
    
    // Confirmar
    onConfirm(dadosRacao);
    
    // Limpar formulário
    setRacaoNomeManual('');
    setQuantidade('');
    setObservacao('');
    setPrioridade('normal');
    setErro('');
  };
  
  const handleClose = () => {
    setRacaoNomeManual('');
    setQuantidade('');
    setObservacao('');
    setPrioridade('normal');
    setErro('');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageX className="h-5 w-5 text-yellow-600" />
            Informar Ração Necessária
          </DialogTitle>
          <DialogDescription>
            Carga: <strong>{carga?.romaneio}</strong> - Informe qual ração está faltando
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Erro */}
          {erro && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-sm">{erro}</AlertDescription>
            </Alert>
          )}
          
          {/* Ração Necessária - Entrada Manual */}
          <div>
            <Label htmlFor="racao">Nome da Ração *</Label>
            <Input
              id="racao"
              type="text"
              value={racaoNomeManual}
              onChange={(e) => {
                setRacaoNomeManual(e.target.value);
                setErro('');
              }}
              placeholder="Ex: Ração Suína Crescimento 22%"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Informe o nome completo da ração que está faltando.
            </p>
          </div>
          
          {/* Quantidade de Sacos */}
          <div>
            <Label htmlFor="quantidade">Quantidade de Sacos *</Label>
            <Input
              id="quantidade"
              type="number"
              value={quantidade}
              onChange={(e) => {
                setQuantidade(e.target.value);
                setErro('');
              }}
              placeholder="Ex: 500"
              className="mt-1"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Informe quantos sacos de 50kg são necessários
            </p>
          </div>
          
          {/* Prioridade */}
          <div>
            <Label htmlFor="prioridade">Prioridade</Label>
            <Select value={prioridade} onValueChange={setPrioridade}>
              <SelectTrigger id="prioridade" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">🟢</span>
                    <span>Baixa</span>
                  </div>
                </SelectItem>
                <SelectItem value="normal">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">🟡</span>
                    <span>Normal</span>
                  </div>
                </SelectItem>
                <SelectItem value="alta">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">🔴</span>
                    <span>Alta - Urgente</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Observações */}
          <div>
            <Label htmlFor="observacao">Observações (opcional)</Label>
            <Textarea
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Cliente aguardando entrega, prazo apertado..."
              className="mt-1"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {observacao.length}/500 caracteres
            </p>
          </div>
          
          {/* Preview */}
          {racaoNomeManual && quantidade && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm">
                <strong>Resumo:</strong>
                <br />
                • {racaoNomeManual}
                <br />
                • {quantidade} sacos (≈ {(parseInt(quantidade || 0) * 50 / 1000).toFixed(1)} toneladas)
                <br />
                • Prioridade: {prioridade.toUpperCase()}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmar}
            disabled={!racaoNomeManual.trim() || !quantidade}
          >
            Confirmar e Mover para Aguardando Ração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalInformarRacao;