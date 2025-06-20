
import React, { useState } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { AI_NAME } from '../constants';

type ActiveStudyTool = 'mathematics' | 'physics' | 'chemistry' | 'biology' | 'english' | null;

interface StudiesPageProps {
  selectedTimezone: string;
}

const StudiesPage: React.FC<StudiesPageProps> = ({ selectedTimezone }) => {
  const [activeTool, setActiveTool] = useState<ActiveStudyTool>(null);

  const tools: { id: ActiveStudyTool; label: string; greeting: string, context: string }[] = [
    { id: 'mathematics', label: 'Matemáticas', greeting: `¡Bienvenido a la Suite de Matemáticas de ${AI_NAME}! Estoy aquí para ayudarte a resolver problemas, entender conceptos y explorar el mundo de los números. Por favor, presenta tu consulta o problema matemático.`, context: 'studies-mathematics' },
    { id: 'physics', label: 'Física', greeting: `¡Saludos desde la Suite de Física de ${AI_NAME}! ¿Qué misterios del universo te gustaría desvelar hoy? Desde la mecánica clásica hasta la física cuántica, estoy listo para asistirte.`, context: 'studies-physics' },
    { id: 'chemistry', label: 'Química', greeting: `¡Bienvenido al Laboratorio de Química de ${AI_NAME}! ¿Exploramos reacciones, compuestos o principios fundamentales? Presenta tus preguntas.`, context: 'studies-chemistry' },
    { id: 'biology', label: 'Biología', greeting: `¡Explora el fascinante mundo de la vida en la Suite de Biología de ${AI_NAME}! Desde la célula hasta los ecosistemas, estoy aquí para ayudarte.`, context: 'studies-biology' },
    { id: 'english', label: 'Inglés', greeting: `Hello and welcome to your English learning space with ${AI_NAME}! I'm here to help you master the English language. To start, tell me about your current English level or what you'd like to focus on.`, context: 'studies-english' },
  ];

  const getToolButtonClass = (toolId: ActiveStudyTool) => {
    const base = "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800";
    if (activeTool === toolId) {
      return `${base} bg-accentBlue-600 text-white scale-105 shadow-lg focus-visible:ring-accentBlue-500`;
    }
    return `${base} bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-accentBlue-500 dark:hover:bg-accentBlue-600 hover:text-white dark:hover:text-white hover:shadow-md focus-visible:ring-accentBlue-400`;
  };
  
  const selectedToolDetails = tools.find(t => t.id === activeTool);

  return (
    <div className="h-full flex flex-col p-2 md:p-4">
      <div className="mb-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 shadow-md">
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {tools.map(tool => (
            <button 
              key={tool.id} 
              onClick={() => setActiveTool(tool.id)} 
              className={getToolButtonClass(tool.id)}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-hidden rounded-lg bg-white dark:bg-slate-800/30 shadow-inner">
        {selectedToolDetails ? (
          <ChatInterface 
            key={selectedToolDetails.id} 
            initialGreetingMessage={selectedToolDetails.greeting}
            chatContext={selectedToolDetails.context}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-accentBlue-600 dark:text-accentBlue-400">Suite de Estudios de {AI_NAME}</h2>
            <p className="mb-6 text-slate-600 dark:text-slate-300 max-w-md">
              Selecciona una materia del menú superior para comenzar tu viaje de aprendizaje y descubrimiento. {AI_NAME} está preparado para asistirte con precisión y elegancia.
            </p>
            <div className="animate-pulse text-accentBlue-500 dark:text-accentBlue-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v1.586M12 12.253v1.586M12 18.253v1.586M7.5 12.253h1.586M15 12.253h1.586M9.75 9.253l1.127-1.127M14.25 9.253l-1.127-1.127M9.75 15.253l1.127 1.127M14.25 15.253l-1.127 1.127" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudiesPage;
