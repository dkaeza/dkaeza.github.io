/**
 * Servers.js - Manages the servers page of the dashboard
 */

class Servers {
    constructor() {
        // Bind methods
        this.loadServers = this.loadServers.bind(this);
        this.renderServersUI = this.renderServersUI.bind(this);
        this.renderServersList = this.renderServersList.bind(this);
        this.renderServerDetails = this.renderServerDetails.bind(this);
        this.handleServerAction = this.handleServerAction.bind(this);
        this.saveServerSettings = this.saveServerSettings.bind(this);
        
        // Initialize state
        this.selectedServer = null;
        this.searchTerm = '';
        this.sortBy = 'name';
        this.sortDirection = 'asc';
    }
    
    /**
     * Load and display servers page
     */
    loadServers() {
        // Make sure we're authenticated
        if (!utils.isAuthenticated()) {
            return;
        }
        
        // Get the content area
        const contentArea = document.getElementById('content-area');
        
        // Render servers UI
        const serversUI = this.renderServersUI();
        
        // Clear content area and add the servers UI
        contentArea.innerHTML = '';
        contentArea.appendChild(serversUI);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load servers list
        this.renderServersList();
        
        // Check if there's a previously selected server in localStorage
        const savedServerId = localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_SERVER);
        if (savedServerId) {
            const servers = window.dashboardManager.data.servers.list;
            const savedServer = servers.find(server => server.id === savedServerId);
            if (savedServer) {
                this.selectedServer = savedServer;
                this.renderServerDetails();
            }
        }
    }
    
    /**
     * Set up event listeners for the servers page
     */
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('server-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderServersList();
            });
        }
        
        // Sort options
        const sortOptions = document.querySelectorAll('.sort-option');
        if (sortOptions) {
            sortOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const sortBy = e.target.dataset.sort;
                    
                    // If already sorting by this field, toggle direction
                    if (this.sortBy === sortBy) {
                        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        this.sortBy = sortBy;
                        this.sortDirection = 'asc';
                    }
                    
                    // Update active sort in UI
                    document.querySelectorAll('.sort-option').forEach(opt => {
                        opt.classList.remove('active');
                        opt.querySelector('i').className = 'fas fa-sort ms-1';
                    });
                    
                    e.target.classList.add('active');
                    e.target.querySelector('i').className = `fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'} ms-1`;
                    
                    this.renderServersList();
                });
            });
        }
    }
    
    /**
     * Render the servers UI
     * @returns {HTMLElement} - The servers UI element
     */
    renderServersUI() {
        // Create servers container
        const serversContainer = document.createElement('div');
        serversContainer.className = 'servers-container';
        
        // Add servers header with search
        const serversHeader = document.createElement('div');
        serversHeader.className = 'row mb-4 align-items-center';
        
        serversHeader.innerHTML = `
            <div class="col-md-8 mb-3 mb-md-0">
                <div class="input-group">
                    <span class="input-group-text bg-transparent">
                        <i class="fas fa-search"></i>
                    </span>
                    <input type="text" class="form-control" id="server-search" placeholder="Search servers...">
                </div>
            </div>
            <div class="col-md-4 text-md-end">
                <div class="btn-group">
                    <button class="btn btn-outline-secondary sort-option active" data-sort="name">
                        Name <i class="fas fa-sort-up ms-1"></i>
                    </button>
                    <button class="btn btn-outline-secondary sort-option" data-sort="memberCount">
                        Members <i class="fas fa-sort ms-1"></i>
                    </button>
                    <button class="btn btn-outline-secondary sort-option" data-sort="commandsUsed">
                        Commands <i class="fas fa-sort ms-1"></i>
                    </button>
                </div>
            </div>
        `;
        
        serversContainer.appendChild(serversHeader);
        
        // Create servers content area with split view
        const serversContent = document.createElement('div');
        serversContent.className = 'row';
        
        // Left side - Servers list
        const serversListCol = document.createElement('div');
        serversListCol.className = 'col-md-5 mb-4 mb-md-0';
        
        const serversListCard = document.createElement('div');
        serversListCard.className = 'card border-0 shadow-sm h-100';
        
        serversListCard.innerHTML = `
            <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Servers</h5>
                <span class="badge bg-primary" id="servers-count">0</span>
            </div>
            <div class="card-body p-0">
                <div class="list-group list-group-flush" id="servers-list">
                    <!-- Servers will be inserted here -->
                    <div class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        serversListCol.appendChild(serversListCard);
        serversContent.appendChild(serversListCol);
        
        // Right side - Server details
        const serverDetailsCol = document.createElement('div');
        serverDetailsCol.className = 'col-md-7';
        
        const serverDetailsCard = document.createElement('div');
        serverDetailsCard.className = 'card border-0 shadow-sm h-100';
        
        serverDetailsCard.innerHTML = `
            <div class="card-header bg-transparent border-0">
                <h5 class="card-title mb-0">Server Settings</h5>
            </div>
            <div class="card-body" id="server-details">
                <!-- Server details will be inserted here -->
                <div class="text-center py-5">
                    <p class="text-muted">Select a server to view and edit settings</p>
                </div>
            </div>
        `;
        
        serverDetailsCol.appendChild(serverDetailsCard);
        serversContent.appendChild(serverDetailsCol);
        
        serversContainer.appendChild(serversContent);
        
        return serversContainer;
    }
    
    /**
     * Render the servers list
     */
    renderServersList() {
        // Get servers data from dashboard
        const servers = window.dashboardManager.data.servers.list;
        
        // Get the servers list element
        const serversList = document.getElementById('servers-list');
        const serversCount = document.getElementById('servers-count');
        
        // Filter servers by search term
        let filteredServers = servers;
        if (this.searchTerm) {
            filteredServers = servers.filter(server => 
                server.name.toLowerCase().includes(this.searchTerm)
            );
        }
        
        // Sort servers
        filteredServers.sort((a, b) => {
            let comparison = 0;
            
            switch (this.sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'memberCount':
                case 'commandsUsed':
                    comparison = a[this.sortBy] - b[this.sortBy];
                    break;
                default:
                    comparison = a.name.localeCompare(b.name);
            }
            
            // Reverse for descending order
            return this.sortDirection === 'asc' ? comparison : -comparison;
        });
        
        // Update servers count
        serversCount.textContent = filteredServers.length;
        
        // Clear the servers list
        serversList.innerHTML = '';
        
        // Add each server to the list
        if (filteredServers.length === 0) {
            serversList.innerHTML = `
                <div class="text-center py-5">
                    <p class="text-muted">No servers found</p>
                </div>
            `;
        } else {
            filteredServers.forEach(server => {
                const serverItem = document.createElement('a');
                serverItem.href = '#';
                serverItem.className = `list-group-item list-group-item-action server-item ${server.id === this.selectedServer?.id ? 'active' : ''}`;
                serverItem.dataset.serverId = server.id;
                
                serverItem.innerHTML = `
                    <div class="d-flex align-items-center">
                        <div class="server-icon me-3">
                            ${server.icon ? 
                                `<img src="${server.icon}" alt="${server.name}">` :
                                `<div class="text-center w-100"><i class="fas fa-server fa-lg"></i></div>`
                            }
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="mb-0">${server.name}</h6>
                            <div class="small text-muted d-flex justify-content-between">
                                <span><i class="fas fa-users me-1"></i> ${server.memberCount}</span>
                                <span><i class="fas fa-terminal me-1"></i> ${server.commandsUsed}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add click event listener
                serverItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Remove active class from all server items
                    document.querySelectorAll('.server-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active class to this server item
                    serverItem.classList.add('active');
                    
                    // Set selected server
                    this.selectedServer = server;
                    
                    // Save selected server ID to localStorage
                    localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_SERVER, server.id);
                    
                    // Load server details
                    this.renderServerDetails();
                });
                
                serversList.appendChild(serverItem);
            });
        }
    }
    
    /**
     * Render the server details
     */
    renderServerDetails() {
        // Get the server details element
        const serverDetails = document.getElementById('server-details');
        
        // If no server is selected, show a message
        if (!this.selectedServer) {
            serverDetails.innerHTML = `
                <div class="text-center py-5">
                    <p class="text-muted">Select a server to view and edit settings</p>
                </div>
            `;
            return;
        }
        
        // Create server details content
        serverDetails.innerHTML = `
            <div class="d-flex align-items-center mb-4">
                <div class="server-icon me-3" style="width: 64px; height: 64px;">
                    ${this.selectedServer.icon ? 
                        `<img src="${this.selectedServer.icon}" alt="${this.selectedServer.name}">` :
                        `<div class="text-center w-100"><i class="fas fa-server fa-2x"></i></div>`
                    }
                </div>
                <div>
                    <h4 class="mb-0">${this.selectedServer.name}</h4>
                    <div class="text-muted">
                        <span><i class="fas fa-users me-1"></i> ${this.selectedServer.memberCount} members</span>
                        <span class="ms-3"><i class="fas fa-calendar-alt me-1"></i> Joined ${new Date(this.selectedServer.joined).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            
            <form id="server-settings-form">
                <h5 class="mb-3">Server Settings</h5>
                
                <div class="mb-3">
                    <label for="server-prefix" class="form-label">Command Prefix</label>
                    <input type="text" class="form-control" id="server-prefix" value="${window.dashboardManager.data.settings.prefix}">
                    <div class="form-text">The prefix used to trigger bot commands in this server</div>
                </div>
                
                <div class="mb-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="server-delete-commands" ${window.dashboardManager.data.settings.deleteCommandMessages ? 'checked' : ''}>
                        <label class="form-check-label" for="server-delete-commands">Delete Command Messages</label>
                    </div>
                    <div class="form-text">Automatically delete user messages that contain commands</div>
                </div>
                
                <div class="mb-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="server-log-commands" ${window.dashboardManager.data.settings.logCommands ? 'checked' : ''}>
                        <label class="form-check-label" for="server-log-commands">Log Commands</label>
                    </div>
                    <div class="form-text">Log all command usage in a specified channel</div>
                </div>
                
                <h5 class="mb-3 mt-4">Auto Moderation</h5>
                
                <div class="mb-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="server-auto-mod" ${window.dashboardManager.data.settings.autoModeration.enabled ? 'checked' : ''}>
                        <label class="form-check-label" for="server-auto-mod">Enable Auto Moderation</label>
                    </div>
                </div>
                
                <div id="auto-mod-settings" ${!window.dashboardManager.data.settings.autoModeration.enabled ? 'style="display: none;"' : ''}>
                    <div class="mb-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="server-filter-invites" ${window.dashboardManager.data.settings.autoModeration.filterInvites ? 'checked' : ''}>
                            <label class="form-check-label" for="server-filter-invites">Filter Discord Invites</label>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="server-filter-links" ${window.dashboardManager.data.settings.autoModeration.filterLinks ? 'checked' : ''}>
                            <label class="form-check-label" for="server-filter-links">Filter Links</label>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="server-filter-swear" ${window.dashboardManager.data.settings.autoModeration.filterSwearWords ? 'checked' : ''}>
                            <label class="form-check-label" for="server-filter-swear">Filter Swear Words</label>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="server-warn-users" ${window.dashboardManager.data.settings.autoModeration.warnUsers ? 'checked' : ''}>
                            <label class="form-check-label" for="server-warn-users">Warn Users</label>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="server-auto-mute" ${window.dashboardManager.data.settings.autoModeration.autoMute ? 'checked' : ''}>
                            <label class="form-check-label" for="server-auto-mute">Auto Mute After Warnings</label>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="server-mute-time" class="form-label">Mute Duration (minutes)</label>
                        <input type="number" class="form-control" id="server-mute-time" min="1" value="${window.dashboardManager.data.settings.autoModeration.muteTime}">
                    </div>
                </div>
                
                <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-danger" data-action="leave">
                        <i class="fas fa-sign-out-alt me-2"></i>Leave Server
                    </button>
                    
                    <div>
                        <button type="button" class="btn btn-secondary me-2" data-action="cancel">
                            Cancel
                        </button>
                        <button type="button" class="btn btn-primary" data-action="save">
                            <i class="fas fa-save me-2"></i>Save Changes
                        </button>
                    </div>
                </div>
            </form>
        `;
        
        // Add event listener for auto-mod toggle
        const autoModToggle = document.getElementById('server-auto-mod');
        const autoModSettings = document.getElementById('auto-mod-settings');
        
        autoModToggle.addEventListener('change', (e) => {
            autoModSettings.style.display = e.target.checked ? '' : 'none';
        });
        
        // Add event listeners to buttons
        serverDetails.querySelectorAll('button[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleServerAction(e.target.dataset.action);
            });
        });
    }
    
    /**
     * Handle server actions (save, leave, cancel)
     * @param {string} action - The action to perform
     */
    handleServerAction(action) {
        switch (action) {
            case 'save':
                this.saveServerSettings();
                break;
            case 'leave':
                if (confirm(`Are you sure you want to leave "${this.selectedServer.name}"?`)) {
                    this.leaveServer();
                }
                break;
            case 'cancel':
                this.renderServerDetails();
                break;
        }
    }
    
    /**
     * Save server settings
     */
    saveServerSettings() {
        // Get form values
        const prefix = document.getElementById('server-prefix').value;
        const deleteCommands = document.getElementById('server-delete-commands').checked;
        const logCommands = document.getElementById('server-log-commands').checked;
        const autoModEnabled = document.getElementById('server-auto-mod').checked;
        const filterInvites = document.getElementById('server-filter-invites').checked;
        const filterLinks = document.getElementById('server-filter-links').checked;
        const filterSwear = document.getElementById('server-filter-swear').checked;
        const warnUsers = document.getElementById('server-warn-users').checked;
        const autoMute = document.getElementById('server-auto-mute').checked;
        const muteTime = parseInt(document.getElementById('server-mute-time').value) || 5;
        
        // Validate inputs
        if (!prefix.trim()) {
            utils.showError('Command prefix cannot be empty');
            document.getElementById('server-prefix').focus();
            return;
        }
        
        // Update settings
        const settings = window.dashboardManager.data.settings;
        settings.prefix = prefix.trim();
        settings.deleteCommandMessages = deleteCommands;
        settings.logCommands = logCommands;
        settings.autoModeration = {
            enabled: autoModEnabled,
            filterInvites: filterInvites,
            filterLinks: filterLinks,
            filterSwearWords: filterSwear,
            warnUsers: warnUsers,
            autoMute: autoMute,
            muteTime: muteTime
        };
        
        // Save to localStorage
        utils.saveData('dashboard_data', window.dashboardManager.data);
        
        // Show success message
        utils.showSuccess('Server settings saved successfully');
    }
    
    /**
     * Leave a server (simulated for this demo)
     */
    leaveServer() {
        // Get servers data
        const servers = window.dashboardManager.data.servers.list;
        
        // Find the server in the list
        const serverIndex = servers.findIndex(srv => srv.id === this.selectedServer.id);
        
        if (serverIndex !== -1) {
            // Remove server
            servers.splice(serverIndex, 1);
            
            // Clear selected server
            this.selectedServer = null;
            localStorage.removeItem(LOCAL_STORAGE_KEYS.SELECTED_SERVER);
            
            // Save changes to localStorage
            utils.saveData('dashboard_data', window.dashboardManager.data);
            
            // Refresh servers list and details
            this.renderServersList();
            this.renderServerDetails();
            
            // Show success message
            utils.showSuccess('Successfully left the server');
        }
    }
}

// Initialize the Servers manager
document.addEventListener('DOMContentLoaded', () => {
    window.serversManager = new Servers();
});
