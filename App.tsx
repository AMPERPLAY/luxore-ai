
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
import { GlobeAltIcon } from './components/icons/GlobeAltIcon'; 

type ActiveTab = 'general' | 'studies' | 'financial' | 'admin'; 

const getTimezoneFriendlyName = (tz: string) => {
  if (tz === 'Local') return 'Local (Navegador)';
  return tz.replace(/_/g, ' ').split('/').pop() || tz;
};

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
  const [selectedTimezone, setSelectedTimezone] = useState<string>('Local');
  
  const availableTimezones = React.useMemo(() => {
    let zones: string[] = ['Local', 'UTC', 'America/Guayaquil', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
    try {
      const supported = (Intl as any).supportedValuesOf?.('timeZone') as string[] || [];
      const commonSuffixes = ['New_York', 'London', 'Paris', 'Tokyo', 'Sydney', 'Moscow', 'Dubai', 'Guayaquil', 'Mexico_City', 'Buenos_Aires', 'Sao_Paulo'];
      const filteredSupported = supported.filter(tz => commonSuffixes.some(suffix => tz.endsWith(suffix)) || tz.startsWith('America/') || tz.startsWith('Europe/') || tz.startsWith('Asia/'));
      const importantZones = ['UTC', 'America/Guayaquil', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
      zones = ['Local', ...new Set([...importantZones, ...filteredSupported])].sort();
    } catch (e) {
      console.warn("Error processing timezones (Intl.supportedValuesOf might have failed), using fallback list.", e);
    }
    if (!zones.includes('America/Guayaquil')) {
        zones.splice(1, 0, 'America/Guayaquil'); 
    }
    return zones;
  }, []);


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
      new URL(currentUrl); // Valida si la URL es estructuralmente correcta
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
        // Opcional: mostrar feedback de éxito si navigator.share no lo provee.
      } else {
        // Fallback para navegadores que no soportan navigator.share
        if (!navigator.clipboard) {
          alert(`Tu navegador no soporta la función de compartir ni la de copiar al portapapeles.\nPor favor, copia la URL manualmente: ${shareData.url}`);
          return;
        }
        await navigator.clipboard.writeText(shareData.url);
        setShowShareFeedback(true); // "¡Enlace ... copiado!"
        setTimeout(() => setShowShareFeedback(false), 2500);
      }
    } catch (error: any) {
      console.error('Error al compartir o copiar inicialmente:', error);
      
      if (error.name === 'AbortError') {
        // El usuario canceló la operación de compartir nativa.
        console.log('Compartir cancelado por el usuario.');
        return; 
      }
      
      let specificErrorHandled = false;
      if (error.message && error.message.toLowerCase().includes('invalid url')) {
         console.warn(`navigator.share consideró la URL "${shareData.url}" inválida. Intentando copiar al portapapeles.`);
         specificErrorHandled = true; // El error específico fue logueado, se procede al fallback.
      }

      // Intento de copiar al portapapeles como último recurso si navigator.share falló por cualquier razón (incluida Invalid URL)
      // o si navigator.share no existe.
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
        } else if (specificErrorHandled) { // Si el error original fue 'Invalid URL' de navigator.share
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
      // Fallback to local timezone if the provided one is invalid
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
    const pageProps = { selectedTimezone };
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
    const baseClass = `py-3 px-3 md:px-4 text-sm md:text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 whitespace-nowrap ${theme === 'light' ? 'focus-visible:ring-accentBlue-500 focus-visible:ring-offset-white' : 'focus-visible:ring-accentBlue-400 focus-visible:ring-offset-slate-800'}`;
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
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-3">
                <div className="flex flex-col items-start space-y-1 min-w-[280px] md:min-w-[320px]"> 
                    {isLoggedInAsAdmin && (
                        <div className="flex items-center space-x-2">
                            <UserCircleIcon className={`w-7 h-7 ${theme === 'light' ? 'text-accentBlue-700' : 'text-accentBlue-400'}`} />
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
                        <div className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
                           {formatDateTime(currentTime)} <span className="font-semibold">(Local)</span>
                        </div>
                        {selectedTimezone !== 'Local' && (
                             <div className={theme === 'light' ? 'text-accentBlue-600' : 'text-accentBlue-400'}>
                                {formatDateTime(currentTime, selectedTimezone)} <span className="font-semibold">({getTimezoneFriendlyName(selectedTimezone)})</span>
                             </div>
                        )}
                    </div>
                </div>

                <div className="flex-grow text-center px-2">
                    <h1 className={`text-2xl md:text-3xl font-bold ${theme === 'light' ? 'text-accentBlue-700' : 'text-accentBlue-400'}`}>{AI_NAME}</h1>
                    <p className={`text-xs md:text-sm ${theme === 'light' ? 'text-accentBlue-600' : 'text-accentBlue-300'} opacity-90`}>{AI_SLOGAN}</p>
                </div>

                <div className="flex flex-col items-end space-y-2 min-w-[180px] md:min-w-[200px]">
                    <div className="flex items-center space-x-1 md:space-x-2">
                        <button
                            onClick={handleShare}
                            className={`p-1.5 md:p-2 rounded-full transition-colors duration-200 ${theme === 'light' ? 'text-accentBlue-700 hover:bg-accentBlue-100' : 'text-accentBlue-400 hover:bg-slate-700'}`}
                            aria-label="Compartir Luxoré AI"
                            title="Compartir"
                        >
                            <ShareIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <button
                            onClick={toggleTheme}
                            className={`p-1.5 md:p-2 rounded-full transition-colors duration-200 ${theme === 'light' ? 'text-accentBlue-700 hover:bg-accentBlue-100' : 'text-accentBlue-400 hover:bg-slate-700'}`}
                            aria-label={theme === 'light' ? "Activar modo oscuro" : "Activar modo claro"}
                        >
                            {theme === 'light' ? <MoonIcon className="w-5 h-5 md:w-6 md:h-6" /> : <SunIcon className="w-5 h-5 md:w-6 md:h-6" />}
                        </button>
                    </div>
                    <div className="flex items-center space-x-1">
                        <GlobeAltIcon className={`w-4 h-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`} />
                        <select
                            value={selectedTimezone}
                            onChange={(e) => setSelectedTimezone(e.target.value)}
                            className={`text-xs p-1 border rounded-md shadow-sm focus:outline-none focus:ring-1 max-w-[150px] ${
                                theme === 'light' 
                                ? 'border-slate-300 text-slate-700 bg-white focus:ring-accentBlue-500 focus:border-accentBlue-500' 
                                : 'border-slate-600 text-slate-200 bg-slate-700 focus:ring-accentBlue-500 focus:border-accentBlue-500'
                            }`}
                            aria-label="Seleccionar zona horaria"
                        >
                            {availableTimezones.map(tz => (
                                <option key={tz} value={tz}>{getTimezoneFriendlyName(tz)}</option>
                            ))}
                        </select>
                    </div>
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
      
      <main className="flex-grow overflow-hidden container mx-auto w-full">
        {renderActiveTabPage()}
      </main>
      
      <footer className={`p-3 text-center text-xs ${theme === 'light' ? 'bg-slate-100 text-slate-600 border-t border-slate-200' : 'bg-slate-800 text-slate-400 border-t border-slate-700'}`}>
        {AI_NAME} - Potenciado por Gemini.
      </footer>

      {showShareFeedback && (
        <div className="feedback-message show !bg-green-500"> {/* Ensuring Tailwind takes precedence */}
          ¡Enlace de Luxoré AI copiado al portapapeles!
        </div>
      )}
    </div>
  );
};

export default App;
