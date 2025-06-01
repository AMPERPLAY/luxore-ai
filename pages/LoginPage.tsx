
import React, { useState } from 'react';
import { AI_NAME, AI_SLOGAN } from '../constants';
import { SunIcon } from '../components/icons/SunIcon';
import { MoonIcon } from '../components/icons/MoonIcon';

interface LoginPageProps {
  onLoginSuccess: () => void;
  theme: string;
  toggleTheme: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, theme, toggleTheme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setError('');
      onLoginSuccess();
    } else {
      setError('Nombre de usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-300 ${theme === 'light' ? 'bg-slate-100' : 'bg-gray-900'}`}>
      <div className={`absolute top-4 right-4`}>
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors duration-200 ${theme === 'light' ? 'text-purple-700 hover:bg-purple-100' : 'text-purple-400 hover:bg-gray-700'}`}
            aria-label={theme === 'light' ? "Activar modo oscuro" : "Activar modo claro"}
        >
            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
      </div>
        
      <div className={`w-full max-w-md p-8 space-y-6 rounded-xl shadow-2xl ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}>
        <div className="text-center">
          <h1 className={`text-4xl font-bold ${theme === 'light' ? 'text-purple-700' : 'text-purple-400'}`}>{AI_NAME}</h1>
          <p className={`mt-1 text-md ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'} opacity-90`}>{AI_SLOGAN}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="username" 
              className={`block text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}
            >
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                theme === 'light' 
                ? 'border-slate-300 placeholder-slate-400 text-slate-900 focus:ring-purple-500 focus:border-purple-500 bg-white' 
                : 'border-gray-600 placeholder-gray-400 text-white focus:ring-purple-500 focus:border-purple-500 bg-gray-700'
              }`}
              placeholder="ej: tu_usuario_admin"
            />
          </div>
          
          <div>
            <label 
              htmlFor="password" 
              className={`block text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                theme === 'light' 
                ? 'border-slate-300 placeholder-slate-400 text-slate-900 focus:ring-purple-500 focus:border-purple-500 bg-white' 
                : 'border-gray-600 placeholder-gray-400 text-white focus:ring-purple-500 focus:border-purple-500 bg-gray-700'
              }`}
              placeholder="ej: tu_contraseña_admin"
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
          )}
          
          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                theme === 'light' ? 'focus:ring-offset-slate-50' : 'focus:ring-offset-gray-900'
              } transition-colors duration-150`}
            >
              Acceder
            </button>
          </div>
        </form>
        <p className={`mt-4 text-center text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
            Para esta simulación, las credenciales son "admin" / "admin".
        </p>
      </div>
       <footer className={`absolute bottom-0 w-full p-3 text-center text-xs ${theme === 'light' ? 'text-slate-600' : 'text-gray-500'}`}>
         {AI_NAME} - Potenciado por Gemini. Fecha de referencia del modelo: 30 de mayo de 2025.
      </footer>
    </div>
  );
};

export default LoginPage;
