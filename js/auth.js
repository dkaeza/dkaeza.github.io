/**
 * Auth.js - Handles Discord OAuth2 authentication flow
 */

// Redirect URI for Discord OAuth
const REDIRECT_URI = window.location.origin + window.location.pathname;
// Discord OAuth Client ID - This would be set by the user but for demo we use environment variables
const CLIENT_ID = ''; // You need to fill this with your Discord application client ID
// Discord OAuth scopes needed
const SCOPES = 'identify guilds bot applications.commands';

/**
 * The Auth class handles Discord OAuth2 authentication flow
 */
class Auth {
    constructor() {
        // Bind methods
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.handleAuthCallback = this.handleAuthCallback.bind(this);
        this.refreshUserInfo = this.refreshUserInfo.bind(this);
        
        // Initialize auth state
        this.initialize();
    }
    
    /**
     * Initialize auth state and UI
     */
    initialize() {
        // Set up login button listeners
        document.getElementById('login-btn').addEventListener('click', this.login);
        document.getElementById('login-prompt-btn').addEventListener('click', this.login);
        document.getElementById('logout-btn').addEventListener('click', this.logout);
        
        // Check for authorization code in URL (OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            // Handle the OAuth callback with the received code
            this.handleAuthCallback(code);
            
            // Clear the URL parameters to prevent issues on refresh
            window.history.replaceState({}, document.title, REDIRECT_URI);
        } else {
            // Check if user is already authenticated
            this.updateUIBasedOnAuth();
        }
    }
    
    /**
     * Start the OAuth2 login flow by redirecting to Discord authorization URL
     */
    login() {
        // Generate a random state for security
        const state = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('oauth_state', state);
        
        // Construct the authorization URL
        const authUrl = new URL('https://discord.com/api/oauth2/authorize');
        authUrl.searchParams.append('client_id', CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('scope', SCOPES);
        authUrl.searchParams.append('state', state);
        
        // Redirect the user to Discord's authorization page
        window.location.href = authUrl.toString();
    }
    
    /**
     * Handle the OAuth callback from Discord
     * @param {string} code - The authorization code received from Discord
     */
    async handleAuthCallback(code) {
        try {
            // Show loading spinner
            document.getElementById('login-prompt').classList.add('d-none');
            document.getElementById('loading').classList.remove('d-none');
            
            // In a real application, you would exchange the code for an access token with your backend
            // Since this is a static site without a backend, we'll simulate the token exchange
            // This is a simulated token for demonstration purposes
            const simulatedToken = 'simulated_access_token_' + Math.random().toString(36).substring(2);
            const expiresIn = 3600; // 1 hour expiration
            
            // Store the token in localStorage
            localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, simulatedToken);
            
            // Calculate and store expiration time
            const expiresAt = Date.now() + expiresIn * 1000;
            localStorage.setItem(LOCAL_STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
            
            // Fetch user information (simulated for this demo)
            await this.fetchUserInfo();
            
            // Update UI
            this.updateUIBasedOnAuth();
            
            // Hide loading spinner
            document.getElementById('loading').classList.add('d-none');
            
            // Initialize the dashboard
            window.dashboardManager.initializeDashboard();
            
            // Show success message
            utils.showSuccess('Successfully logged in with Discord!');
        } catch (error) {
            console.error('Authentication error:', error);
            
            // Hide loading spinner
            document.getElementById('loading').classList.add('d-none');
            document.getElementById('login-prompt').classList.remove('d-none');
            
            utils.showError('Authentication failed: ' + error.message);
        }
    }
    
    /**
     * Fetch user information from Discord API (simulated for static demo)
     */
    async fetchUserInfo() {
        // In a real app, you would fetch this from Discord API
        // For this static demo, we'll use simulated data
        const simulatedUserData = {
            id: '123456789012345678',
            username: 'DiscordUser',
            discriminator: '1234',
            avatar: null, // null means use default avatar
            // Simulated bot information
            bot: {
                id: '987654321098765432',
                name: 'Discord Bot',
                avatar: null
            }
        };
        
        // Store the user data in localStorage
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA, JSON.stringify(simulatedUserData));
        
        return simulatedUserData;
    }
    
    /**
     * Log out the user by removing authentication data from localStorage
     */
    logout() {
        // Clear authentication data
        localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.EXPIRES_AT);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
        
        // Update UI
        this.updateUIBasedOnAuth();
        
        // Show login prompt
        document.getElementById('login-prompt').classList.remove('d-none');
        
        // Show success message
        utils.showSuccess('Successfully logged out');
    }
    
    /**
     * Update UI elements based on authentication state
     */
    updateUIBasedOnAuth() {
        const isAuthenticated = utils.isAuthenticated();
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const loginPrompt = document.getElementById('login-prompt');
        const username = document.getElementById('username');
        const userAvatar = document.getElementById('user-avatar');
        const botName = document.getElementById('bot-name');
        const botAvatar = document.getElementById('bot-avatar');
        
        if (isAuthenticated) {
            // Show logout button, hide login button
            loginBtn.classList.add('d-none');
            logoutBtn.classList.remove('d-none');
            
            // Hide login prompt
            loginPrompt.classList.add('d-none');
            
            // Update user info
            const userData = utils.loadData(LOCAL_STORAGE_KEYS.USER_DATA, {});
            if (userData) {
                // Update username
                username.textContent = userData.username ? userData.username : 'Unknown User';
                
                // Update user avatar
                if (userData.avatar) {
                    userAvatar.innerHTML = `<img src="https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png" alt="${userData.username}">`;
                } else {
                    userAvatar.innerHTML = `<i class="fa-solid fa-user fa-lg"></i>`;
                }
                
                // Update bot name
                if (userData.bot && userData.bot.name) {
                    botName.textContent = userData.bot.name;
                } else {
                    botName.textContent = 'Discord Bot';
                }
                
                // Update bot avatar
                if (userData.bot && userData.bot.avatar) {
                    botAvatar.innerHTML = `<img src="https://cdn.discordapp.com/avatars/${userData.bot.id}/${userData.bot.avatar}.png" alt="${userData.bot.name}">`;
                } else {
                    botAvatar.innerHTML = `<i class="fa-solid fa-robot fa-3x text-info"></i>`;
                }
            }
        } else {
            // Show login button, hide logout button
            loginBtn.classList.remove('d-none');
            logoutBtn.classList.add('d-none');
            
            // Show login prompt
            loginPrompt.classList.remove('d-none');
            
            // Reset user info
            username.textContent = 'Not logged in';
            userAvatar.innerHTML = `<i class="fa-solid fa-user fa-lg"></i>`;
            
            // Reset bot info
            botName.textContent = 'Discord Bot';
            botAvatar.innerHTML = `<i class="fa-solid fa-robot fa-3x text-info"></i>`;
        }
    }
    
    /**
     * Refresh user information from Discord API (or localStorage in this demo)
     */
    refreshUserInfo() {
        // In a real application, this would make an API call to get fresh user data
        // For this static demo, we'll just update the UI based on stored data
        this.updateUIBasedOnAuth();
    }
}

// Initialize the Auth manager once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new Auth();
});
