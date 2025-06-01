
import React from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { AI_NAME } from '../constants';

const FinancialMarketsPage: React.FC = () => {
  const initialGreeting = `Bienvenido a la sección de Mercados Financieros de ${AI_NAME}. Soy tu analista de élite, preparado para proporcionarte datos en tiempo real, análisis técnico y fundamental, resúmenes de noticias y explicaciones detalladas sobre el mundo financiero. Mi objetivo es ofrecerte información precisa y objetiva, sin asesoramiento de inversión. ¿En qué activo, sector o concepto financiero podemos profundizar hoy?`;

  return (
    <div className="h-full flex flex-col p-0 md:p-0"> {/* Ensure page takes full height within main */}
      <ChatInterface 
        initialGreetingMessage={initialGreeting}
        chatContext="studies-financialmarkets" 
      />
    </div>
  );
};

export default FinancialMarketsPage;
