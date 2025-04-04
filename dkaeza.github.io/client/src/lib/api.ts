import { apiRequest } from "./queryClient";
import type { 
  BotStatus, 
  BotSettings, 
  Reaction, 
  Event, 
  CreateReactionPayload,
  UpdateSettingsPayload
} from "./types";

// Bot Status
export const fetchBotStatus = async (): Promise<BotStatus> => {
  const response = await fetch('/api/status');
  if (!response.ok) {
    throw new Error('Impossible de récupérer le statut du bot');
  }
  return response.json();
};

// Bot Settings
export const fetchBotSettings = async (): Promise<BotSettings> => {
  const response = await fetch('/api/settings');
  if (!response.ok) {
    throw new Error('Impossible de récupérer les paramètres du bot');
  }
  return response.json();
};

export const updateBotSettings = async (settings: UpdateSettingsPayload): Promise<BotSettings> => {
  const response = await apiRequest('POST', '/api/settings', settings);
  return response.json();
};

// Reactions
export const fetchReactions = async (): Promise<Reaction[]> => {
  const response = await fetch('/api/reactions');
  if (!response.ok) {
    throw new Error('Impossible de récupérer les réactions');
  }
  return response.json();
};

export const createReaction = async (reaction: CreateReactionPayload): Promise<Reaction> => {
  const response = await apiRequest('POST', '/api/reactions', reaction);
  return response.json();
};

export const updateReaction = async (id: number, reaction: Partial<CreateReactionPayload>): Promise<Reaction> => {
  const response = await apiRequest('PUT', `/api/reactions/${id}`, reaction);
  return response.json();
};

export const deleteReaction = async (id: number): Promise<void> => {
  await apiRequest('DELETE', `/api/reactions/${id}`);
};

// Events
export const fetchEvents = async (limit: number = 10): Promise<Event[]> => {
  const response = await fetch(`/api/events?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Impossible de récupérer les événements');
  }
  return response.json();
};

// Utility function to format dates
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Il y a quelques secondes';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 172800) {
    return 'Hier';
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  }
};
