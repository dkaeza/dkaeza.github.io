/**
 * Commands.js - Manages the commands page of the dashboard
 */

class Commands {
    constructor() {
        // Bind methods
        this.loadCommands = this.loadCommands.bind(this);
        this.renderCommandsUI = this.renderCommandsUI.bind(this);
        this.renderCommandsList = this.renderCommandsList.bind(this);
        this.renderCommandEditor = this.renderCommandEditor.bind(this);
        this.handleCommandAction = this.handleCommandAction.bind(this);
        this.saveCommandChanges = this.saveCommandChanges.bind(this);
        this.createNewCommand = this.createNewCommand.bind(this);
        
        // Initialize state
        this.selectedCommand = null;
        this.filterCategory = 'All';
    }
    
    /**
     * Load and display commands page
     */
    loadCommands() {
        // Make sure we're authenticated
        if (!utils.isAuthenticated()) {
            return;
        }
        
        // Get the content area
        const contentArea = document.getElementById('content-area');
        
        // Render commands UI
        const commandsUI = this.renderCommandsUI();
        
        // Clear content area and add the commands UI
        contentArea.innerHTML = '';
        contentArea.appendChild(commandsUI);
        
        // Set up event listeners for filters
        this.setupEventListeners();
        
        // Load commands list
        this.renderCommandsList();
    }
    
    /**
     * Set up event listeners for the commands page
     */
    setupEventListeners() {
        // Category filter dropdown
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterCategory = e.target.value;
                this.renderCommandsList();
            });
        }
        
        // New command button
        const newCommandBtn = document.getElementById('new-command-btn');
        if (newCommandBtn) {
            newCommandBtn.addEventListener('click', this.createNewCommand);
        }
        
        // Search filter
        const searchInput = document.getElementById('command-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const commandItems = document.querySelectorAll('.command-item');
                
                commandItems.forEach(item => {
                    const commandName = item.querySelector('.command-name').textContent.toLowerCase();
                    const commandDesc = item.querySelector('.command-description').textContent.toLowerCase();
                    
                    if (commandName.includes(searchTerm) || commandDesc.includes(searchTerm)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
    }
    
    /**
     * Render the commands UI
     * @returns {HTMLElement} - The commands UI element
     */
    renderCommandsUI() {
        // Create commands container
        const commandsContainer = document.createElement('div');
        commandsContainer.className = 'commands-container';
        
        // Add commands header with filters
        const commandsHeader = document.createElement('div');
        commandsHeader.className = 'row mb-4 align-items-center';
        
        // Get categories from dashboard data
        const categories = ['All', ...window.dashboardManager.data.commands.categories];
        
        commandsHeader.innerHTML = `
            <div class="col-md-8 mb-3 mb-md-0">
                <div class="input-group">
                    <span class="input-group-text bg-transparent">
                        <i class="fas fa-search"></i>
                    </span>
                    <input type="text" class="form-control" id="command-search" placeholder="Search commands...">
                    <select class="form-select" id="category-filter" style="max-width: 150px;">
                        ${categories.map(category => 
                            `<option value="${category}" ${this.filterCategory === category ? 'selected' : ''}>${category}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            <div class="col-md-4 text-md-end">
                <button id="new-command-btn" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>New Command
                </button>
            </div>
        `;
        
        commandsContainer.appendChild(commandsHeader);
        
        // Create commands content area with split view
        const commandsContent = document.createElement('div');
        commandsContent.className = 'row';
        
        // Left side - Commands list
        const commandsListCol = document.createElement('div');
        commandsListCol.className = 'col-md-5 mb-4 mb-md-0';
        
        const commandsListCard = document.createElement('div');
        commandsListCard.className = 'card border-0 shadow-sm h-100';
        
        commandsListCard.innerHTML = `
            <div class="card-header bg-transparent border-0">
                <h5 class="card-title mb-0">Commands</h5>
            </div>
            <div class="card-body p-0">
                <div class="list-group list-group-flush" id="commands-list">
                    <!-- Commands will be inserted here -->
                    <div class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        commandsListCol.appendChild(commandsListCard);
        commandsContent.appendChild(commandsListCol);
        
        // Right side - Command editor
        const commandEditorCol = document.createElement('div');
        commandEditorCol.className = 'col-md-7';
        
        const commandEditorCard = document.createElement('div');
        commandEditorCard.className = 'card border-0 shadow-sm h-100';
        
        commandEditorCard.innerHTML = `
            <div class="card-header bg-transparent border-0">
                <h5 class="card-title mb-0">Command Editor</h5>
            </div>
            <div class="card-body" id="command-editor">
                <!-- Command editor will be inserted here -->
                <div class="text-center py-5">
                    <p class="text-muted">Select a command to edit or create a new one</p>
                </div>
            </div>
        `;
        
        commandEditorCol.appendChild(commandEditorCard);
        commandsContent.appendChild(commandEditorCol);
        
        commandsContainer.appendChild(commandsContent);
        
        return commandsContainer;
    }
    
    /**
     * Render the commands list
     */
    renderCommandsList() {
        // Get commands data from dashboard
        const commands = window.dashboardManager.data.commands.list;
        
        // Get the commands list element
        const commandsList = document.getElementById('commands-list');
        
        // Filter commands by category if needed
        let filteredCommands = commands;
        if (this.filterCategory !== 'All') {
            filteredCommands = commands.filter(command => command.category === this.filterCategory);
        }
        
        // Sort commands by name
        filteredCommands.sort((a, b) => a.name.localeCompare(b.name));
        
        // Clear the commands list
        commandsList.innerHTML = '';
        
        // Add each command to the list
        if (filteredCommands.length === 0) {
            commandsList.innerHTML = `
                <div class="text-center py-5">
                    <p class="text-muted">No commands found</p>
                </div>
            `;
        } else {
            filteredCommands.forEach(command => {
                const commandItem = document.createElement('a');
                commandItem.href = '#';
                commandItem.className = `list-group-item list-group-item-action command-item ${command.id === this.selectedCommand?.id ? 'active' : ''}`;
                commandItem.dataset.commandId = command.id;
                
                commandItem.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="d-flex align-items-center">
                                <h6 class="mb-0 command-name">${command.name}</h6>
                                <span class="ms-2 badge ${command.enabled ? 'bg-success' : 'bg-danger'}">
                                    ${command.enabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                            <small class="text-muted command-description">${command.description}</small>
                        </div>
                        <span class="tag">${command.category}</span>
                    </div>
                `;
                
                // Add click event listener
                commandItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Remove active class from all command items
                    document.querySelectorAll('.command-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active class to this command item
                    commandItem.classList.add('active');
                    
                    // Set selected command
                    this.selectedCommand = command;
                    
                    // Load command editor
                    this.renderCommandEditor();
                });
                
                commandsList.appendChild(commandItem);
            });
        }
    }
    
    /**
     * Render the command editor
     */
    renderCommandEditor() {
        // Get the command editor element
        const commandEditor = document.getElementById('command-editor');
        
        // If no command is selected, show a message
        if (!this.selectedCommand) {
            commandEditor.innerHTML = `
                <div class="text-center py-5">
                    <p class="text-muted">Select a command to edit or create a new one</p>
                </div>
            `;
            return;
        }
        
        // Get categories from dashboard data
        const categories = window.dashboardManager.data.commands.categories;
        
        // Create command editor form
        commandEditor.innerHTML = `
            <form id="command-editor-form">
                <div class="mb-3">
                    <label for="command-name" class="form-label">Command Name</label>
                    <input type="text" class="form-control" id="command-name" value="${this.selectedCommand.name}">
                </div>
                
                <div class="mb-3">
                    <label for="command-description" class="form-label">Description</label>
                    <textarea class="form-control" id="command-description" rows="2">${this.selectedCommand.description}</textarea>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="command-category" class="form-label">Category</label>
                        <select class="form-select" id="command-category">
                            ${categories.map(category => 
                                `<option value="${category}" ${this.selectedCommand.category === category ? 'selected' : ''}>${category}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="col-md-6">
                        <label for="command-cooldown" class="form-label">Cooldown (seconds)</label>
                        <input type="number" class="form-control" id="command-cooldown" min="0" value="${this.selectedCommand.cooldown}">
                    </div>
                </div>
                
                <div class="mb-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="command-enabled" ${this.selectedCommand.enabled ? 'checked' : ''}>
                        <label class="form-check-label" for="command-enabled">Command Enabled</label>
                    </div>
                </div>
                
                <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-danger" data-action="delete">
                        <i class="fas fa-trash me-2"></i>Delete
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
        
        // Add event listeners to buttons
        commandEditor.querySelectorAll('button[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleCommandAction(e.target.dataset.action);
            });
        });
    }
    
    /**
     * Handle command actions (save, delete, cancel)
     * @param {string} action - The action to perform
     */
    handleCommandAction(action) {
        switch (action) {
            case 'save':
                this.saveCommandChanges();
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this command?')) {
                    this.deleteCommand();
                }
                break;
            case 'cancel':
                if (this.selectedCommand.id === 'new') {
                    this.selectedCommand = null;
                }
                this.renderCommandEditor();
                this.renderCommandsList();
                break;
        }
    }
    
    /**
     * Save changes to a command
     */
    saveCommandChanges() {
        // Get form values
        const nameInput = document.getElementById('command-name');
        const descriptionInput = document.getElementById('command-description');
        const categorySelect = document.getElementById('command-category');
        const cooldownInput = document.getElementById('command-cooldown');
        const enabledCheckbox = document.getElementById('command-enabled');
        
        // Validate inputs
        if (!nameInput.value.trim()) {
            utils.showError('Command name cannot be empty');
            nameInput.focus();
            return;
        }
        
        if (!descriptionInput.value.trim()) {
            utils.showError('Command description cannot be empty');
            descriptionInput.focus();
            return;
        }
        
        // Get commands data
        const commands = window.dashboardManager.data.commands.list;
        
        // If this is a new command, create a new ID
        if (this.selectedCommand.id === 'new') {
            // Check if name already exists
            if (commands.some(cmd => cmd.name.toLowerCase() === nameInput.value.toLowerCase())) {
                utils.showError('A command with this name already exists');
                nameInput.focus();
                return;
            }
            
            // Create a new command object
            const newCommand = {
                id: utils.generateId(),
                name: nameInput.value.trim(),
                description: descriptionInput.value.trim(),
                category: categorySelect.value,
                cooldown: parseInt(cooldownInput.value),
                enabled: enabledCheckbox.checked
            };
            
            // Add to commands list
            commands.push(newCommand);
            
            // Update selected command
            this.selectedCommand = newCommand;
            
            // Show success message
            utils.showSuccess('Command created successfully');
        } else {
            // Check if name already exists (excluding this command)
            if (nameInput.value.toLowerCase() !== this.selectedCommand.name.toLowerCase() &&
                commands.some(cmd => cmd.name.toLowerCase() === nameInput.value.toLowerCase())) {
                utils.showError('A command with this name already exists');
                nameInput.focus();
                return;
            }
            
            // Find the command in the list
            const commandIndex = commands.findIndex(cmd => cmd.id === this.selectedCommand.id);
            
            if (commandIndex !== -1) {
                // Update command
                commands[commandIndex] = {
                    ...this.selectedCommand,
                    name: nameInput.value.trim(),
                    description: descriptionInput.value.trim(),
                    category: categorySelect.value,
                    cooldown: parseInt(cooldownInput.value),
                    enabled: enabledCheckbox.checked
                };
                
                // Update selected command
                this.selectedCommand = commands[commandIndex];
                
                // Show success message
                utils.showSuccess('Command updated successfully');
            }
        }
        
        // Save changes to localStorage
        utils.saveData('dashboard_data', window.dashboardManager.data);
        
        // Refresh commands list
        this.renderCommandsList();
    }
    
    /**
     * Delete a command
     */
    deleteCommand() {
        // Get commands data
        const commands = window.dashboardManager.data.commands.list;
        
        // Find the command in the list
        const commandIndex = commands.findIndex(cmd => cmd.id === this.selectedCommand.id);
        
        if (commandIndex !== -1) {
            // Remove command
            commands.splice(commandIndex, 1);
            
            // Clear selected command
            this.selectedCommand = null;
            
            // Save changes to localStorage
            utils.saveData('dashboard_data', window.dashboardManager.data);
            
            // Refresh commands list and editor
            this.renderCommandsList();
            this.renderCommandEditor();
            
            // Show success message
            utils.showSuccess('Command deleted successfully');
        }
    }
    
    /**
     * Create a new command
     */
    createNewCommand() {
        // Create a new command object
        this.selectedCommand = {
            id: 'new',
            name: '',
            description: '',
            category: window.dashboardManager.data.commands.categories[0],
            cooldown: 3,
            enabled: true
        };
        
        // Render command editor
        this.renderCommandEditor();
        
        // Focus on command name input
        setTimeout(() => {
            const nameInput = document.getElementById('command-name');
            if (nameInput) {
                nameInput.focus();
            }
        }, 100);
    }
}

// Initialize the Commands manager
document.addEventListener('DOMContentLoaded', () => {
    window.commandsManager = new Commands();
});
