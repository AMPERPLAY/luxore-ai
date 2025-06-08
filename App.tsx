
import React, { useState, useEffect, useCallback } from 'react';
import { GEMINI_API_KEY, AI_NAME, AI_SLOGAN } from './constants';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import { ShareIcon } from './components/icons/ShareIcon';
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
  const [showShareFeedback, setShowShareFeedback] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

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
    setActiveTab('general'); 
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedInAsAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedInAsAdmin');
    }
    setActiveTab('general'); 
  }, []);

  const handleShare = async () => {
    let currentUrl = '';
    try {
      currentUrl = window.location.href;
      new URL(currentUrl); 
    } catch (e) {
      console.error("URL de la ventana no válida:", e, "URL problemática:", currentUrl);
      alert("No se puede compartir: la URL actual de la página no es válida.");
      return;
    }

    const shareData = {
      title: `${AI_NAME} - ${AI_SLOGAN}`,
      text: `Descubre ${AI_NAME}: ${document.querySelector('meta[name="description"]')?.getAttribute('content') || AI_SLOGAN}`,
      url: currentUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        if (!navigator.clipboard) {
          alert(`Tu navegador no soporta la función de compartir ni la de copiar al portapapeles.\nPor favor, copia la URL manualmente: ${shareData.url}`);
          return;
        }
        await navigator.clipboard.writeText(shareData.url);
        setShowShareFeedback(true); 
        setTimeout(() => setShowShareFeedback(false), 2500);
      }
    } catch (error: any) {
      console.error('Error al compartir o copiar inicialmente:', error);
      
      if (error.name === 'AbortError') {
        console.log('Compartir cancelado por el usuario.');
        return; 
      }
      
      let specificErrorHandled = false;
      if (error.message && error.message.toLowerCase().includes('invalid url')) {
         console.warn(`navigator.share consideró la URL "${shareData.url}" inválida. Intentando copiar al portapapeles.`);
         specificErrorHandled = true; 
      }

      if (!navigator.clipboard) {
        alert(`Tu navegador no soporta la función de copiar al portapapeles.\nPor favor, copia la URL manualmente: ${shareData.url}`);
        return;
      }
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShowShareFeedback(true); 
        setTimeout(() => setShowShareFeedback(false), 2500);
      } catch (copyError: any) {
        console.error('Error final al copiar al portapapeles:', copyError);
        let alertMessage = `No se pudo compartir ni copiar.\nPor favor, copia la URL manualmente: ${shareData.url}`;
        if (copyError.name === 'NotAllowedError' || (copyError.message && (copyError.message.toLowerCase().includes('permission denied') || copyError.message.toLowerCase().includes('write permission denied')))) {
          alertMessage = `El permiso para escribir en el portapapeles fue denegado.\nPor favor, copia la URL manualmente: ${shareData.url}\n\nAsegúrate de que la página se sirve sobre HTTPS (o es localhost) y que tu navegador tiene permisos para acceder al portapapeles.`;
        } else if (specificErrorHandled) { 
           alertMessage = `La URL "${shareData.url}" no pudo ser compartida directamente y también falló la copia al portapapeles. Por favor, copia la URL manualmente.`;
        }
        alert(alertMessage);
      }
    }
  };

  const formatDateTime = (date: Date, timeZone?: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    };
    if (timeZone && timeZone !== 'Local') { 
      options.timeZone = timeZone;
    }
    try {
      return new Intl.DateTimeFormat('es-ES', options).format(date);
    } catch (e) {
      console.error(`Error formatting date for timezone ${timeZone}:`, e);
      options.timeZone = undefined; 
      return new Intl.DateTimeFormat('es-ES', options).format(date);
    }
  };


  if (!GEMINI_API_KEY) {
    return (
      <div className={`flex items-center justify-center min-h-screen p-4 ${theme === 'light' ? 'bg-slate-100 text-red-600' : 'bg-slate-900 text-red-400'}`}>
        <div className={`${theme === 'light' ? 'bg-white' : 'bg-slate-800'} p-8 rounded-lg shadow-xl text-center`}>
          <h1 className="text-2xl font-bold mb-4">Error de Configuración</h1>
          <p>La variable de entorno <code className="text-sm bg-red-100 dark:bg-red-800 p-1 rounded">VITE_API_KEY</code> para {AI_NAME} (Gemini) no está configurada correctamente en Vercel.</p>
          <p className={`mt-2 text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Por favor, verifica la configuración de "Environment Variables" en tu proyecto de Vercel y asegúrate de que el nombre sea <code>VITE_API_KEY</code>.</p>
        </div>
      </div>
    );
  }

  if (!isLoggedInAsAdmin) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} />;
  }

  const renderActiveTabPage = () => {
    const pageProps = {};
    switch (activeTab) {
      case 'studies': 
        return <StudiesPage {...pageProps} />;
      case 'financial':
        return <FinancialMarketsPage {...pageProps} />;
      case 'admin':
        return isLoggedInAsAdmin ? <AdminPage /> : <GeneralChatPage {...pageProps} />; 
      case 'general':
      default:
        return <GeneralChatPage {...pageProps} />;
    }
  };

  const getTabClass = (tabName: ActiveTab) => {
    const baseClass = `py-2 px-2 text-xs sm:py-2.5 sm:px-3 sm:text-sm md:text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 whitespace-nowrap ${theme === 'light' ? 'focus-visible:ring-accentBlue-500 focus-visible:ring-offset-white' : 'focus-visible:ring-accentBlue-400 focus-visible:ring-offset-slate-800'}`;
    if (activeTab === tabName) {
      return `${baseClass} ${theme === 'light' ? 'text-accentBlue-700 border-b-2 border-accentBlue-700' : 'text-accentBlue-400 border-b-2 border-accentBlue-400'}`;
    }
    return `${baseClass} ${theme === 'light' ? 'text-slate-600 hover:text-accentBlue-700 hover:border-b-2 hover:border-accentBlue-300' : 'text-slate-400 hover:text-accentBlue-400 hover:border-b-2 hover:border-accentBlue-500'}`;
  };
  
  const baseTabs: { name: ActiveTab; label: string }[] = [ 
    { name: 'general', label: AI_NAME }, 
    { name: 'studies', label: 'Estudios' },
    { name: 'financial', label: 'Mercados Financieros' },
  ];

  const adminTabs: { name: ActiveTab; label: string }[] = isLoggedInAsAdmin ? 
    [...baseTabs, { name: 'admin', label: 'Admin Panel' }] : baseTabs;


  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-slate-100'}`}>
      <header className={`shadow-md ${theme === 'light' ? 'bg-white border-b border-slate-200' : 'bg-slate-800 border-b border-slate-700'}`}>
        <div className="container mx-auto px-2 sm:px-4"> {/* Reduced horizontal padding for smallest screens */}
            <div className="flex justify-between items-center py-2 sm:py-3 gap-1 sm:gap-2">
                <div className="flex flex-col items-start space-y-1 flex-shrink min-w-0"> 
                    {isLoggedInAsAdmin && (
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <UserCircleIcon className={`w-5 h-5 sm:w-6 ${theme === 'light' ? 'text-accentBlue-700' : 'text-accentBlue-400'}`} />
                            <span className={`text-xs font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>Admin</span>
                            <button 
                                onClick={handleLogout}
                                className={`p-1 rounded-full transition-colors duration-200 ${theme === 'light' ? 'text-slate-500 hover:bg-slate-200 hover:text-red-600' : 'text-slate-400 hover:bg-slate-700 hover:text-red-400'}`}
                                aria-label="Cerrar Sesión"
                                title="Cerrar Sesión"
                            >
                                <LogoutIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <div className="text-xs">
                        <div className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} leading-tight`}> {/* Added leading-tight for better line spacing if text wraps */}
                           {formatDateTime(currentTime)} <span className="font-semibold">(Local)</span>
                        </div>
                    </div>
                </div>

                <div className="flex-grow text-center px-1 sm:px-2 min-w-0"> {/* Added min-w-0 */}
                    <h1 className={`text-lg sm:text-xl md:text-2xl font-bold ${theme === 'light' ? 'text-accentBlue-700' : 'text-accentBlue-400'}`}>{AI_NAME}</h1>
                    <p className={`text-[10px] sm:text-xs ${theme === 'light' ? 'text-accentBlue-600' : 'text-accentBlue-300'} opacity-90 leading-snug`}>{AI_SLOGAN}</p> {/* Added leading-snug */}
                </div>

                <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-1.5 flex-shrink-0 justify-end">
                    <button
                        onClick={handleShare}
                        className={`p-1 sm:p-1.5 md:p-2 rounded-full transition-colors duration-200 ${theme === 'light' ? 'text-accentBlue-700 hover:bg-accentBlue-100' : 'text-accentBlue-400 hover:bg-slate-700'}`}
                        aria-label="Compartir Luxoré AI"
                        title="Compartir"
                    >
                        <ShareIcon className="w-5 h-5 sm:w-5 md:w-6" />
                    </button>
                    <button
                        onClick={toggleTheme}
                        className={`p-1 sm:p-1.5 md:p-2 rounded-full transition-colors duration-200 ${theme === 'light' ? 'text-accentBlue-700 hover:bg-accentBlue-100' : 'text-accentBlue-400 hover:bg-slate-700'}`}
                        aria-label={theme === 'light' ? "Activar modo oscuro" : "Activar modo claro"}
                    >
                        {theme === 'light' ? <MoonIcon className="w-5 h-5 sm:w-5 md:w-6" /> : <SunIcon className="w-5 h-5 sm:w-5 md:w-6" />}
                    </button>
                </div>
            </div>
            <nav className={`flex border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'} overflow-x-auto`}>
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
      
      <main className="flex-grow overflow-y-auto container mx-auto w-full">
        {renderActiveTabPage()}
      </main>
      
      <footer className={`p-3 text-center text-xs ${theme === 'light' ? 'bg-slate-100 text-slate-600 border-t border-slate-200' : 'bg-slate-800 text-slate-400 border-t border-slate-700'}`}>
        {AI_NAME} - Potenciado por Gemini.
      </footer>

      {showShareFeedback && (
        <div className="feedback-message show !bg-green-500">
          ¡Enlace de Luxoré AI copiado al portapapeles!
        </div>
      )}
    </div>
  );
};

export default App;
