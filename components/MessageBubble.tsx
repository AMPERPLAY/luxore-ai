
import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { ChatMessage, ChatRole } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { BookIcon } from './icons/BookIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { PinIcon } from './icons/PinIcon';
import { CopyIcon } from './icons/CopyIcon';
import { AI_NAME } from '../constants';

interface MessageBubbleProps {
  message: ChatMessage;
  onImageClick: (imageUrl: string) => void;
  onCopyText: () => void;
  onUseImageAsReference: (imageUrl: string) => void;
}

// Explicit type for the props received by the custom 'code' renderer
// 'node' and 'inline' are special props from react-markdown
// React.ComponentPropsWithoutRef<'code'> provides standard HTML attributes for <code>
type CodeRendererProps = {
  node: any; // Actually 'Element' from 'hast' but 'any' simplifies here
  inline?: boolean;
} & React.ComponentPropsWithoutRef<'code'>;

const markdownComponents: Components = {
  a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-purple-500 dark:text-purple-400 hover:underline"/>,
  p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
  ol: ({node, ...props}) => <ol {...props} className="list-decimal list-inside ml-4" />,
  ul: ({node, ...props}) => <ul {...props} className="list-disc list-inside ml-4" />,
  li: ({node, ...props}) => <li {...props} className="mb-1" />,
  strong: ({node, ...props}) => <strong {...props} className="font-semibold" />,
  code: ({ node, inline, className, children, ...props }: CodeRendererProps) => {
    if (inline) {
      // Inline code
      return (
        <code
          className={`bg-slate-200 dark:bg-gray-600 px-1 py-0.5 rounded-sm text-xs ${className || ''}`.trim()}
          {...props} // Spread other HTML attributes
        >
          {children}
        </code>
      );
    } else {
      // Block code
      // className here is e.g. "language-js" or undefined if no language specified
      return (
        <pre className="bg-slate-100 dark:bg-gray-800 p-2 rounded-md overflow-x-auto my-2 text-xs">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      );
    }
  }
};

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
  message,
  onImageClick,
  onCopyText,
  onUseImageAsReference
}) => {
  const isUser = message.role === ChatRole.USER;
  const bubbleClasses = isUser
    ? 'bg-purple-600 dark:bg-purple-700 text-white self-end ml-auto'
    : 'bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-200 self-start mr-auto';

  const memoryHintText = "Puedes iniciar una nueva conversación para 'olvidar' el historial actual haciendo clic en el ícono de la papelera (Nuevo Chat). La gestión detallada de la memoria a largo plazo o el olvido selectivo de partes de la conversación actual no están implementados en esta interfaz.";

  const handleDownloadImage = () => {
    if (message.imageUrl) {
      const link = document.createElement('a');
      link.href = message.imageUrl;
      link.download = `${AI_NAME}_image_${Date.now()}.${message.imageUrl.split(';')[0].split('/')[1] || 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyText = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text)
        .then(() => {
          onCopyText(); // Trigger feedback in parent
        })
        .catch(err => console.error('Failed to copy text: ', err));
    }
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`group relative max-w-xl md:max-w-2xl p-3 md:p-4 rounded-xl shadow-md ${bubbleClasses} transition-colors duration-300`}>
        {message.isLoading && !message.text && !message.imageUrl ? (
          <div className="flex items-center space-x-2">
            <LoadingSpinner className="w-5 h-5" />
            <span>{message.role === ChatRole.MODEL ? (`${AI_NAME} está pensando...`) : 'Enviando...'}</span>
          </div>
        ) : null}

        {isUser && message.referenceImageUrls && message.referenceImageUrls.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-purple-300 dark:text-purple-200 mb-1">Imágenes de referencia enviadas:</p>
            <div className="flex flex-wrap gap-2">
              {message.referenceImageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Referencia ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-md border border-purple-400 dark:border-purple-500 cursor-pointer shadow-sm"
                  onClick={() => onImageClick(url)}
                />
              ))}
            </div>
          </div>
        )}

        {message.imageUrl && !isUser && (
          <>
            <img
              src={message.imageUrl}
              alt={message.imagePrompt || `Generated by ${AI_NAME}`}
              className="rounded-lg max-w-full h-auto cursor-pointer mt-2 shadow"
              onClick={() => onImageClick(message.imageUrl)}
              aria-label={message.imagePrompt || `Generated by ${AI_NAME}`}
              loading="lazy"
            />
            <div className="mt-2 flex space-x-2">
              <button
                onClick={handleDownloadImage}
                className="flex items-center text-xs px-2 py-1 bg-slate-200 dark:bg-gray-600 hover:bg-slate-300 dark:hover:bg-gray-500 rounded-md transition-colors text-slate-700 dark:text-gray-300"
                title="Descargar imagen"
              >
                <DownloadIcon className="w-3 h-3 mr-1" /> Descargar
              </button>
              <button
                 onClick={() => onUseImageAsReference(message.imageUrl!)}
                className="flex items-center text-xs px-2 py-1 bg-slate-200 dark:bg-gray-600 hover:bg-slate-300 dark:hover:bg-gray-500 rounded-md transition-colors text-slate-700 dark:text-gray-300"
                title="Usar como referencia"
              >
                <PinIcon className="w-3 h-3 mr-1" /> Referencia
              </button>
            </div>
          </>
        )}

        {message.text && (
          <div className={`prose prose-sm dark:prose-invert max-w-none ${isUser ? 'text-white' : 'text-slate-800 dark:text-gray-200'} ${(message.referenceImageUrls && message.referenceImageUrls.length > 0 && isUser) || (message.imageUrl && !isUser) ? 'mt-2' : ''}`}>
             {!isUser && (
                <button
                    onClick={handleCopyText}
                    className="absolute top-2 right-2 p-1.5 text-slate-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-white/50 dark:bg-gray-600/50 rounded-full"
                    title="Copiar texto"
                    aria-label="Copiar texto"
                >
                    <CopyIcon className="w-4 h-4" />
                </button>
            )}
            <ReactMarkdown components={markdownComponents}>
              {message.text}
            </ReactMarkdown>
            {message.text.includes("gestión detallada de la memoria") && !isUser && (
              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-gray-600 flex items-start text-xs text-slate-500 dark:text-gray-400">
                <BookIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{memoryHintText}</span>
              </div>
            )}
          </div>
        )}

        {message.isError && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">Error: {message.text || "Ocurrió un error."}</p>
        )}
         <div className={`text-xs mt-2 ${isUser ? 'text-purple-300 dark:text-purple-200 text-right' : 'text-slate-500 dark:text-gray-400 text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export const MessageBubble = React.memo(MessageBubbleComponent);