import { 
  Client, 
  GatewayIntentBits, 
  ActivityType, 
  Events, 
  Partials, 
  EmbedBuilder, 
  GuildMember,
  Message,
  User,
  Guild,
  ChannelType,
  REST,
  Routes,
  SlashCommandBuilder,
  CommandInteraction,
  ChatInputCommandInteraction,
  ApplicationCommandOptionType
} from 'discord.js';
import { storage } from './storage';

// Create Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [
    Partials.Message, 
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});

// Store some bot state
let currentGuildName = 'Mon Serveur';
let currentMemberCount = 0;

// Define slash commands
const commands = [
  // Commande /server simple
  new SlashCommandBuilder()
    .setName('server')
    .setDescription('Affiche les informations sur le serveur'),
  
  // Commande /user simple
  new SlashCommandBuilder()
    .setName('user')
    .setDescription('Affiche les informations sur un utilisateur')
    .addUserOption(option => 
      option
        .setName('utilisateur')
        .setDescription('L\'utilisateur dont vous souhaitez voir les informations')
        .setRequired(false)
    )
];

// Initialize the bot
export async function initBot() {
  // Token en dur pour éviter les problèmes d'environnement
  const token = 'MTM1NzYwMzAwODkyMTIwNjk0OQ.GDNZ3H.RxLjfK4gbj4c_DwDD7TvG_Kw55Sg92vkMVZ_0w';
  
  console.log('Utilisation du token Discord en dur dans le code');
  
  try {
    // Update bot status event when ready
    client.once(Events.ClientReady, async (c) => {
      console.log(`Bot prêt! Connecté en tant que ${c.user.tag}`);
      console.log(`Guildes connectées: ${client.guilds.cache.size}`);
      if (client.guilds.cache.size > 0) {
        client.guilds.cache.forEach(guild => {
          console.log(`- ${guild.name} (${guild.id}) : ${guild.memberCount} membres`);
        });
      } else {
        console.log("Le bot n'est connecté à aucun serveur.");
      }
      
      // Log event
      await storage.addEvent({
        type: 'bot_start',
        message: 'Bot démarré avec succès'
      });
      
      // Update online status
      await storage.updateBotSettings({ isOnline: true });
      
      // Enregistrer les commandes slash
      try {
        console.log('Enregistrement des commandes slash...');
        const rest = new REST().setToken(token);
        
        console.log(`Application ID: ${c.user.id}`);
        
        // Enregistrer les commandes d'abord au niveau du serveur pour un déploiement instantané
        if (client.guilds.cache.size > 0) {
          const guild = client.guilds.cache.first();
          if (guild) {
            console.log(`Enregistrement des commandes sur le serveur spécifique: ${guild.name}`);
            await rest.put(
              Routes.applicationGuildCommands(c.user.id, guild.id),
              { body: commands.map(command => command.toJSON()) }
            );
            console.log(`Commandes enregistrées sur le serveur ${guild.name}`);
          }
        }
        
        // Puis globalement pour les futurs serveurs (prend jusqu'à une heure pour être visible)
        console.log('Enregistrement des commandes globalement...');
        await rest.put(
          Routes.applicationCommands(c.user.id),
          { body: commands.map(command => command.toJSON()) }
        );
        
        console.log('Commandes slash enregistrées avec succès!');
        
        await storage.addEvent({
          type: 'slash_commands',
          message: 'Commandes slash enregistrées'
        });
      } catch (error: any) {
        console.error('Erreur lors de l\'enregistrement des commandes slash:', error);
        await storage.addEvent({
          type: 'error',
          message: `Erreur lors de l'enregistrement des commandes slash: ${error.message || "Erreur inconnue"}`
        });
      }
      
      // Update activity for the first time
      await updateBotActivity();
    });
    
    // Listen for new guild members
    client.on(Events.GuildMemberAdd, async (member) => {
      currentMemberCount = member.guild.memberCount;
      
      // Log event
      await storage.addEvent({
        type: 'member_join',
        message: 'Nouveau membre a rejoint le serveur'
      });
      
      // Update bot activity to reflect new member count
      await updateBotActivity();
    });
    
    // Listen for member removals
    client.on(Events.GuildMemberRemove, async (member) => {
      currentMemberCount = member.guild.memberCount;
      
      // Update bot activity to reflect new member count
      await updateBotActivity();
    });
    
    // Message handler for keyword reactions
    client.on(Events.MessageCreate, async (message) => {
      try {
        // Ignore messages from bots
        if (message.author.bot) return;
        
        console.log(`Message reçu: "${message.content}" de ${message.author.tag}`);
        
        // Vérifier que le message est dans un environnement où l'on peut réagir
        if (!message.guild) {
          console.log('Message reçu en DM, ignoré');
          return;
        }
        
        // Vérifier que le bot a les permissions pour répondre
        const channel = message.channel;
        if (message.guild.members.me && channel.isTextBased()) {
          // Vérifier si c'est un canal de guilde pour ne pas avoir d'erreur avec les DM
          if ('permissionsFor' in channel) {
            const permissions = channel.permissionsFor(message.guild.members.me);
            if (!permissions || !permissions.has('SendMessages')) {
              console.log('Le bot n\'a pas la permission d\'envoyer des messages dans ce canal');
              return;
            }
          }
        }
        
        // Get all reactions
        const reactions = await storage.getReactions();
        console.log(`Vérification du message avec ${reactions.length} réactions configurées`);
        
        // Check if message content matches any keywords
        for (const reaction of reactions) {
          if (message.content.toLowerCase().includes(reaction.keyword.toLowerCase())) {
            console.log(`Mot-clé "${reaction.keyword}" détecté dans le message`);
            
            // Update last triggered timestamp
            await storage.updateReactionLastTriggered(reaction.id);
            
            // Log event
            await storage.addEvent({
              type: 'reaction_triggered',
              message: `Réaction "${reaction.keyword}" déclenchée`
            });
            
            // Handle different reaction types
            try {
              switch (reaction.type) {
                case 'message':
                  await message.reply(reaction.response);
                  console.log(`Réponse envoyée: "${reaction.response}"`);
                  break;
                case 'emoji':
                  await message.react(reaction.response);
                  console.log(`Emoji ajouté: "${reaction.response}"`);
                  break;
                case 'command':
                  await message.reply(reaction.response);
                  console.log(`Commande exécutée: "${reaction.response}"`);
                  break;
              }
            } catch (error: any) {
              console.error(`Erreur lors de la réaction au message: ${error.message || "Erreur inconnue"}`);
              await storage.addEvent({
                type: 'error',
                message: `Erreur lors de la réaction: ${error.message || "Erreur inconnue"}`
              });
            }
            
            // Only trigger the first matching reaction
            break;
          }
        }
      } catch (error: any) {
        console.error(`Erreur lors du traitement du message: ${error.message || "Erreur inconnue"}`);
        await storage.addEvent({
          type: 'error',
          message: `Erreur de traitement de message: ${error.message || "Erreur inconnue"}`
        });
      }
    });
    
    // Gestionnaire des commandes slash
    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      
      try {
        // Obtenir le nom de la commande
        const { commandName } = interaction;
        console.log(`Commande slash reçue: /${commandName} de ${interaction.user.tag}`);
        
        // Commande /server
        if (commandName === 'server') {
          // Obtenir le serveur
          const guild = interaction.guild;
          if (!guild) {
            await interaction.reply({
              content: 'Cette commande ne peut être utilisée que dans un serveur.',
              ephemeral: true
            });
            return;
          }
          
          // Créer un embed avec les infos du serveur
          const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle(`Informations sur ${guild.name}`)
            .setThumbnail(guild.iconURL() || 'https://via.placeholder.com/128')
            .addFields(
              { name: 'ID du serveur', value: guild.id, inline: true },
              { name: 'Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
              { name: 'Date de création', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
              { name: 'Membres', value: `${guild.memberCount}`, inline: true },
              { name: 'Salons', value: `${guild.channels.cache.size}`, inline: true },
              { name: 'Rôles', value: `${guild.roles.cache.size}`, inline: true },
              { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: true },
              { name: 'Niveau de boost', value: `${guild.premiumTier || '0'}`, inline: true },
              { name: 'Nombre de boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true }
            )
            .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          
          // Log l'utilisation de la commande
          await storage.addEvent({
            type: 'command_used',
            message: `Commande /server utilisée par ${interaction.user.tag}`
          });
        }
        
        // Commande /user
        else if (commandName === 'user') {
          // Obtenir l'utilisateur mentionné ou l'utilisateur qui a utilisé la commande
          const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
          const guild = interaction.guild;
          
          if (!guild) {
            await interaction.reply({
              content: 'Cette commande ne peut être utilisée que dans un serveur.',
              ephemeral: true
            });
            return;
          }
          
          // Obtenir le membre de la guilde correspondant à l'utilisateur
          const member = await guild.members.fetch(targetUser.id).catch(() => null);
          if (!member) {
            await interaction.reply({
              content: 'Impossible de trouver cet utilisateur dans ce serveur.',
              ephemeral: true
            });
            return;
          }
          
          // Calculer la date d'arrivée sur le serveur
          const joinedAt = member.joinedTimestamp ? Math.floor(member.joinedTimestamp / 1000) : 0;
          
          // Calculer la date de création du compte
          const createdAt = Math.floor(member.user.createdTimestamp / 1000);
          
          // Récupérer les rôles de l'utilisateur (sans @everyone)
          const roles = member.roles.cache
            .filter(role => role.id !== guild.id)
            .map(role => `<@&${role.id}>`)
            .join(', ') || 'Aucun rôle';
          
          // Status de l'utilisateur
          const status = member.presence ? member.presence.status : 'offline';
          let statusText = 'Hors ligne';
          if (status === 'online') statusText = 'En ligne';
          if (status === 'idle') statusText = 'Inactif';
          if (status === 'dnd') statusText = 'Ne pas déranger';
          
          // Créer un embed avec les infos de l'utilisateur
          const embed = new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle(`Informations sur ${member.user.tag}`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
              { name: 'ID de l\'utilisateur', value: member.id, inline: true },
              { name: 'Compte créé le', value: `<t:${createdAt}:R>`, inline: true },
              { name: 'A rejoint le serveur', value: joinedAt ? `<t:${joinedAt}:R>` : 'Inconnu', inline: true },
              { name: 'Statut', value: statusText, inline: true },
              { name: 'Est un bot', value: member.user.bot ? 'Oui' : 'Non', inline: true },
              { name: 'Surnom', value: member.nickname || 'Aucun', inline: true },
              { name: 'Rôles', value: roles, inline: false }
            )
            .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();
          
          await interaction.reply({ embeds: [embed] });
          
          // Log l'utilisation de la commande
          await storage.addEvent({
            type: 'command_used',
            message: `Commande /user utilisée par ${interaction.user.tag}`
          });
        }
      } catch (error: any) {
        console.error(`Erreur lors de l'exécution de la commande slash: ${error.message || "Erreur inconnue"}`);
        
        // Vérifier si l'interaction a déjà été répondue
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "Une erreur s'est produite lors de l'exécution de la commande.",
            ephemeral: true
          });
        } else {
          await interaction.reply({
            content: "Une erreur s'est produite lors de l'exécution de la commande.",
            ephemeral: true
          });
        }
        
        await storage.addEvent({
          type: 'error',
          message: `Erreur de commande slash: ${error.message || "Erreur inconnue"}`
        });
      }
    });
    
    // Login to Discord
    await client.login(token);
    return true;
  } catch (error: any) {
    console.error('Erreur lors de l\'initialisation du bot :', error);
    await storage.addEvent({
      type: 'error',
      message: `Erreur lors du démarrage : ${error.message || "Erreur inconnue"}`
    });
    await storage.updateBotSettings({ isOnline: false });
    return false;
  }
}

// Helper to update the bot's activity
export async function updateBotActivity() {
  try {
    // If client is not ready yet, do nothing
    if (!client.isReady()) return;
    
    // Get settings
    const settings = await storage.getBotSettings();
    
    // If the bot is in a guild, use its information
    if (client.guilds.cache.size > 0) {
      const guild = client.guilds.cache.first();
      if (guild) {
        currentGuildName = guild.name;
        currentMemberCount = guild.memberCount;
        console.log(`Bot connecté au serveur: ${guild.name} avec ${guild.memberCount} membres`);
      }
    }
    
    // Set the activity
    client.user.setActivity({
      name: `${settings.activityPrefix} ${currentMemberCount} ${settings.activitySuffix} ${currentGuildName}`,
      type: ActivityType.Watching
    });
    
    return {
      memberCount: currentMemberCount,
      guildName: currentGuildName,
      activity: `${settings.activityPrefix} ${currentMemberCount} ${settings.activitySuffix} ${currentGuildName}`
    };
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'activité du bot :', error);
    return null;
  }
}

// Export bot status information
export function getBotStatus() {
  return {
    isOnline: client.isReady(),
    memberCount: currentMemberCount,
    guildName: currentGuildName,
  };
}
