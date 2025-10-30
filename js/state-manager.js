// state-manager.js - Application state management

class StateManager {
    constructor() {
        this.state = {
            // Stage 2: Upload
            rawData: null,
            fileName: '',
            rowCount: 0,
            columnCount: 0,
            columnNames: [],
            columnTypes: {},
            
            // Stage 3: Variable selection
            selectedIVs: [],
            selectedDVs: [],
            
            // Stage 4: Data quality decisions
            missingDataStrategy: {},  // {column: strategy}
            outlierDecisions: {},     // {column: decision}
            dataQualityIssues: {},
            
            // Stage 5: Transformations
            transformations: {},      // {column: transformationType}
            distributionTests: {},
            
            // Stage 6: Configuration
            config: {
                correlationMethods: {
                    pearson: true,
                    spearman: true,
                    kendall: false
                },
                calculateVIF: true,
                regressionModels: {
                    linear: true,
                    polynomial: false
                },
                assumptionTests: {
                    homoscedasticity: true,
                    independence: true,
                    normalityResiduals: true
                },
                reportDetail: 'standard',
                alpha: 0.05
            },
            
            // Results
            results: null,
            timestamp: null
        };
        
        // Current stage
        this.currentStage = 1;
        
        // Load state from localStorage if available
        this.loadState();
    }
    
    /**
     * Update state
     */
    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.saveState();
    }
    
    /**
     * Get state
     */
    getState() {
        return this.state;
    }
    
    /**
     * Get specific state value
     */
    get(key) {
        return this.state[key];
    }
    
    /**
     * Set current stage
     */
    setStage(stage) {
        this.currentStage = stage;
        this.updateStageUI();
    }
    
    /**
     * Get current stage
     */
    getStage() {
        return this.currentStage;
    }
    
    /**
     * Update stage UI
     */
    updateStageUI() {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show current section
        const sections = [
            'section-upload',
            'section-variables',
            'section-quality',
            'section-distribution',
            'section-config',
            'section-analysis',
            'section-results'
        ];
        
        if (this.currentStage <= sections.length) {
            document.getElementById(sections[this.currentStage - 1]).classList.add('active');
        }
        
        // Update stage navigation
        document.querySelectorAll('.stage').forEach((stage, index) => {
            stage.classList.remove('active', 'completed');
            if (index + 1 === this.currentStage) {
                stage.classList.add('active');
                stage.querySelector('.stage-number').setAttribute('aria-current', 'step');
            } else if (index + 1 < this.currentStage) {
                stage.classList.add('completed');
                stage.querySelector('.stage-number').removeAttribute('aria-current');
            } else {
                stage.querySelector('.stage-number').removeAttribute('aria-current');
            }
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    /**
     * Save state to localStorage
     */
    saveState() {
        try {
            // Don't save raw data (too large), only metadata
            const stateToSave = {
                ...this.state,
                rawData: null // Don't persist raw data
            };
            localStorage.setItem('eda_tool_state', JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }
    
    /**
     * Load state from localStorage
     */
    loadState() {
        try {
            const saved = localStorage.getItem('eda_tool_state');
            if (saved) {
                const loadedState = JSON.parse(saved);
                // Only load if recent (within 24 hours)
                if (loadedState.timestamp) {
                    const age = Date.now() - new Date(loadedState.timestamp).getTime();
                    if (age < 24 * 60 * 60 * 1000) {
                        this.state = { ...this.state, ...loadedState };
                        return true;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
        return false;
    }
    
    /**
     * Clear state
     */
    clearState() {
        localStorage.removeItem('eda_tool_state');
        this.state = {
            rawData: null,
            fileName: '',
            rowCount: 0,
            columnCount: 0,
            columnNames: [],
            columnTypes: {},
            selectedIVs: [],
            selectedDVs: [],
            missingDataStrategy: {},
            outlierDecisions: {},
            dataQualityIssues: {},
            transformations: {},
            distributionTests: {},
            config: {
                correlationMethods: {
                    pearson: true,
                    spearman: true,
                    kendall: false
                },
                calculateVIF: true,
                regressionModels: {
                    linear: true,
                    polynomial: false
                },
                assumptionTests: {
                    homoscedasticity: true,
                    independence: true,
                    normalityResiduals: true
                },
                reportDetail: 'standard',
                alpha: 0.05
            },
            results: null,
            timestamp: null
        };
        this.currentStage = 1;
    }
    
    /**
     * Export configuration as JSON
     */
    exportConfig() {
        const config = {
            version: '1.0.0',
            timestamp: getTimestamp(),
            fileName: this.state.fileName,
            selectedIVs: this.state.selectedIVs,
            selectedDVs: this.state.selectedDVs,
            missingDataStrategy: this.state.missingDataStrategy,
            outlierDecisions: this.state.outlierDecisions,
            transformations: this.state.transformations,
            config: this.state.config
        };
        
        return JSON.stringify(config, null, 2);
    }
    
    /**
     * Import configuration from JSON
     */
    importConfig(jsonString) {
        try {
            const config = JSON.parse(jsonString);
            
            // Validate version
            if (config.version !== '1.0.0') {
                throw new Error('Incompatible configuration version');
            }
            
            // Update state with imported config
            this.setState({
                selectedIVs: config.selectedIVs || [],
                selectedDVs: config.selectedDVs || [],
                missingDataStrategy: config.missingDataStrategy || {},
                outlierDecisions: config.outlierDecisions || {},
                transformations: config.transformations || {},
                config: { ...this.state.config, ...config.config }
            });
            
            return true;
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return false;
        }
    }
    
    /**
     * Validate state for current stage
     */
    validateStage(stage) {
        switch(stage) {
            case 2: // Variables
                return this.state.selectedIVs.length > 0 && 
                       this.state.selectedDVs.length > 0;
            case 3: // Quality
                return Object.keys(this.state.dataQualityIssues).length === 0 ||
                       this.hasResolvedQualityIssues();
            default:
                return true;
        }
    }
    
    /**
     * Check if quality issues are resolved
     */
    hasResolvedQualityIssues() {
        const issues = this.state.dataQualityIssues;
        for (let column in issues) {
            if (issues[column].missing && !this.state.missingDataStrategy[column]) {
                return false;
            }
            if (issues[column].outliers && !this.state.outlierDecisions[column]) {
                return false;
            }
        }
        return true;
    }
}

// Create global state manager instance
const stateManager = new StateManager();
