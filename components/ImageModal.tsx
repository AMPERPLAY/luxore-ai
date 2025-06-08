
import React from 'react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 dark:bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div 
        className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-2xl max-w-3xl max-h-[90vh] overflow-auto transition-transform duration-300 scale-95 group-hover:scale-100" // Added for entry animation
        onClick={(e) => e.stopPropagation()} 
      >
        <h2 id="image-modal-title" className="sr-only">Imagen Generada Ampliada</h2>
        <img src={imageUrl} alt="Generated Content Enlarged" className="max-w-full max-h-[calc(80vh-50px)] rounded object-contain" />
        <button
          onClick={onClose}
          className="mt-4 w-full bg-accentBlue-600 hover:bg-accentBlue-700 text-white py-2.5 px-4 rounded-md transition-colors duration-150 focus:ring-2 focus:ring-accentBlue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:outline-none"
          aria-label="Cerrar modal de imagen"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
