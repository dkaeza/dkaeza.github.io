import { 
  users, type User, type InsertUser,
  reactions, type Reaction, type InsertReaction,
  botSettings, type BotSettings,
  events, type Event, type InsertEvent
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Reaction operations
  getReactions(): Promise<Reaction[]>;
  getReaction(id: number): Promise<Reaction | undefined>;
  createReaction(reaction: InsertReaction): Promise<Reaction>;
  updateReaction(id: number, reaction: Partial<InsertReaction>): Promise<Reaction | undefined>;
  updateReactionLastTriggered(id: number): Promise<Reaction | undefined>;
  deleteReaction(id: number): Promise<boolean>;
  
  // Bot settings operations
  getBotSettings(): Promise<BotSettings>;
  updateBotSettings(settings: Partial<BotSettings>): Promise<BotSettings>;
  
  // Event operations
  getEvents(limit?: number): Promise<Event[]>;
  addEvent(event: InsertEvent): Promise<Event>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reactions: Map<number, Reaction>;
  private settings: BotSettings;
  private events: Event[];
  private userId: number;
  private reactionId: number;
  private eventId: number;

  constructor() {
    this.users = new Map();
    this.reactions = new Map();
    this.events = [];
    this.userId = 1;
    this.reactionId = 1;
    this.eventId = 1;
    
    // Initialize with default settings
    this.settings = {
      id: 1,
      activityPrefix: "Regarde",
      activitySuffix: "sur",
      isOnline: true
    };
    
    // Add some default reactions
    this.createReaction({
      keyword: "Bonjour",
      response: "Salut ! Comment ça va ?",
      type: "message"
    });
    
    this.createReaction({
      keyword: "Merci",
      response: "👍",
      type: "emoji"
    });
    
    this.createReaction({
      keyword: "Help",
      response: "Voici les commandes disponibles...",
      type: "command"
    });
    
    // Add some default events
    this.addEvent({
      type: "bot_start",
      message: "Bot démarré avec succès"
    });
    
    this.addEvent({
      type: "reaction_triggered",
      message: "Réaction \"Bonjour\" déclenchée"
    });
    
    this.addEvent({
      type: "member_join",
      message: "Nouveau membre a rejoint le serveur"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Reaction operations
  async getReactions(): Promise<Reaction[]> {
    return Array.from(this.reactions.values());
  }
  
  async getReaction(id: number): Promise<Reaction | undefined> {
    return this.reactions.get(id);
  }
  
  async createReaction(insertReaction: InsertReaction): Promise<Reaction> {
    const id = this.reactionId++;
    const now = new Date();
    const reaction: Reaction = { ...insertReaction, id, lastTriggered: now };
    this.reactions.set(id, reaction);
    return reaction;
  }
  
  async updateReaction(id: number, updatedReaction: Partial<InsertReaction>): Promise<Reaction | undefined> {
    const reaction = this.reactions.get(id);
    if (!reaction) return undefined;
    
    const updated: Reaction = {
      ...reaction,
      ...updatedReaction
    };
    
    this.reactions.set(id, updated);
    return updated;
  }
  
  async updateReactionLastTriggered(id: number): Promise<Reaction | undefined> {
    const reaction = this.reactions.get(id);
    if (!reaction) return undefined;
    
    const updated: Reaction = {
      ...reaction,
      lastTriggered: new Date()
    };
    
    this.reactions.set(id, updated);
    return updated;
  }
  
  async deleteReaction(id: number): Promise<boolean> {
    return this.reactions.delete(id);
  }
  
  // Bot settings operations
  async getBotSettings(): Promise<BotSettings> {
    return this.settings;
  }
  
  async updateBotSettings(updatedSettings: Partial<BotSettings>): Promise<BotSettings> {
    this.settings = {
      ...this.settings,
      ...updatedSettings
    };
    return this.settings;
  }
  
  // Event operations
  async getEvents(limit: number = 10): Promise<Event[]> {
    return this.events.slice(-limit).reverse();
  }
  
  async addEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const now = new Date();
    const event: Event = { ...insertEvent, id, timestamp: now };
    this.events.push(event);
    return event;
  }
}

export const storage = new MemStorage();
