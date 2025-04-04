/**
 * Utils.js - Utility functions for the Discord Bot Dashboard
 */

// Constants
const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';
const LOCAL_STORAGE_KEYS = {
    ACCESS_TOKEN: 'discord_access_token',
    USER_DATA: 'discord_user_data',
    BOT_SETTINGS: 'discord_bot_settings',
    COMMANDS_CONFIG: 'discord_commands_config',
    SELECTED_SERVER: 'discord_selected_server',
    EXPIRES_AT: 'discord_token_expires_at'
};

// Common utility functions
const utils = {
    /**
     * Make authenticated API request to Discord
     * @param {string} endpoint - API endpoint to call
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} - API response
     */
    async apiRequest(endpoint, options = {}) {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
        
        if (!token) {
            throw new Error('No access token found');
        }
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        try {
            const response = await fetch(`${DISCORD_API_ENDPOINT}${endpoint}`, {
                ...options,
                headers
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
            }
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    },
    
    /**
     * Show an error message to the user
     * @param {string} message - Error message to show
     * @param {boolean} isApiError - Whether this is an API error
     */
    showError(message, isApiError = false) {
        // Remove any existing error alerts
        document.querySelectorAll('.alert-danger').forEach(el => el.remove());
        
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.setAttribute('role', 'alert');
        
        let errorMessage = message;
        if (isApiError) {
            errorMessage = `API Error: ${message}`;
        }
        
        alertDiv.innerHTML = `
            <strong>Error!</strong> ${errorMessage}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to the top of the content area
        const contentArea = document.getElementById('content-area');
        contentArea.insertBefore(alertDiv, contentArea.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }, 5000);
    },
    
    /**
     * Show a success message to the user
     * @param {string} message - Success message to show
     */
    showSuccess(message) {
        // Remove any existing success alerts
        document.querySelectorAll('.alert-success').forEach(el => el.remove());
        
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.setAttribute('role', 'alert');
        
        alertDiv.innerHTML = `
            <strong>Success!</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to the top of the content area
        const contentArea = document.getElementById('content-area');
        contentArea.insertBefore(alertDiv, contentArea.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }, 5000);
    },
    
    /**
     * Format a date
     * @param {Date|string|number} date - Date to format
     * @returns {string} - Formatted date string
     */
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    },
    
    /**
     * Format a number with comma separators
     * @param {number} num - Number to format
     * @returns {string} - Formatted number string
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    /**
     * Load HTML content from a file into a target element
     * @param {string} url - URL of the HTML file
     * @param {string} targetId - ID of the target element
     * @returns {Promise<void>}
     */
    async loadHTML(url, targetId) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
            }
            
            const html = await response.text();
            document.getElementById(targetId).innerHTML = html;
        } catch (error) {
            console.error('Error loading HTML:', error);
            this.showError(`Failed to load content: ${error.message}`);
        }
    },
    
    /**
     * Check if the user is authenticated
     * @returns {boolean} - True if authenticated, false otherwise
     */
    isAuthenticated() {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
        const expiresAt = localStorage.getItem(LOCAL_STORAGE_KEYS.EXPIRES_AT);
        
        if (!token || !expiresAt) {
            return false;
        }
        
        // Check if token is expired
        if (Date.now() >= parseInt(expiresAt, 10)) {
            // Clear expired token
            localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.EXPIRES_AT);
            return false;
        }
        
        return true;
    },
    
    /**
     * Save data to localStorage with the given key
     * @param {string} key - Key to use in localStorage
     * @param {*} data - Data to save
     */
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
            this.showError(`Failed to save data: ${error.message}`);
        }
    },
    
    /**
     * Load data from localStorage with the given key
     * @param {string} key - Key to use in localStorage
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} - Loaded data or default value
     */
    loadData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError(`Failed to load data: ${error.message}`);
            return defaultValue;
        }
    },
    
    /**
     * Generate a random unique ID
     * @returns {string} - Random ID
     */
    generateId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    },
    
    /**
     * Update page title and highlight active nav link
     * @param {string} title - Page title
     * @param {string} activeNavId - ID of the active nav link
     */
    updatePageState(title, activeNavId) {
        // Update page title
        document.getElementById('page-title').textContent = title;
        
        // Update document title
        document.title = `${title} - Discord Bot Dashboard`;
        
        // Remove active class from all nav links
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to the current nav link
        const activeNavLink = document.getElementById(activeNavId);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }
    }
};

// Export utils
window.utils = utils;
