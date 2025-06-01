
import React, { useState, useEffect, useCallback } from 'react';
import { GEMINI_API_KEY, AI_NAME, AI_SLOGAN } from './constants';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import GeneralChatPage from './pages/GeneralChatPage';
import StudiesPage from './pages/StudiesPage'; 
import FinancialMarketsPage from './pages/FinancialMarketsPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import { UserCircleIcon } from './components/icons/UserCircleIcon';
import { LogoutIcon } from './components/icons/LogoutIcon';

type ActiveTab = 'general' | 'studies' | 'financial' | 'admin'; 

const App: React.FC = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) return storedTheme;
      return 'dark'; 
    }
    return 'dark';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const [isLoggedInAsAdmin, setIsLoggedInAsAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isLoggedInAsAdmin') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove(theme === 'dark' ? 'light' : 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsLoggedInAsAdmin(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedInAsAdmin', 'true');
    }
    setActiveTab('general'); // Go to general page after login
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedInAsAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedInAsAdmin');
    }
    setActiveTab('general'); // Reset to general tab view for login page
  }, []);


  if (!GEMINI_API_KEY) {
    return (
      <div className={`flex items-center justify-center min-h-screen p-4 ${theme === 'light' ? 'bg-slate-100 text-red-600' : 'bg-gray-900 text-red-400'}`}>
        <div className={`${theme === 'light' ? 'bg-white' : 'bg-gray-800'} p-8 rounded-lg shadow-xl text-center`}>
          <h1 className="text-2xl font-bold mb-4">Error de Configuración</h1>
          <p>La variable de entorno API_KEY para {AI_NAME} (Gemini) no está configurada.</p>
          <p className={`mt-2 text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Por favor, asegúrate de que esté disponible en el entorno de ejecución.</p>
        </div>
      </div>
    );
  }

  if (!isLoggedInAsAdmin) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} />;
  }

  const renderActiveTabPage = () => {
    switch (activeTab) {
      case 'studies': 
        return <StudiesPage />;
      case 'financial':
        return <FinancialMarketsPage />;
      case 'admin':
        return isLoggedInAsAdmin ? <AdminPage /> : <GeneralChatPage />; // Fallback for safety
      case 'general':
      default:
        return <GeneralChatPage />;
    }
  };

  const getTabClass = (tabName: ActiveTab) => {
    const baseClass = `py-3 px-3 md:px-4 text-sm md:text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 whitespace-nowrap ${theme === 'light' ? 'focus-visible:ring-purple-600 focus-visible:ring-offset-white' : 'focus-visible:ring-purple-400 focus-visible:ring-offset-gray-800'}`;
    if (activeTab === tabName) {
      return `${baseClass} ${theme === 'light' ? 'text-purple-700 border-b-2 border-purple-700' : 'text-purple-400 border-b-2 border-purple-400'}`;
    }
    return `${baseClass} ${theme === 'light' ? 'text-slate-600 hover:text-purple-700 hover:border-b-2 hover:border-purple-300' : 'text-gray-400 hover:text-purple-400 hover:border-b-2 hover:border-purple-500'}`;
  };
  
  const baseTabs: { name: ActiveTab; label: string }[] = [ 
    { name: 'general', label: AI_NAME }, 
    { name: 'studies', label: 'Estudios' },
    { name: 'financial', label: 'Mercados Financieros' },
  ];

  const adminTabs: { name: ActiveTab; label: string }[] = isLoggedInAsAdmin ? 
    [...baseTabs, { name: 'admin', label: 'Admin Panel' }] : baseTabs;


  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-gray-900 text-gray-100'}`}>
      <header className={`shadow-md ${theme === 'light' ? 'bg-white border-b border-slate-200' : 'bg-gray-800'}`}>
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-3">
                <div className="flex items-center space-x-3">
                    {isLoggedInAsAdmin && (
                        <>
                            <UserCircleIcon className={`w-8 h-8 ${theme === 'light' ? 'text-purple-700' : 'text-purple-400'}`} />
                            <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-gray-200'}`}>Admin</span>
                            <button 
                                onClick={handleLogout}
                                className={`p-1.5 rounded-full transition-colors duration-200 ${theme === 'light' ? 'text-slate-600 hover:bg-slate-200 hover:text-red-600' : 'text-gray-400 hover:bg-gray-700 hover:text-red-400'}`}
                                aria-label="Cerrar Sesión"
                                title="Cerrar Sesión"
                            >
                                <LogoutIcon className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
                <div className="flex-grow text-center">
                    <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-purple-700' : 'text-purple-400'}`}>{AI_NAME}</h1>
                    <p className={`text-sm ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'} opacity-90`}>{AI_SLOGAN}</p>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-full transition-colors duration-200 ${theme === 'light' ? 'text-purple-700 hover:bg-purple-100' : 'text-purple-400 hover:bg-gray-700'}`}
                        aria-label={theme === 'light' ? "Activar modo oscuro" : "Activar modo claro"}
                    >
                        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>
            <nav className={`flex border-t ${theme === 'light' ? 'border-slate-200' : 'border-gray-700'} overflow-x-auto`}>
              <div className="flex justify-start md:justify-center mx-auto"> 
                {adminTabs.map(tab => (
                  <button key={tab.name} onClick={() => setActiveTab(tab.name)} className={getTabClass(tab.name)}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>
        </div>
      </header>
      
      <main className="flex-grow overflow-hidden container mx-auto w-full">
        {renderActiveTabPage()}
      </main>
      
      <footer className={`p-3 text-center text-xs ${theme === 'light' ? 'bg-slate-100 text-slate-600 border-t border-slate-200' : 'bg-gray-800 text-gray-500'}`}>
        {AI_NAME} - Potenciado por Gemini. Fecha de referencia del modelo: 30 de mayo de 2025.
      </footer>
    </div>
  );
};

export default App;
