export interface BotStatus {
  isOnline: boolean;
  memberCount: number;
  guildName: string;
  activity: string;
}

export interface BotSettings {
  id: number;
  activityPrefix: string;
  activitySuffix: string;
  isOnline: boolean;
}

export interface Reaction {
  id: number;
  keyword: string;
  response: string;
  type: 'message' | 'emoji' | 'command';
  lastTriggered: string;
}

export interface Event {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

export interface CreateReactionPayload {
  keyword: string;
  response: string;
  type: 'message' | 'emoji' | 'command';
}

export interface UpdateSettingsPayload {
  activityPrefix?: string;
  activitySuffix?: string;
}
