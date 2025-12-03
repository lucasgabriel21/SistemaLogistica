import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Eye, EyeOff, Truck, Warehouse, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/auth/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const usuariosDemo = [
    { 
      setor: 'Logística', 
      email: 'logistica@empresa.com', 
      senha: 'log123', 
      icon: Users,
      descricao: 'Acesso total ao sistema' 
    },
    { 
      setor: 'Portaria', 
      email: 'portaria@empresa.com', 
      senha: 'port123', 
      icon: Warehouse,
      descricao: 'Controle de entrada/saída' 
    },
    { 
      setor: 'Expedição', 
      email: 'expedicao@empresa.com', 
      senha: 'exp123', 
      icon: Truck,
      descricao: 'Execução do carregamento' 
    }
  ];

  const preencherCredenciais = (demoEmail, demoSenha) => {
    setEmail(demoEmail);
    setPassword(demoSenha);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="grid md:grid-cols-2 gap-8">
          {/* Card de Login */}
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="bg-blue-600 p-3 rounded-full">
                  <Package className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Nutrane - Logística
              </CardTitle>
              <p className="text-gray-600">Acesse o sistema</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    E-mail
                  </label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar no Sistema'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Card de Usuários Demo */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Usuários de Demonstração
              </CardTitle>
              <p className="text-sm text-gray-600">
                Clique em um usuário para preencher automaticamente
              </p>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {usuariosDemo.map((usuario, index) => {
                const Icon = usuario.icon;
                return (
                  <motion.button
                    key={usuario.setor}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => preencherCredenciais(usuario.email, usuario.senha)}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {usuario.setor}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {usuario.descricao}
                        </p>
                        <div className="text-xs text-gray-500 mt-2">
                          <strong>E-mail:</strong> {usuario.email}<br />
                          <strong>Senha:</strong> {usuario.senha}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;