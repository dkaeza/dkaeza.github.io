/**
 * Statistics.js - Manages the statistics page of the dashboard
 */

class Statistics {
    constructor() {
        // Bind methods
        this.loadStatistics = this.loadStatistics.bind(this);
        this.renderStatisticsOverview = this.renderStatisticsOverview.bind(this);
        this.renderStatisticsCharts = this.renderStatisticsCharts.bind(this);
        this.renderCommandUsageChart = this.renderCommandUsageChart.bind(this);
        this.renderServerGrowthChart = this.renderServerGrowthChart.bind(this);
        this.renderPopularCommandsChart = this.renderPopularCommandsChart.bind(this);
        
        // Initialize chart instances
        this.charts = {
            commandUsage: null,
            serverGrowth: null,
            popularCommands: null
        };
    }
    
    /**
     * Load and display statistics
     */
    loadStatistics() {
        // Make sure we're authenticated
        if (!utils.isAuthenticated()) {
            return;
        }
        
        // Get the content area
        const contentArea = document.getElementById('content-area');
        
        // Create statistics container
        const statisticsContainer = document.createElement('div');
        statisticsContainer.className = 'statistics-container';
        
        // Add statistics overview section
        const overviewSection = this.renderStatisticsOverview();
        statisticsContainer.appendChild(overviewSection);
        
        // Add statistics charts section
        const chartsSection = this.renderStatisticsCharts();
        statisticsContainer.appendChild(chartsSection);
        
        // Clear content area and add the statistics container
        contentArea.innerHTML = '';
        contentArea.appendChild(statisticsContainer);
        
        // Initialize charts
        this.initializeCharts();
    }
    
    /**
     * Render the statistics overview section
     * @returns {HTMLElement} - The overview section element
     */
    renderStatisticsOverview() {
        // Get statistics data from dashboard
        const statsData = window.dashboardManager.data.statistics;
        
        // Create overview section element
        const overviewSection = document.createElement('section');
        overviewSection.className = 'mb-4';
        
        // Create overview heading
        const heading = document.createElement('h3');
        heading.className = 'mb-3';
        heading.textContent = 'Overview';
        overviewSection.appendChild(heading);
        
        // Create overview cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'row g-4';
        
        // Uptime calculation
        const uptime = new Date(statsData.uptime);
        const now = new Date();
        const uptimeDiff = now - uptime;
        const uptimeDays = Math.floor(uptimeDiff / (1000 * 60 * 60 * 24));
        const uptimeHours = Math.floor((uptimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const uptimeMinutes = Math.floor((uptimeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const uptimeText = `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`;
        
        // Define overview cards data
        const cards = [
            {
                title: 'Total Servers',
                value: utils.formatNumber(statsData.totalServers),
                icon: 'fa-server',
                color: 'primary'
            },
            {
                title: 'Total Users',
                value: utils.formatNumber(statsData.totalUsers),
                icon: 'fa-users',
                color: 'success'
            },
            {
                title: 'Commands Used',
                value: utils.formatNumber(statsData.commandsUsed.today),
                subtitle: 'Today',
                icon: 'fa-terminal',
                color: 'info'
            },
            {
                title: 'Uptime',
                value: uptimeText,
                icon: 'fa-clock',
                color: 'warning'
            }
        ];
        
        // Create each overview card
        cards.forEach(card => {
            const cardCol = document.createElement('div');
            cardCol.className = 'col-sm-6 col-xl-3';
            
            const cardDiv = document.createElement('div');
            cardDiv.className = `card stat-card border-0 shadow-sm h-100`;
            cardDiv.style.borderLeftColor = `var(--bs-${card.color})`;
            
            cardDiv.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="card-title text-muted mb-0">${card.title}</h6>
                            <h2 class="mt-2 mb-0">${card.value}</h2>
                            ${card.subtitle ? `<small class="text-muted">${card.subtitle}</small>` : ''}
                        </div>
                        <div class="icon-shape rounded-3 p-3" style="background-color: rgba(var(--bs-${card.color}-rgb), 0.1);">
                            <i class="fas ${card.icon} fa-fw" style="color: var(--bs-${card.color})"></i>
                        </div>
                    </div>
                </div>
            `;
            
            cardCol.appendChild(cardDiv);
            cardsContainer.appendChild(cardCol);
        });
        
        // Add cards container to overview section
        overviewSection.appendChild(cardsContainer);
        
        return overviewSection;
    }
    
    /**
     * Render the statistics charts section
     * @returns {HTMLElement} - The charts section element
     */
    renderStatisticsCharts() {
        // Create charts section element
        const chartsSection = document.createElement('section');
        chartsSection.className = 'mb-4';
        
        // Create charts heading
        const heading = document.createElement('h3');
        heading.className = 'mb-3';
        heading.textContent = 'Analytics';
        chartsSection.appendChild(heading);
        
        // Create charts container
        const chartsContainer = document.createElement('div');
        chartsContainer.className = 'row g-4';
        
        // Command usage chart
        const commandUsageCol = document.createElement('div');
        commandUsageCol.className = 'col-md-6';
        
        const commandUsageCard = document.createElement('div');
        commandUsageCard.className = 'card border-0 shadow-sm h-100';
        commandUsageCard.innerHTML = `
            <div class="card-header bg-transparent border-0">
                <h5 class="card-title mb-0">Command Usage</h5>
                <div class="text-muted small">Last 7 days</div>
            </div>
            <div class="card-body">
                <canvas id="commandUsageChart" height="250"></canvas>
            </div>
        `;
        
        commandUsageCol.appendChild(commandUsageCard);
        chartsContainer.appendChild(commandUsageCol);
        
        // Server growth chart
        const serverGrowthCol = document.createElement('div');
        serverGrowthCol.className = 'col-md-6';
        
        const serverGrowthCard = document.createElement('div');
        serverGrowthCard.className = 'card border-0 shadow-sm h-100';
        serverGrowthCard.innerHTML = `
            <div class="card-header bg-transparent border-0">
                <h5 class="card-title mb-0">Server Growth</h5>
                <div class="text-muted small">Last 7 days</div>
            </div>
            <div class="card-body">
                <canvas id="serverGrowthChart" height="250"></canvas>
            </div>
        `;
        
        serverGrowthCol.appendChild(serverGrowthCard);
        chartsContainer.appendChild(serverGrowthCol);
        
        // Popular commands chart
        const popularCommandsCol = document.createElement('div');
        popularCommandsCol.className = 'col-12';
        
        const popularCommandsCard = document.createElement('div');
        popularCommandsCard.className = 'card border-0 shadow-sm h-100';
        popularCommandsCard.innerHTML = `
            <div class="card-header bg-transparent border-0">
                <h5 class="card-title mb-0">Popular Commands</h5>
                <div class="text-muted small">Top 5 commands</div>
            </div>
            <div class="card-body">
                <canvas id="popularCommandsChart" height="150"></canvas>
            </div>
        `;
        
        popularCommandsCol.appendChild(popularCommandsCard);
        chartsContainer.appendChild(popularCommandsCol);
        
        // Add charts container to charts section
        chartsSection.appendChild(chartsContainer);
        
        return chartsSection;
    }
    
    /**
     * Initialize all charts
     */
    initializeCharts() {
        this.renderCommandUsageChart();
        this.renderServerGrowthChart();
        this.renderPopularCommandsChart();
    }
    
    /**
     * Render command usage chart
     */
    renderCommandUsageChart() {
        // Get chart data from dashboard
        const chartData = window.dashboardManager.data.statistics.commandUsageHistory;
        
        // Prepare data for chart
        const labels = chartData.map(item => item.date);
        const values = chartData.map(item => item.value);
        
        // Get chart context
        const ctx = document.getElementById('commandUsageChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.commandUsage) {
            this.charts.commandUsage.destroy();
        }
        
        // Create new chart
        this.charts.commandUsage = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Commands',
                    data: values,
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render server growth chart
     */
    renderServerGrowthChart() {
        // Get chart data from dashboard
        const chartData = window.dashboardManager.data.statistics.serverGrowthHistory;
        
        // Prepare data for chart
        const labels = chartData.map(item => item.date);
        const values = chartData.map(item => item.value);
        
        // Get chart context
        const ctx = document.getElementById('serverGrowthChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.serverGrowth) {
            this.charts.serverGrowth.destroy();
        }
        
        // Create new chart
        this.charts.serverGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Servers',
                    data: values,
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    borderColor: 'rgba(25, 135, 84, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render popular commands chart
     */
    renderPopularCommandsChart() {
        // Get chart data from dashboard
        const chartData = window.dashboardManager.data.statistics.popularCommands;
        
        // Prepare data for chart
        const labels = chartData.map(item => item.name);
        const values = chartData.map(item => item.count);
        
        // Define colors for bars
        const colors = [
            'rgba(13, 110, 253, 0.8)',
            'rgba(25, 135, 84, 0.8)',
            'rgba(13, 202, 240, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(220, 53, 69, 0.8)'
        ];
        
        // Get chart context
        const ctx = document.getElementById('popularCommandsChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.popularCommands) {
            this.charts.popularCommands.destroy();
        }
        
        // Create new chart
        this.charts.popularCommands = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Usage Count',
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            }
        });
    }
}

// Initialize the Statistics manager
document.addEventListener('DOMContentLoaded', () => {
    window.statisticsManager = new Statistics();
});
