
import React from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { AI_NAME } from '../constants';

const GeneralChatPage: React.FC = () => {
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