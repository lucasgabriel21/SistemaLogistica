import { useAuth } from '@/auth/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  // Definição de quais status cada setor pode acessar
  const permissoesPorSetor = {
    logistica: [
      'aguardando-entrada', 
      'aguardando-carregamento', 
      'carregando', 
      'aguardando-racao', 
      'carregada', 
      'faturado'
    ],
    portaria: [
      'aguardando-entrada', 
      'aguardando-carregamento',
      'carregada',
      'faturado'
    ],
    expedicao: [
      'aguardando-carregamento',
      'carregando',
      'carregada'
    ]
  };

  const canMoveToStatus = (currentStatus, targetStatus) => {
    if (!user) return false;
    
    const statusPermitidos = permissoesPorSetor[user.setor] || [];
    return statusPermitidos.includes(targetStatus);
  };

  const canViewStatus = (status) => {
    if (!user) return false;
    
    const statusPermitidos = permissoesPorSetor[user.setor] || [];
    return statusPermitidos.includes(status);
  };

  const canEditCarga = () => {
    return user?.setor === 'logistica';
  };

  const canImportCargas = () => {
    return user?.setor === 'logistica';
  };

  const getUserSetor = () => {
    return user?.setor || 'visitante';
  };

  const getUserName = () => {
    return user?.nome || 'Usuário';
  };

  return {
    canMoveToStatus,
    canViewStatus,
    canEditCarga,
    canImportCargas,
    getUserSetor,
    getUserName,
    user
  };
};