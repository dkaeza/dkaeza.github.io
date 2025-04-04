import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { initBot, updateBotActivity, getBotStatus } from "./discord";
import { z } from "zod";
import { insertReactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the Discord bot
  initBot().catch(err => {
    console.error("Erreur lors de l'initialisation du bot Discord:", err);
  });
  
  // API Routes
  
  // Get bot status
  app.get("/api/status", async (req, res) => {
    try {
      const botSettings = await storage.getBotSettings();
      const botStatus = getBotStatus();
      
      res.json({
        isOnline: botSettings.isOnline,
        memberCount: botStatus.memberCount,
        guildName: botStatus.guildName,
        activity: `${botSettings.activityPrefix} ${botStatus.memberCount} ${botSettings.activitySuffix} ${botStatus.guildName}`
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du statut du bot:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du statut du bot" });
    }
  });
  
  // Get bot settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getBotSettings();
      res.json(settings);
    } catch (error) {
      console.error("Erreur lors de la récupération des paramètres du bot:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des paramètres du bot" });
    }
  });
  
  // Update bot settings
  app.post("/api/settings", async (req, res) => {
    try {
      const settingsSchema = z.object({
        activityPrefix: z.string().optional(),
        activitySuffix: z.string().optional(),
      });
      
      const validatedData = settingsSchema.parse(req.body);
      const updatedSettings = await storage.updateBotSettings(validatedData);
      
      // Update the bot activity with new settings
      await updateBotActivity();
      
      res.json(updatedSettings);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres du bot:", error);
      res.status(400).json({ message: error.message || "Données invalides" });
    }
  });
  
  // Get all reactions
  app.get("/api/reactions", async (req, res) => {
    try {
      const reactions = await storage.getReactions();
      res.json(reactions);
    } catch (error) {
      console.error("Erreur lors de la récupération des réactions:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des réactions" });
    }
  });
  
  // Get a specific reaction
  app.get("/api/reactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de réaction invalide" });
      }
      
      const reaction = await storage.getReaction(id);
      if (!reaction) {
        return res.status(404).json({ message: "Réaction non trouvée" });
      }
      
      res.json(reaction);
    } catch (error) {
      console.error("Erreur lors de la récupération de la réaction:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de la réaction" });
    }
  });
  
  // Create a new reaction
  app.post("/api/reactions", async (req, res) => {
    try {
      const validatedData = insertReactionSchema.parse(req.body);
      const newReaction = await storage.createReaction(validatedData);
      
      // Log event
      await storage.addEvent({
        type: "reaction_created",
        message: `Nouvelle réaction "${validatedData.keyword}" créée`
      });
      
      res.status(201).json(newReaction);
    } catch (error) {
      console.error("Erreur lors de la création de la réaction:", error);
      res.status(400).json({ message: error.message || "Données invalides" });
    }
  });
  
  // Update a reaction
  app.put("/api/reactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de réaction invalide" });
      }
      
      // Partial schema validation
      const updateSchema = z.object({
        keyword: z.string().optional(),
        response: z.string().optional(),
        type: z.enum(["message", "emoji", "command"]).optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      const updatedReaction = await storage.updateReaction(id, validatedData);
      
      if (!updatedReaction) {
        return res.status(404).json({ message: "Réaction non trouvée" });
      }
      
      // Log event
      await storage.addEvent({
        type: "reaction_updated",
        message: `Réaction "${updatedReaction.keyword}" mise à jour`
      });
      
      res.json(updatedReaction);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la réaction:", error);
      res.status(400).json({ message: error.message || "Données invalides" });
    }
  });
  
  // Delete a reaction
  app.delete("/api/reactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de réaction invalide" });
      }
      
      const reaction = await storage.getReaction(id);
      if (!reaction) {
        return res.status(404).json({ message: "Réaction non trouvée" });
      }
      
      const success = await storage.deleteReaction(id);
      
      if (success) {
        // Log event
        await storage.addEvent({
          type: "reaction_deleted",
          message: `Réaction "${reaction.keyword}" supprimée`
        });
        
        return res.status(204).send();
      } else {
        return res.status(500).json({ message: "Erreur lors de la suppression de la réaction" });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la réaction:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la réaction" });
    }
  });
  
  // Get recent events
  app.get("/api/events", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const events = await storage.getEvents(limit);
      res.json(events);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des événements" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
