/**
 * Dashboard.js - Main dashboard controller
 */

class Dashboard {
    constructor() {
        // Bind methods
        this.initializeDashboard = this.initializeDashboard.bind(this);
        this.loadPage = this.loadPage.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        
        // Initialize data
        this.currentPage = 'statistics';
        this.data = this.loadDashboardData();
        
        // Set up event listeners when DOM is loaded
        document.addEventListener('DOMContentLoaded', this.setupEventListeners);
    }
    
    /**
     * Set up event listeners for navigation
     */
    setupEventListeners() {
        // Navigation links
        document.getElementById('statistics-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadPage('statistics');
        });
        
        document.getElementById('commands-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadPage('commands');
        });
        
        document.getElementById('servers-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadPage('servers');
        });
        
        document.getElementById('settings-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadPage('settings');
        });
        
        // If user is authenticated on page load, initialize the dashboard
        if (utils.isAuthenticated()) {
            this.initializeDashboard();
        }
    }
    
    /**
     * Initialize the dashboard after successful login
     */
    initializeDashboard() {
        // Hide login prompt if it's visible
        document.getElementById('login-prompt').classList.add('d-none');
        
        // Initialize dashboard data if needed
        if (!this.data) {
            this.initializeDashboardData();
        }
        
        // Load the default page (statistics)
        this.loadPage('statistics');
    }
    
    /**
     * Load a specific page of the dashboard
     * @param {string} page - Page to load ('statistics', 'commands', 'servers', 'settings')
     */
    loadPage(page) {
        // Check if user is authenticated
        if (!utils.isAuthenticated()) {
            // Show login prompt
            document.getElementById('login-prompt').classList.remove('d-none');
            return;
        }
        
        // Update current page
        this.currentPage = page;
        
        // Update UI state (title and active nav link)
        const pageTitles = {
            'statistics': 'Statistics',
            'commands': 'Commands',
            'servers': 'Servers',
            'settings': 'Settings'
        };
        
        utils.updatePageState(pageTitles[page], `${page}-link`);
        
        // Clear the content area
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = '';
        
        // Show loading spinner
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'text-center py-5';
        loadingDiv.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading ${page}...</p>
        `;
        contentArea.appendChild(loadingDiv);
        
        // Load the appropriate page content
        setTimeout(() => {
            // Remove loading spinner
            contentArea.removeChild(loadingDiv);
            
            // Load page content
            switch (page) {
                case 'statistics':
                    window.statisticsManager.loadStatistics();
                    break;
                case 'commands':
                    window.commandsManager.loadCommands();
                    break;
                case 'servers':
                    window.serversManager.loadServers();
                    break;
                case 'settings':
                    window.settingsManager.loadSettings();
                    break;
                default:
                    // Default to statistics
                    window.statisticsManager.loadStatistics();
            }
        }, 500); // Simulate loading time for better UX
    }
    
    /**
     * Load dashboard data from localStorage
     * @returns {Object} - Dashboard data or null if not found
     */
    loadDashboardData() {
        return utils.loadData('dashboard_data', null);
    }
    
    /**
     * Initialize dashboard data with default values
     */
    initializeDashboardData() {
        // Create default dashboard data structure
        this.data = {
            statistics: {
                // Default statistics data
                totalServers: 25,
                totalUsers: 1250,
                totalCommands: 5678,
                uptime: Date.now() - 3600000 * 24, // 24 hours ago (simplified)
                commandsUsed: {
                    today: 347,
                    week: 2145,
                    month: 8967
                },
                // Data for charts
                commandUsageHistory: this.generateRandomChartData(7),
                serverGrowthHistory: this.generateRandomChartData(7, true),
                popularCommands: [
                    { name: 'help', count: 543 },
                    { name: 'play', count: 432 },
                    { name: 'stats', count: 321 },
                    { name: 'ban', count: 234 },
                    { name: 'kick', count: 123 }
                ]
            },
            commands: {
                // Default commands list
                list: [
                    {
                        id: '1',
                        name: 'help',
                        description: 'Shows help information about commands',
                        enabled: true,
                        cooldown: 5,
                        category: 'Utility'
                    },
                    {
                        id: '2',
                        name: 'ping',
                        description: 'Checks the bot\'s response time',
                        enabled: true,
                        cooldown: 10,
                        category: 'Utility'
                    },
                    {
                        id: '3',
                        name: 'play',
                        description: 'Plays a song from YouTube',
                        enabled: true,
                        cooldown: 3,
                        category: 'Music'
                    },
                    {
                        id: '4',
                        name: 'skip',
                        description: 'Skips the current song',
                        enabled: true,
                        cooldown: 2,
                        category: 'Music'
                    },
                    {
                        id: '5',
                        name: 'ban',
                        description: 'Bans a user from the server',
                        enabled: true,
                        cooldown: 30,
                        category: 'Moderation'
                    },
                    {
                        id: '6',
                        name: 'kick',
                        description: 'Kicks a user from the server',
                        enabled: true,
                        cooldown: 20,
                        category: 'Moderation'
                    }
                ],
                categories: ['Utility', 'Music', 'Moderation', 'Fun', 'Admin']
            },
            servers: {
                // Default servers list
                list: [
                    {
                        id: '1',
                        name: 'Gaming Community',
                        memberCount: 256,
                        icon: null,
                        joined: Date.now() - 3600000 * 24 * 30, // 30 days ago
                        commandsUsed: 1234
                    },
                    {
                        id: '2',
                        name: 'Music Lovers',
                        memberCount: 128,
                        icon: null,
                        joined: Date.now() - 3600000 * 24 * 15, // 15 days ago
                        commandsUsed: 678
                    },
                    {
                        id: '3',
                        name: 'Dev Community',
                        memberCount: 512,
                        icon: null,
                        joined: Date.now() - 3600000 * 24 * 60, // 60 days ago
                        commandsUsed: 2345
                    },
                    {
                        id: '4',
                        name: 'Anime Club',
                        memberCount: 384,
                        icon: null,
                        joined: Date.now() - 3600000 * 24 * 10, // 10 days ago
                        commandsUsed: 987
                    },
                    {
                        id: '5',
                        name: 'Bot Testing',
                        memberCount: 16,
                        icon: null,
                        joined: Date.now() - 3600000 * 24 * 5, // 5 days ago
                        commandsUsed: 345
                    }
                ]
            },
            settings: {
                // Default bot settings
                prefix: '!',
                defaultCooldown: 3,
                statusMessage: 'Serving {servers} servers!',
                statusType: 'PLAYING',
                deleteCommandMessages: true,
                respondToBots: false,
                respondToDMs: true,
                logCommands: true,
                mentionInsteadOfPrefix: false,
                language: 'english',
                disabledCategories: [],
                autoModeration: {
                    enabled: true,
                    filterInvites: true,
                    filterLinks: false,
                    filterSwearWords: true,
                    warnUsers: true,
                    autoMute: false,
                    muteTime: 5 // minutes
                }
            }
        };
        
        // Save to localStorage
        utils.saveData('dashboard_data', this.data);
    }
    
    /**
     * Generate random data for charts
     * @param {number} days - Number of days of data to generate
     * @param {boolean} isIncreasing - Whether the trend should be increasing
     * @returns {Array} - Array of data points
     */
    generateRandomChartData(days, isIncreasing = false) {
        const data = [];
        let date = new Date();
        let value = isIncreasing ? 100 : 200;
        
        for (let i = 0; i < days; i++) {
            // Calculate date for this data point
            const dataDate = new Date(date);
            dataDate.setDate(date.getDate() - (days - i - 1));
            
            // Generate a random value with an increasing trend if specified
            const change = Math.floor(Math.random() * 50) - (isIncreasing ? 5 : 25);
            value = Math.max(0, value + change);
            
            data.push({
                date: dataDate.toISOString().split('T')[0],
                value: value
            });
        }
        
        return data;
    }
}

// Initialize the Dashboard manager
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new Dashboard();
});
