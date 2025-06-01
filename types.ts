
export enum ChatRole {
  USER = 'user',
  MODEL = 'model', // AI/Bot
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text?: string;
  imageUrl?: string;
  imagePrompt?: string; // Prompt used to generate the image, for alt text
  referenceImageUrls?: string[]; // URLs of images uploaded by user as reference
  isLoading?: boolean; // For AI message while generating or image being processed
  isError?: boolean;
  timestamp: Date;
  promptForConfirmation?: string; // if this message is asking for image confirmation
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  // other types of chunks if needed
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // other metadata fields if needed
}