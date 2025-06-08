
import React from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { AI_NAME } from '../constants';

interface GeneralChatPageProps {
  // selectedTimezone: string; // No longer passed
}

const GeneralChatPage: React.FC<GeneralChatPageProps> = (/* { selectedTimezone } */) => {
  // console.log('GeneralChatPage selectedTimezone:', selectedTimezone); // Prop removed
  return (
    <div className="h-full flex flex-col p-0 md:p-0"> {/* Ensure page takes full height within main */}
      <ChatInterface 
        initialGreetingMessage={`¡Bienvenido a ${AI_NAME}! Soy tu asistente IA de élite, preparado para una amplia gama de tareas: desde generar texto creativo y responder tus preguntas, hasta crear imágenes impactantes y asistirte en tus estudios. Describe tu visión o consulta, y la materializaremos con luz y grandeza.`}
        chatContext="general"
      />
    </div>
  );
};

export default GeneralChatPage;
