
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, ChatRole, GroundingMetadata, GroundingChunk } from '../types';
import { MessageBubble } from './MessageBubble';
import { LoadingSpinner } from './LoadingSpinner';
import { SendIcon } from './icons/SendIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ImageModal } from './ImageModal';
import { getChatInstance, sendMessageStream, generateImage, startNewChat, extractGroundingMetadata } from '../services/geminiService';
import { IMAGE_CONFIRMATION_REGEX, VIDEO_PLAN_CONFIRMATION_REGEX, MULTI_IMAGE_CONFIRMATION_REGEX, AI_NAME } from '../constants';
import { Chat, GenerateContentResponse, Part } from '@google/genai';
import { ImageIcon } from './icons/ImageIcon';

interface ImageReferencePreviewProps {
  imageData: { file: File, dataUrl: string };
  onRemove: () => void;
}

const ImageReferencePreview: React.FC<ImageReferencePreviewProps> = ({ imageData, onRemove }) => {
  return (
    <div className="relative group w-20 h-20 border border-slate-400 dark:border-slate-500 rounded-md overflow-hidden shadow-sm">
      <img src={imageData.dataUrl} alt={imageData.file.name} className="w-full h-full object-cover" />
      <button
        onClick={onRemove}
        className="absolute top-0.5 right-0.5 p-0.5 bg-red-600/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none flex items-center justify-center w-4 h-4"
        aria-label="Eliminar imagen de referencia"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

interface ChatInterfaceProps {
  initialGreetingMessage?: string;
  chatContext?: string;
  onAiMessageGenerated?: (message: ChatMessage) => void;
}

const MAX_TEXTAREA_HEIGHT = 150; 

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialGreetingMessage, chatContext, onAiMessageGenerated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  const [pendingImageDescription, setPendingImageDescription] = useState<string | null>(null);
  const [pendingVideoPlanDescription, setPendingVideoPlanDescription] = useState<string | null>(null);
  const [pendingMultiImageDescription, setPendingMultiImageDescription] = useState<string | null>(null);

  const [referenceImagesData, setReferenceImagesData] = useState<{ file: File, dataUrl: string }[]>([]);

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [showReferenceFeedback, setShowReferenceFeedback] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
      textareaRef.current.style.overflowY = scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const initializeChat = useCallback(() => {
    const greetingId = `initial-greeting-${chatContext || 'general'}-${Date.now()}`;
    const greetingMsg: ChatMessage = {
      id: greetingId,
      role: ChatRole.MODEL,
      text: initialGreetingMessage || `Hola, soy ${AI_NAME}, tu asistente de IA personal de élite. ¿Cómo puedo iluminar tu día hoy?`,
      timestamp: new Date(),
    };
    setMessages([greetingMsg]);
    setChatSession(getChatInstance());
    if (onAiMessageGenerated) {
        onAiMessageGenerated(greetingMsg);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialGreetingMessage, chatContext]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);


  const handleNewChat = useCallback(() => {
    const newGreetingId = `newchat-greeting-${chatContext || 'general'}-${Date.now()}`;
    const newGreetingMsg: ChatMessage = {
      id: newGreetingId,
      role: ChatRole.MODEL,
      text: initialGreetingMessage || "Nueva conversación iniciada. Estoy a tu disposición.",
      timestamp: new Date(),
    };
    setMessages([newGreetingMsg]);
    setPendingImageDescription(null);
    setPendingVideoPlanDescription(null);
    setPendingMultiImageDescription(null);
    setReferenceImagesData([]);
    setInputValue(''); 
    setChatSession(startNewChat());
    if (onAiMessageGenerated) {
        onAiMessageGenerated(newGreetingMsg);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialGreetingMessage, chatContext]);

  const handleImageClick = (imageUrl: string) => {
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const triggerCopyFeedback = () => {
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };
  
  const triggerReferenceFeedback = () => {
    setShowReferenceFeedback(true);
    setTimeout(() => setShowReferenceFeedback(false), 2500);
  };

  const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const handleUseImageAsReference = useCallback(async (imageUrl: string) => {
    if (referenceImagesData.length >= 3) {
      alert("Ya has alcanzado el máximo de 3 imágenes de referencia.");
      return;
    }
    try {
      const filename = `ref_luxore_${Date.now()}.${imageUrl.split(';')[0].split('/')[1] || 'png'}`;
      const file = await dataUrlToFile(imageUrl, filename);
      setReferenceImagesData(prev => [...prev, { file, dataUrl: imageUrl }]);
      triggerReferenceFeedback();
    } catch (error) {
      console.error("Error converting data URL to file for reference:", error);
      alert("Error al añadir imagen como referencia.");
    }
  }, [referenceImagesData]);


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 3 - referenceImagesData.length); 
      newFiles.forEach(file => {
        if (file.size > 4 * 1024 * 1024) { 
            alert(`La imagen "${file.name}" es demasiado grande (máx 4MB).`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          setReferenceImagesData(prev => [...prev, { file, dataUrl: e.target?.result as string }]);
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
    }
  };

  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (referenceImagesData.length >= 3) {
      return; 
    }

    const items = event.clipboardData?.items;
    if (!items) return;

    let imagePastedThisEvent = false;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imagePastedThisEvent = true; 
          
          if (referenceImagesData.length >= 3) {
            alert("Puedes añadir un máximo de 3 imágenes de referencia. Algunas imágenes del portapapeles no fueron añadidas.");
            break; 
          }

          if (file.size > 4 * 1024 * 1024) { 
            alert(`La imagen "${file.name}" pegada es demasiado grande (máx 4MB) y no fue añadida.`);
            continue; 
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            setReferenceImagesData(prev => [...prev, { file, dataUrl: e.target?.result as string }]);
            triggerReferenceFeedback(); 
          };
          reader.readAsDataURL(file);
        }
      }
    }
    if (imagePastedThisEvent) {
        // event.preventDefault(); // Uncomment if you want to prevent text pasting if an image was pasted.
    }
  }, [referenceImagesData]);


  const removeReferenceImage = (index: number) => {
    setReferenceImagesData(prev => prev.filter((_, i) => i !== index));
  };

  const dataUrlToBlobBase64 = (dataUrl: string): { mimeType: string, data: string } => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
    return { mimeType, data: base64Data };
  };

  const addMessageToList = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
    if (onAiMessageGenerated && message.role === ChatRole.MODEL && !message.isLoading) {
        onAiMessageGenerated(message);
    }
  }
  
  const updateLastMessage = (id: string, updates: Partial<ChatMessage>) => {
    let finalMsgForCallback: ChatMessage | undefined;
    setMessages(prev => {
      const updatedMessages = prev.map(m => m.id === id ? {...m, ...updates} : m);
      if (updates.isLoading === false) { 
        finalMsgForCallback = updatedMessages.find(m => m.id === id);
      }
      return updatedMessages;
    });

    if (finalMsgForCallback && onAiMessageGenerated && finalMsgForCallback.role === ChatRole.MODEL) {
        onAiMessageGenerated(finalMsgForCallback);
    }
  }

  const processUserMessage = async (userMessageText: string) => {
    if (!chatSession) return;

    const userMessageId = `user-${Date.now()}`;
    const userMessageTimestamp = new Date();

    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: ChatRole.USER,
      text: userMessageText,
      timestamp: userMessageTimestamp,
      ...(referenceImagesData.length > 0 && { referenceImageUrls: referenceImagesData.map(img => img.dataUrl) })
    };
    setMessages(prev => [...prev, newUserMessage]);

    setIsLoading(true);
    setInputValue('');
    const currentReferenceImages = [...referenceImagesData]; 
    setReferenceImagesData([]);

    const lowerUserMessage = userMessageText.toLowerCase();

    const generateAndAddImage = async (prompt: string, loadingText: string, type: 'single' | 'multi') => {
      const loadingId = `${type}-img-loading-${Date.now()}`;
      const loadingMsg: ChatMessage = { id: loadingId, role: ChatRole.MODEL, isLoading: true, timestamp: new Date(), text: loadingText };
      setMessages(prev => [...prev, loadingMsg]); 

      try {
        const imageUrl = await generateImage(prompt); 
        const newImageMsg: ChatMessage = { id: Date.now().toString(), role: ChatRole.MODEL, imageUrl, imagePrompt: prompt, timestamp: new Date() };
        
        let finalMsgForCallback: ChatMessage | undefined;
        setMessages(prev => {
            const filtered = prev.filter(m => m.id !== loadingId);
            finalMsgForCallback = newImageMsg;
            return [...filtered, newImageMsg];
        });
        if (finalMsgForCallback && onAiMessageGenerated) {
            onAiMessageGenerated(finalMsgForCallback);
        }

      } catch (error) {
        console.error(`${type} image generation error:`, error);
        let displayErrorMessage = `Error al generar imagen (${type}): ${error instanceof Error ? error.message : 'Error desconocido'}`;
        if (error instanceof Error && error.message.startsWith("Se ha excedido tu cuota actual de la API de Gemini")) {
            displayErrorMessage = error.message; 
        }
        const errorMsg: ChatMessage = { id: Date.now().toString(), role: ChatRole.MODEL, text: displayErrorMessage, isError: true, timestamp: new Date() };
        
        let finalMsgForCallback: ChatMessage | undefined;
        setMessages(prev => {
            const filtered = prev.filter(m => m.id !== loadingId);
            finalMsgForCallback = errorMsg;
            return [...filtered, errorMsg];
        });
        if (finalMsgForCallback && onAiMessageGenerated) {
            onAiMessageGenerated(finalMsgForCallback);
        }

      }
      setIsLoading(false);
    };

    if (pendingImageDescription) {
        const imagePrompt = pendingImageDescription;
        setPendingImageDescription(null);
        if (lowerUserMessage === 'sí' || lowerUserMessage === 'si' || lowerUserMessage === 'yes') {
            await generateAndAddImage(imagePrompt, 'Generando imagen...', 'single');
        } else {
            const noGenMsg: ChatMessage = { id: Date.now().toString(), role: ChatRole.MODEL, text: "Entendido. No se generará la imagen. ¿En qué más puedo asistirte?", timestamp: new Date() };
            addMessageToList(noGenMsg);
            setIsLoading(false);
        }
        return;
    }
    if (pendingMultiImageDescription) {
        const imagePrompt = pendingMultiImageDescription;
        setPendingMultiImageDescription(null);
        if (lowerUserMessage === 'sí' || lowerUserMessage === 'si' || lowerUserMessage === 'yes') {
            await generateAndAddImage(imagePrompt, 'Generando imagen combinada...', 'multi');
        } else {
            const noGenMsg: ChatMessage = { id: Date.now().toString(), role: ChatRole.MODEL, text: "Entendido. No se generará la imagen combinada. ¿En qué más puedo ayudarte?", timestamp: new Date() };
            addMessageToList(noGenMsg);
            setIsLoading(false);
        }
        return;
    }

    if (pendingVideoPlanDescription && (lowerUserMessage === 'sí' || lowerUserMessage === 'si' || lowerUserMessage === 'yes')) {
      const videoPlanUserPrompt = `Sí, por favor genera el plan de video detallado para el concepto: "${pendingVideoPlanDescription}".`;
      setPendingVideoPlanDescription(null);
      await streamAiResponse(videoPlanUserPrompt, chatSession); 
      return;
    } else if (pendingVideoPlanDescription && (lowerUserMessage === 'no')) {
      setPendingVideoPlanDescription(null);
      const noGenMsg: ChatMessage = { id: Date.now().toString(), role: ChatRole.MODEL, text: "Entendido. No se generará el plan de video. ¿En qué más puedo asistirte?", timestamp: new Date() };
      addMessageToList(noGenMsg);
      setIsLoading(false);
      return;
    }
    
    if (pendingImageDescription) setPendingImageDescription(null);
    if (pendingVideoPlanDescription) setPendingVideoPlanDescription(null);
    if (pendingMultiImageDescription) setPendingMultiImageDescription(null);

    let messageParts: Part[] | undefined = undefined;
    if (currentReferenceImages.length > 0) {
      messageParts = [];
      currentReferenceImages.forEach(imgData => {
        const { mimeType, data } = dataUrlToBlobBase64(imgData.dataUrl);
        messageParts!.push({ inlineData: { mimeType, data } });
      });
      messageParts.push({ text: userMessageText }); 
    }
    
    await streamAiResponse(userMessageText, chatSession, messageParts, chatContext); 
  };

  const streamAiResponse = async (promptText: string, session: Chat, parts?: Part[], currentChatContext?: string) => { 
    const aiResponseId = `ai-response-${Date.now()}`;
    setMessages(prev => [...prev, { id: aiResponseId, role: ChatRole.MODEL, text: '', isLoading: true, timestamp: new Date() }]);
    
    let fullTextResponse = '';
    let groundingMetadata: GroundingMetadata | null = null;
    
    try {
      const stream = await sendMessageStream(session, promptText, parts, currentChatContext); 
      for await (const chunk of stream) {
        const chunkText = chunk.text; 
        fullTextResponse += chunkText;
        
        if (!groundingMetadata) { 
            groundingMetadata = extractGroundingMetadata(chunk as GenerateContentResponse);
        }

        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiResponseId 
            ? { ...msg, text: fullTextResponse, isLoading: true }
            : msg
          )
        );
      }
    } catch (error) {
      console.error("Streaming error:", error);
      fullTextResponse = `Error al contactar con ${AI_NAME}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      updateLastMessage(aiResponseId, { text: fullTextResponse, isLoading: false, isError: true });
      setIsLoading(false);
      return;
    }
    
    if (groundingMetadata && groundingMetadata.groundingChunks && groundingMetadata.groundingChunks.length > 0) {
      let sourcesText = "\n\nFuentes (Google Search):";
      groundingMetadata.groundingChunks.forEach((chunk: GroundingChunk, index: number) => {
        if (chunk.web && chunk.web.uri) { 
          sourcesText += `\n${index + 1}. [${chunk.web.title || chunk.web.uri}](${chunk.web.uri})`;
        }
      });
      fullTextResponse += sourcesText;
    }

    updateLastMessage(aiResponseId, { text: fullTextResponse, isLoading: false });


    const imageConfirmationMatch = fullTextResponse.match(IMAGE_CONFIRMATION_REGEX);
    if (imageConfirmationMatch && imageConfirmationMatch[1]) {
      setPendingImageDescription(imageConfirmationMatch[1].trim());
    }

    const videoPlanConfirmationMatch = fullTextResponse.match(VIDEO_PLAN_CONFIRMATION_REGEX);
    if (videoPlanConfirmationMatch && videoPlanConfirmationMatch[1]) {
      setPendingVideoPlanDescription(videoPlanConfirmationMatch[1].trim());
    }

    const multiImageConfirmationMatch = fullTextResponse.match(MULTI_IMAGE_CONFIRMATION_REGEX);
    if (multiImageConfirmationMatch && multiImageConfirmationMatch[1]) {
      setPendingMultiImageDescription(multiImageConfirmationMatch[1].trim());
    }
        
    setIsLoading(false);
    requestAnimationFrame(adjustTextareaHeight); 
  }


  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((inputValue.trim() || referenceImagesData.length > 0) && !isLoading) {
      processUserMessage(inputValue.trim());
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 p-0 md:p-0 rounded-lg shadow-xl mt-0">
      {showCopyFeedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 text-sm">
          ¡Texto copiado al portapapeles!
        </div>
      )}
      {showReferenceFeedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-accentBlue-500 text-white px-4 py-2 rounded-md shadow-lg z-50 text-sm">
          ¡Imagen añadida como referencia!
        </div>
      )}
      <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4 p-4 md:p-2">
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            onImageClick={handleImageClick}
            onCopyText={triggerCopyFeedback}
            onUseImageAsReference={handleUseImageAsReference}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {pendingImageDescription && (
        <div className="mb-2 mx-4 md:mx-2 p-3 bg-accentBlue-100 dark:bg-accentBlue-900/50 border border-accentBlue-300 dark:border-accentBlue-700 rounded-lg text-sm text-accentBlue-700 dark:text-accentBlue-200">
          <p><span className="font-semibold">{AI_NAME}</span> está esperando tu confirmación para generar la imagen: "<em>{pendingImageDescription}</em>"</p>
          <p>Responde "Sí" o "No".</p>
        </div>
      )}
      {pendingMultiImageDescription && (
        <div className="mb-2 mx-4 md:mx-2 p-3 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-700 rounded-lg text-sm text-indigo-700 dark:text-indigo-200">
          {/* Note: Indigo is kept for multi-image for differentiation, could be accentBlue too */}
          <p><span className="font-semibold">{AI_NAME}</span> está esperando tu confirmación para generar la imagen combinada: "<em>{pendingMultiImageDescription}</em>"</p>
          <p>Responde "Sí" o "No".</p>
        </div>
      )}
      {pendingVideoPlanDescription && (
        <div className="mb-2 mx-4 md:mx-2 p-3 bg-teal-100 dark:bg-teal-900/50 border border-teal-300 dark:border-teal-700 rounded-lg text-sm text-teal-700 dark:text-teal-200">
          {/* Note: Teal is kept for video plan for differentiation, could be accentBlue too */}
          <p><span className="font-semibold">{AI_NAME}</span> está esperando tu confirmación para generar el plan de video: "<em>{pendingVideoPlanDescription}</em>"</p>
          <p>Responde "Sí" o "No".</p>
        </div>
      )}

      {referenceImagesData.length > 0 && (
        <div className="mb-2 mx-4 md:mx-2 p-3 bg-slate-200 dark:bg-slate-700/60 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Imágenes de referencia (máx. 3):</p>
          <div className="flex flex-wrap gap-2">
            {referenceImagesData.map((imgData, index) => (
              <ImageReferencePreview 
                key={index} 
                imageData={imgData} 
                onRemove={() => removeReferenceImage(index)} 
              />
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 md:gap-3 bg-white dark:bg-slate-700 p-3 rounded-b-lg md:rounded-lg shadow-md border-t border-slate-200 dark:border-slate-600">
        <button
          type="button"
          onClick={handleNewChat}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-accentBlue-600 dark:hover:text-accentBlue-400 transition-colors duration-150 self-center"
          title="Iniciar Nuevo Chat"
          aria-label="Iniciar Nuevo Chat"
        >
          <TrashIcon className="w-6 h-6" />
        </button>

        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFileSelect} 
          ref={fileInputRef}
          className="hidden" 
          id="file-upload"
        />
        <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-accentBlue-600 dark:hover:text-accentBlue-400 transition-colors duration-150 self-center"
            title="Añadir imágenes de referencia (hasta 3)"
            aria-label="Añadir imágenes de referencia"
            disabled={referenceImagesData.length >= 3 || isLoading}
        >
            <ImageIcon className="w-6 h-6" />
        </button>

        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          onPaste={handlePaste}
          placeholder={referenceImagesData.length > 0 ? `Describe cómo usar las imágenes para ${AI_NAME}...` : `Escribe tu mensaje a ${AI_NAME}...`}
          className="flex-grow p-3 bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-accentBlue-500 focus:outline-none placeholder-slate-500 dark:placeholder-slate-400 resize-none overflow-hidden min-h-[44px]"
          rows={1}
          style={{ maxHeight: `${MAX_TEXTAREA_HEIGHT}px` }}
          disabled={isLoading}
          aria-label="Entrada de mensaje"
        />
        <button
          type="submit"
          disabled={isLoading || (!inputValue.trim() && referenceImagesData.length === 0)}
          className="p-3 bg-accentBlue-600 hover:bg-accentBlue-700 text-white rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center self-center"
          aria-label={isLoading ? "Enviando mensaje" : "Enviar mensaje"}
        >
          {isLoading ? <LoadingSpinner className="w-5 h-5" /> : <SendIcon className="w-5 h-5" />}
        </button>
      </form>
      {showImageModal && modalImageUrl && (
        <ImageModal imageUrl={modalImageUrl} onClose={() => setShowImageModal(false)} />
      )}
    </div>
  );
};
