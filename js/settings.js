/**
 * Settings.js - Manages the global bot settings page of the dashboard
 */

class Settings {
    constructor() {
        // Bind methods
        this.loadSettings = this.loadSettings.bind(this);
        this.renderSettingsUI = this.renderSettingsUI.bind(this);
        this.handleSettingsAction = this.handleSettingsAction.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
        this.resetSettings = this.resetSettings.bind(this);
    }
    
    /**
     * Load and display settings page
     */
    loadSettings() {
        // Make sure we're authenticated
        if (!utils.isAuthenticated()) {
            return;
        }
        
        // Get the content area
        const contentArea = document.getElementById('content-area');
        
        // Render settings UI
        const settingsUI = this.renderSettingsUI();
        
        // Clear content area and add the settings UI
        contentArea.innerHTML = '';
        contentArea.appendChild(settingsUI);
        
        // Add event listeners to forms and buttons
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners for the settings page
     */
    setupEventListeners() {
        // Save settings button
        const saveBtn = document.getElementById('save-settings-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', this.saveSettings);
        }
        
        // Reset settings button
        const resetBtn = document.getElementById('reset-settings-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', this.resetSettings);
        }
        
        // Export settings button
        const exportBtn = document.getElementById('export-settings-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', this.exportSettings.bind(this));
        }
        
        // Import settings button
        const importBtn = document.getElementById('import-settings-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                document.getElementById('import-file').click();
            });
        }
        
        // Import file input
        const importFile = document.getElementById('import-file');
        if (importFile) {
            importFile.addEventListener('change', this.importSettings.bind(this));
        }
    }
    
    /**
     * Render the settings UI
     * @returns {HTMLElement} - The settings UI element
     */
    renderSettingsUI() {
        // Get settings data from dashboard
        const settings = window.dashboardManager.data.settings;
        
        // Create settings container
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'settings-container';
        
        // Add settings header with actions
        const settingsHeader = document.createElement('div');
        settingsHeader.className = 'row mb-4 align-items-center';
        
        settingsHeader.innerHTML = `
            <div class="col-md-8">
                <h3 class="mb-0">Bot Settings</h3>
                <p class="text-muted mb-0">Configure global settings for your Discord bot</p>
            </div>
            <div class="col-md-4 text-md-end mt-3 mt-md-0">
                <div class="btn-group">
                    <button class="btn btn-outline-secondary" id="export-settings-btn">
                        <i class="fas fa-download me-2"></i>Export
                    </button>
                    <button class="btn btn-outline-secondary" id="import-settings-btn">
                        <i class="fas fa-upload me-2"></i>Import
                    </button>
                    <input type="file" id="import-file" style="display: none" accept=".json">
                </div>
            </div>
        `;
        
        settingsContainer.appendChild(settingsHeader);
        
        // Create settings content
        const settingsContent = document.createElement('div');
        settingsContent.className = 'row';
        
        // Settings form
        const settingsFormCol = document.createElement('div');
        settingsFormCol.className = 'col-12';
        
        const settingsCard = document.createElement('div');
        settingsCard.className = 'card border-0 shadow-sm';
        
        settingsCard.innerHTML = `
            <div class="card-body">
                <form id="settings-form">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h5 class="mb-3">General Settings</h5>
                            
                            <div class="mb-3">
                                <label for="settings-prefix" class="form-label">Default Command Prefix</label>
                                <input type="text" class="form-control" id="settings-prefix" value="${settings.prefix}">
                                <div class="form-text">The prefix used to trigger bot commands (can be overridden per server)</div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="settings-cooldown" class="form-label">Default Command Cooldown (seconds)</label>
                                <input type="number" class="form-control" id="settings-cooldown" min="0" value="${settings.defaultCooldown}">
                                <div class="form-text">Time users must wait between command uses</div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="settings-language" class="form-label">Bot Language</label>
                                <select class="form-select" id="settings-language">
                                    <option value="english" ${settings.language === 'english' ? 'selected' : ''}>English</option>
                                    <option value="french" ${settings.language === 'french' ? 'selected' : ''}>French</option>
                                    <option value="german" ${settings.language === 'german' ? 'selected' : ''}>German</option>
                                    <option value="spanish" ${settings.language === 'spanish' ? 'selected' : ''}>Spanish</option>
                                </select>
                                <div class="form-text">Language for bot responses</div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <h5 class="mb-3">Status Settings</h5>
                            
                            <div class="mb-3">
                                <label for="settings-status" class="form-label">Status Message</label>
                                <input type="text" class="form-control" id="settings-status" value="${settings.statusMessage}">
                                <div class="form-text">Use {servers} and {users} as placeholders for counts</div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="settings-status-type" class="form-label">Status Type</label>
                                <select class="form-select" id="settings-status-type">
                                    <option value="PLAYING" ${settings.statusType === 'PLAYING' ? 'selected' : ''}>Playing</option>
                                    <option value="WATCHING" ${settings.statusType === 'WATCHING' ? 'selected' : ''}>Watching</option>
                                    <option value="LISTENING" ${settings.statusType === 'LISTENING' ? 'selected' : ''}>Listening to</option>
                                    <option value="COMPETING" ${settings.statusType === 'COMPETING' ? 'selected' : ''}>Competing in</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="settings-mention-prefix" ${settings.mentionInsteadOfPrefix ? 'checked' : ''}>
                                    <label class="form-check-label" for="settings-mention-prefix">Allow Mention as Prefix</label>
                                </div>
                                <div class="form-text">Allow users to mention the bot instead of using a prefix</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-4">
                        <div class="col-12">
                            <h5 class="mb-3">Message Handling</h5>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="settings-delete-commands" ${settings.deleteCommandMessages ? 'checked' : ''}>
                                            <label class="form-check-label" for="settings-delete-commands">Delete Command Messages</label>
                                        </div>
                                        <div class="form-text">Automatically delete user messages that contain commands</div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="settings-log-commands" ${settings.logCommands ? 'checked' : ''}>
                                            <label class="form-check-label" for="settings-log-commands">Log Commands</label>
                                        </div>
                                        <div class="form-text">Log all command usage</div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="settings-respond-bots" ${settings.respondToBots ? 'checked' : ''}>
                                            <label class="form-check-label" for="settings-respond-bots">Respond to Bots</label>
                                        </div>
                                        <div class="form-text">Whether the bot should respond to other bots</div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="settings-respond-dms" ${settings.respondToDMs ? 'checked' : ''}>
                                            <label class="form-check-label" for="settings-respond-dms">Respond to DMs</label>
                                        </div>
                                        <div class="form-text">Whether the bot should respond to direct messages</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mb-4">
                        <div class="col-12">
                            <h5 class="mb-3">Command Categories</h5>
                            <p class="text-muted">Disable entire categories of commands globally</p>
                            
                            <div class="row">
                                ${window.dashboardManager.data.commands.categories.map(category => `
                                    <div class="col-md-4 mb-2">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input category-toggle" type="checkbox" id="category-${category.toLowerCase()}" 
                                                data-category="${category}" ${!settings.disabledCategories.includes(category) ? 'checked' : ''}>
                                            <label class="form-check-label" for="category-${category.toLowerCase()}">${category}</label>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between mt-4">
                        <button type="button" class="btn btn-danger" id="reset-settings-btn">
                            <i class="fas fa-undo me-2"></i>Reset to Default
                        </button>
                        
                        <button type="button" class="btn btn-primary" id="save-settings-btn">
                            <i class="fas fa-save me-2"></i>Save Changes
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        settingsFormCol.appendChild(settingsCard);
        settingsContent.appendChild(settingsFormCol);
        settingsContainer.appendChild(settingsContent);
        
        return settingsContainer;
    }
    
    /**
     * Handle settings actions (save, reset)
     * @param {string} action - The action to perform
     */
    handleSettingsAction(action) {
        switch (action) {
            case 'save':
                this.saveSettings();
                break;
            case 'reset':
                this.resetSettings();
                break;
        }
    }
    
    /**
     * Save settings
     */
    saveSettings() {
        // Get form values
        const prefix = document.getElementById('settings-prefix').value;
        const cooldown = parseInt(document.getElementById('settings-cooldown').value);
        const language = document.getElementById('settings-language').value;
        const statusMessage = document.getElementById('settings-status').value;
        const statusType = document.getElementById('settings-status-type').value;
        const mentionPrefix = document.getElementById('settings-mention-prefix').checked;
        const deleteCommands = document.getElementById('settings-delete-commands').checked;
        const logCommands = document.getElementById('settings-log-commands').checked;
        const respondBots = document.getElementById('settings-respond-bots').checked;
        const respondDMs = document.getElementById('settings-respond-dms').checked;
        
        // Get disabled categories
        const disabledCategories = [];
        document.querySelectorAll('.category-toggle').forEach(toggle => {
            if (!toggle.checked) {
                disabledCategories.push(toggle.dataset.category);
            }
        });
        
        // Validate inputs
        if (!prefix.trim()) {
            utils.showError('Command prefix cannot be empty');
            document.getElementById('settings-prefix').focus();
            return;
        }
        
        if (isNaN(cooldown) || cooldown < 0) {
            utils.showError('Cooldown must be a positive number');
            document.getElementById('settings-cooldown').focus();
            return;
        }
        
        // Update settings
        const settings = window.dashboardManager.data.settings;
        settings.prefix = prefix.trim();
        settings.defaultCooldown = cooldown;
        settings.language = language;
        settings.statusMessage = statusMessage;
        settings.statusType = statusType;
        settings.mentionInsteadOfPrefix = mentionPrefix;
        settings.deleteCommandMessages = deleteCommands;
        settings.logCommands = logCommands;
        settings.respondToBots = respondBots;
        settings.respondToDMs = respondDMs;
        settings.disabledCategories = disabledCategories;
        
        // Save to localStorage
        utils.saveData('dashboard_data', window.dashboardManager.data);
        
        // Show success message
        utils.showSuccess('Settings saved successfully');
    }
    
    /**
     * Reset settings to default
     */
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            // Default settings
            const defaultSettings = {
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
                    muteTime: 5
                }
            };
            
            // Update settings
            window.dashboardManager.data.settings = defaultSettings;
            
            // Save to localStorage
            utils.saveData('dashboard_data', window.dashboardManager.data);
            
            // Reload settings page
            this.loadSettings();
            
            // Show success message
            utils.showSuccess('Settings reset to default');
        }
    }
    
    /**
     * Export settings as JSON file
     */
    exportSettings() {
        // Get settings data
        const settings = window.dashboardManager.data.settings;
        
        // Convert to JSON string
        const settingsJson = JSON.stringify(settings, null, 2);
        
        // Create a blob
        const blob = new Blob([settingsJson], { type: 'application/json' });
        
        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'discord_bot_settings.json';
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }
    
    /**
     * Import settings from JSON file
     * @param {Event} event - File input change event
     */
    importSettings(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                
                // Validate imported settings
                if (!settings || typeof settings !== 'object') {
                    throw new Error('Invalid settings format');
                }
                
                // Update settings
                window.dashboardManager.data.settings = {
                    ...window.dashboardManager.data.settings,
                    ...settings
                };
                
                // Save to localStorage
                utils.saveData('dashboard_data', window.dashboardManager.data);
                
                // Reload settings page
                this.loadSettings();
                
                // Show success message
                utils.showSuccess('Settings imported successfully');
            } catch (error) {
                utils.showError('Failed to import settings: ' + error.message);
            }
            
            // Reset file input
            event.target.value = '';
        };
        
        reader.onerror = () => {
            utils.showError('Failed to read file');
            
            // Reset file input
            event.target.value = '';
        };
        
        reader.readAsText(file);
    }
}

// Initialize the Settings manager
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new Settings();
});
