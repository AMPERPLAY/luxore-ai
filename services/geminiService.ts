import { GoogleGenAI, Chat, GenerateContentResponse, Part, SendMessageParameters } from "@google/genai";
import { TEXT_MODEL_NAME, IMAGE_MODEL_NAME, SYSTEM_INSTRUCTION } from '../constants';
import { GroundingMetadata, GroundingChunk } from "../types";

let ai: GoogleGenAI | undefined;
let chatInstance: Chat | null = null;

// Initialize AI instance immediately using process.env.API_KEY directly
// Vite will replace process.env.API_KEY with the actual value of VITE_API_KEY during build
const apiKeyFromEnv = process.env.API_KEY;

if (apiKeyFromEnv) {
  ai = new GoogleGenAI({ apiKey: apiKeyFromEnv });
} else {
  console.error("CRITICAL: process.env.API_KEY (expected from VITE_API_KEY) is not set after build. The Gemini API client could not be initialized.");
  // ai remains undefined, functions below will throw errors if called.
}


export const getChatInstance = (): Chat => {
  if (!ai) {
      throw new Error("Gemini AI no inicializado. Asegúrate de que VITE_API_KEY esté configurada en Vercel y sea válida.");
  }
  if (!chatInstance) {
    chatInstance = ai.chats.create({
      model: TEXT_MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatInstance;
};

export const startNewChat = (): Chat => {
  if (!ai) {
    throw new Error("Gemini AI no inicializado. Asegúrate de que VITE_API_KEY esté configurada en Vercel y sea válida.");
  }
  chatInstance = ai.chats.create({
      model: TEXT_MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
  });
  return chatInstance;
}

export const sendMessageStream = async (
  chat: Chat,
  messageText: string,
  inputParts?: Part[],
  chatContext?: string 
): Promise<AsyncIterable<GenerateContentResponse>> => {
  try {
    let textForSearchCheck = messageText;
    if (inputParts) {
        const textPart = inputParts.find(part => 'text' in part && typeof part.text === 'string') as ({ text: string } & Part) | undefined;
        if (textPart) {
            textForSearchCheck = textPart.text;
        }
    }
    
    const messageSpecificConfig: SendMessageParameters['config'] = {};
    
    const generalRequiresSearch = /noticias de hoy|últimas noticias|qué pasó con|eventos recientes en/i.test(textForSearchCheck);
    let enableGoogleSearch = generalRequiresSearch;

    if (chatContext === 'studies-financialmarkets') {
      enableGoogleSearch = true; 
    }
    
    if (enableGoogleSearch) {
      messageSpecificConfig.tools = [{googleSearch: {}}];
    }

    let messageContent: string | Part | (string | Part)[];
    if (inputParts && inputParts.length > 0) {
      messageContent = inputParts;
    } else {
      messageContent = messageText;
    }
    
    const params: SendMessageParameters = {
        message: messageContent,
    };

    if (Object.keys(messageSpecificConfig).length > 0) {
        params.config = messageSpecificConfig;
    }
    
    return await chat.sendMessageStream(params);

  } catch (error) {
    console.error("Error sending message stream:", error);
    throw error;
  }
};


export const generateImage = async (prompt: string): Promise<string> => {
  if (!ai) { 
    throw new Error("Gemini AI (para generación de imágenes) no inicializado. Asegúrate de que VITE_API_KEY esté configurada en Vercel y sea válida.");
  }

  try {
    if (!prompt || prompt.trim() === "") {
      console.error("Image generation failed: Prompt is empty.");
      throw new Error("El prompt para generar la imagen no puede estar vacío.");
    }

    console.log(`[GeminiService] Attempting to generate image with prompt: "${prompt}"`);
    const response = await ai.models.generateImages({ 
      model: IMAGE_MODEL_NAME,
      prompt: prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      console.error("[GeminiService] Image generation API call succeeded but returned no valid image data. Full response:", JSON.stringify(response, null, 2));
      
      let specificReason = "La API no devolvió datos de imagen válidos.";
      if (response && (response as any).error) {
          specificReason = `Error de la API: ${(response as any).error.message || JSON.stringify((response as any).error)}`;
      } else if (response.generatedImages && response.generatedImages.length > 0 && (response.generatedImages[0] as any).error) {
          specificReason = `Error en la imagen generada: ${ (response.generatedImages[0] as any).error.message || JSON.stringify((response.generatedImages[0] as any).error) }`;
      } else if (response.generatedImages && response.generatedImages.length === 0) {
          specificReason = "La API no generó ninguna imagen. Esto podría deberse a filtros de contenido internos de la API o a un prompt que no pudo ser procesado.";
      } else if (!response.generatedImages || response.generatedImages.length === 0) {
           specificReason = "La API no generó ninguna imagen, la respuesta no contiene 'generatedImages'. Verifique los logs para la respuesta completa.";
      }

      throw new Error(`No se pudo generar la imagen. ${specificReason}`);
    }
  } catch (error: any) {
    console.error("[GeminiService] Error in generateImage service:", error);
    let errorMessage = "Ocurrió un error desconocido durante la generación de la imagen.";
    let isQuotaError = false;
    let isBilledUserError = false;

    if (error instanceof Error && typeof error.message === 'string') {
      errorMessage = error.message; 
      if (error.message.includes("429") && error.message.toUpperCase().includes("RESOURCE_EXHAUSTED")) {
        isQuotaError = true;
      }
      if (error.message.toLowerCase().includes("only accessible to billed users")) {
        isBilledUserError = true;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
      if (error.includes("429") && error.toUpperCase().includes("RESOURCE_EXHAUSTED")) {
        isQuotaError = true;
      }
      if (error.toLowerCase().includes("only accessible to billed users")) {
        isBilledUserError = true;
      }
    } else if (error.error && typeof error.error === 'object') { 
        if (error.error.code === 429 || (typeof error.error.status === 'string' && error.error.status.toUpperCase() === "RESOURCE_EXHAUSTED")) {
            isQuotaError = true;
        }
        if (error.error.message && typeof error.error.message === 'string' && error.error.message.toLowerCase().includes("only accessible to billed users")) {
            isBilledUserError = true;
        }
        if (error.error.message) {
            errorMessage = error.error.message;
        }
    }
    
    if (isBilledUserError) {
      throw new Error("La API de generación de imágenes de Gemini (Imagen API) requiere una cuenta con facturación activa en Google Cloud. Por favor, verifica tu configuración de facturación.");
    } else if (isQuotaError) {
      throw new Error("Se ha excedido tu cuota actual para la API de generación de imágenes de Gemini (Imagen API). Por favor, revisa tu plan y detalles de facturación. Este servicio suele requerir una cuenta con facturación activa en Google Cloud. Para más información: https://ai.google.dev/gemini-api/docs/rate-limits");
    }
    
    if (errorMessage.startsWith("No se pudo generar la imagen") || errorMessage.startsWith("El prompt para generar la imagen")) {
         // No need to re-wrap
    } 
    else if (errorMessage.includes("got status:")) { 
        errorMessage = `Error de la API de Gemini: ${errorMessage}`;
    } 
    else if (error.details) { 
         errorMessage = `Error de la API de Gemini: ${error.details}`;
    } 
    else {
        errorMessage = `Error de la API de Gemini: ${errorMessage || "No se pudo procesar la solicitud."}`;
    }
    
    throw new Error(errorMessage);
  }
};

export const extractGroundingMetadata = (response: GenerateContentResponse): GroundingMetadata | null => {
  if (response.candidates && response.candidates.length > 0) {
    const candidate = response.candidates[0];
    const metadata = candidate.groundingMetadata as GroundingMetadata | undefined; 
    if (metadata && metadata.groundingChunks && metadata.groundingChunks.length > 0) {
      return metadata;
    }
  }
  return null;
};