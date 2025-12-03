import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('kanban_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Usuários pré-cadastrados
      const users = {
        'logistica@empresa.com': { 
          id: 1, 
          nome: 'Logística Central', 
          setor: 'logistica', 
          password: 'log123' 
        },
        'portaria@empresa.com': { 
          id: 2, 
          nome: 'Portaria', 
          setor: 'portaria', 
          password: 'port123' 
        },
        'expedicao@empresa.com': { 
          id: 3, 
          nome: 'Expedição', 
          setor: 'expedicao', 
          password: 'exp123' 
        }
      };

      const userData = users[email];
      
      if (userData && userData.password === password) {
        const { password: _, ...userWithoutPassword } = userData;
        setUser(userWithoutPassword);
        localStorage.setItem('kanban_user', JSON.stringify(userWithoutPassword));
        return { success: true };
      }
      
      return { success: false, error: 'E-mail ou senha inválidos' };
    } catch (error) {
      return { success: false, error: 'Erro no sistema' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kanban_user');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};