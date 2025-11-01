// ui-controller.js - UI interactions and navigation

class UIController {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupModalHandlers();
    }
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // File upload
        const uploadArea = document.getElementById('upload-dropzone');
        const fileInput = document.getElementById('file-input');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                fileInput.click();
            }
        });
        
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Sample datasets
        document.getElementById('load-sample-economics').addEventListener('click', 
            () => this.loadSampleDataset('economics'));
        document.getElementById('load-sample-health').addEventListener('click',
            () => this.loadSampleDataset('health'));
        
        // Config save/load
        document.getElementById('save-config-btn').addEventListener('click',
            () => this.saveConfiguration());
        document.getElementById('load-config-btn').addEventListener('click',
            () => document.getElementById('config-input').click());
        document.getElementById('config-input').addEventListener('change',
            (e) => this.loadConfiguration(e));
        
        // Navigation buttons
        document.getElementById('next-to-variables').addEventListener('click',
            () => this.navigateToStage(2));
        document.getElementById('back-to-upload').addEventListener('click',
            () => this.navigateToStage(1));
        document.getElementById('next-to-quality').addEventListener('click',
            () => this.navigateToStage(3));
        document.getElementById('back-to-variables').addEventListener('click',
            () => this.navigateToStage(2));
        document.getElementById('next-to-distribution').addEventListener('click',
            () => this.navigateToStage(4));
        document.getElementById('back-to-quality').addEventListener('click',
            () => this.navigateToStage(3));
        document.getElementById('next-to-config').addEventListener('click',
            () => this.navigateToStage(5));
        document.getElementById('back-to-distribution').addEventListener('click',
            () => this.navigateToStage(4));
        document.getElementById('start-analysis').addEventListener('click',
            () => this.startAnalysis());
        
        // Config checkboxes
        this.setupConfigListeners();
    }
    
    /**
     * Setup configuration listeners
     */
    setupConfigListeners() {
        // Correlation methods
        document.getElementById('config-pearson').addEventListener('change', (e) => {
            stateManager.setState({
                config: {
                    ...stateManager.get('config'),
                    correlationMethods: {
                        ...stateManager.get('config').correlationMethods,
                        pearson: e.target.checked
                    }
                }
            });
        });
        
        // Similar for other config options...
        document.querySelectorAll('input[name="report-detail"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                stateManager.setState({
                    config: {
                        ...stateManager.get('config'),
                        reportDetail: e.target.value
                    }
                });
            });
        });
        
        document.querySelectorAll('input[name="alpha"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                stateManager.setState({
                    config: {
                        ...stateManager.get('config'),
                        alpha: parseFloat(e.target.value)
                    }
                });
            });
        });
    }
    
    /**
     * Setup drag and drop for file upload
     */
    setupDragAndDrop() {
        const dropzone = document.getElementById('upload-dropzone');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.add('dragover');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove('dragover');
            });
        });
        
        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect({ target: { files } });
            }
        });
    }
    
    /**
     * Setup modal handlers
     */
    setupModalHandlers() {
        const modal = document.getElementById('modal');
        const closeBtn = modal.querySelector('.modal-close');
        
        closeBtn.addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
                closeModal();
            }
        });
    }
    
    /**
     * Handle file selection
     */
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            showToast(validation.message, 'error');
            return;
        }
        
        try {
            showToast('Loading file...', 'info');
            
            // Read file
            const extension = file.name.split('.').pop().toLowerCase();
            let data;
            
            if (extension === 'csv') {
                data = await file.text();
                await loadCSVtoPython(data);
            } else {
                data = await file.arrayBuffer();
                await loadExceltoPython(data);
            }
            
            // Get DataFrame info
            const dfInfo = await getDataFrameInfo();
            
            // Update state
            stateManager.setState({
                fileName: file.name,
                rowCount: dfInfo.shape[0],
                columnCount: dfInfo.shape[1],
                columnNames: dfInfo.columns,
                columnTypes: dfInfo.dtypes,
                rawData: dfInfo.head,
                timestamp: getTimestamp()
            });
            
            // Display preview
            this.displayDataPreview(dfInfo);
            
            showToast('File loaded successfully!', 'success');
            
        } catch (error) {
            console.error('File loading error:', error);
            showToast('Failed to load file: ' + error.message, 'error');
        }
    }
    
    /**
     * Display data preview
     */
    displayDataPreview(dfInfo) {
        const preview = document.getElementById('data-preview');
        
        // Update summary
        document.getElementById('row-count').textContent = dfInfo.shape[0].toLocaleString();
        document.getElementById('col-count').textContent = dfInfo.shape[1];
        document.getElementById('numeric-count').textContent = dfInfo.numeric_columns.length;
        
        const hasMissing = Object.values(dfInfo.missing).some(count => count > 0);
        const missingIndicator = document.getElementById('missing-indicator');
        missingIndicator.textContent = hasMissing ? 'Yes' : 'No';
        missingIndicator.style.color = hasMissing ? '#ef4444' : '#10b981';
        
        // Create table
        const thead = document.getElementById('preview-thead');
        const tbody = document.getElementById('preview-tbody');
        
        // Headers
        const headerRow = document.createElement('tr');
        dfInfo.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        thead.innerHTML = '';
        thead.appendChild(headerRow);
        
        // Rows
        tbody.innerHTML = '';
        dfInfo.head.slice(0, 10).forEach(row => {
            const tr = document.createElement('tr');
            dfInfo.columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = row[col] ?? 'NaN';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        
        preview.style.display = 'block';
    }
    
    /**
     * Load sample dataset
     */
    async loadSampleDataset(type) {
        showToast('Loading sample dataset...', 'info');
        
        try {
            const response = await fetch(`assets/sample_${type}.csv`);
            const csvText = await response.text();
            
            await loadCSVtoPython(csvText);
            const dfInfo = await getDataFrameInfo();
            
            stateManager.setState({
                fileName: `sample_${type}.csv`,
                rowCount: dfInfo.shape[0],
                columnCount: dfInfo.shape[1],
                columnNames: dfInfo.columns,
                columnTypes: dfInfo.dtypes,
                rawData: dfInfo.head,
                timestamp: getTimestamp()
            });
            
            this.displayDataPreview(dfInfo);
            showToast('Sample dataset loaded!', 'success');
            
        } catch (error) {
            showToast('Failed to load sample dataset', 'error');
            console.error(error);
        }
    }
    
    /**
     * Navigate to stage
     */
    navigateToStage(stage) {
        // Validate before moving forward
        if (stage > stateManager.getStage()) {
            if (!stateManager.validateStage(stateManager.getStage())) {
                showToast('Please complete the current stage first', 'warning');
                return;
            }
        }
        
        stateManager.setStage(stage);
        
        // Load stage-specific content
        if (stage === 2) {
            this.populateVariableSelection();
        } else if (stage === 3) {
            this.runDataQualityCheck();
        } else if (stage === 4) {
            this.runDistributionAnalysis();
        }
    }
    
    /**
     * Populate variable selection
     */
    populateVariableSelection() {
        const availableList = document.getElementById('available-vars-list');
        const numericColumns = stateManager.get('columnNames')
            .filter(col => {
                const dtype = stateManager.get('columnTypes')[col];
                return dtype.includes('int') || dtype.includes('float');
            });
        
        availableList.innerHTML = '';
        numericColumns.forEach(col => {
            const chip = this.createVariableChip(col);
            availableList.appendChild(chip);
        });
        
        // Setup drag and drop for variables
        this.setupVariableDragDrop();
        
        // Load previously selected if any
        this.loadPreviousSelections();
    }
    
    /**
     * Create variable chip element
     */
    createVariableChip(colName) {
        const chip = document.createElement('div');
        chip.className = 'variable-chip';
        chip.draggable = true;
        chip.dataset.column = colName;
        chip.innerHTML = `
            <span>${colName}</span>
            <button class="remove-btn" aria-label="Remove ${colName}">×</button>
        `;
        
        chip.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeVariable(colName);
        });
        
        return chip;
    }
    
    /**
     * Setup variable drag and drop
     */
    setupVariableDragDrop() {
        const chips = document.querySelectorAll('.variable-chip');
        const dropzones = document.querySelectorAll('.dropzone');
        
        chips.forEach(chip => {
            chip.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', chip.dataset.column);
                chip.classList.add('dragging');
            });
            
            chip.addEventListener('dragend', () => {
                chip.classList.remove('dragging');
            });
            
            // Click to add
            chip.addEventListener('click', () => {
                // Prompt user to select IV or DV
                const choice = confirm('Add as Dependent Variable (OK) or Independent Variable (Cancel)?');
                const targetId = choice ? 'dependent-vars-list' : 'independent-vars-list';
                const target = document.getElementById(targetId);
                const newChip = this.createVariableChip(chip.dataset.column);
                target.appendChild(newChip);
                chip.remove();
                this.updateVariableState();
                this.validateVariableSelection();
            });
        });
        
        dropzones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('dragover');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('dragover');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('dragover');
                
                const colName = e.dataTransfer.getData('text/plain');
                const chip = this.createVariableChip(colName);
                zone.appendChild(chip);
                
                // Remove from original location
                document.querySelector(`[data-column="${colName}"]`).remove();
                
                this.updateVariableState();
                this.validateVariableSelection();
            });
        });
    }
    
    /**
     * Remove variable
     */
    removeVariable(colName) {
        const chip = document.querySelector(`[data-column="${colName}"]`);
        if (chip) {
            // Move back to available
            const availableList = document.getElementById('available-vars-list');
            const newChip = this.createVariableChip(colName);
            availableList.appendChild(newChip);
            chip.remove();
            
            this.updateVariableState();
            this.validateVariableSelection();
        }
    }
    
    /**
     * Update variable state
     */
    updateVariableState() {
        const ivs = Array.from(document.getElementById('independent-vars-list')
            .querySelectorAll('.variable-chip'))
            .map(chip => chip.dataset.column);
        
        const dvs = Array.from(document.getElementById('dependent-vars-list')
            .querySelectorAll('.variable-chip'))
            .map(chip => chip.dataset.column);
        
        stateManager.setState({
            selectedIVs: ivs,
            selectedDVs: dvs
        });
    }
    
    /**
     * Validate variable selection
     */
    validateVariableSelection() {
        const nextBtn = document.getElementById('next-to-quality');
        const valid = stateManager.validateStage(2);
        nextBtn.disabled = !valid;
    }
    
    /**
     * Load previous selections
     */
    loadPreviousSelections() {
        const ivs = stateManager.get('selectedIVs');
        const dvs = stateManager.get('selectedDVs');
        
        // Move chips to appropriate lists
        [...ivs, ...dvs].forEach(col => {
            const chip = document.querySelector(`[data-column="${col}"]`);
            if (chip) {
                const targetId = ivs.includes(col) ? 'independent-vars-list' : 'dependent-vars-list';
                document.getElementById(targetId).appendChild(chip);
            }
        });
        
        this.validateVariableSelection();
    }
    
    /**
     * Run data quality check
     */
    async runDataQualityCheck() {
        const container = document.getElementById('quality-results');
        container.innerHTML = '<p>Analyzing data quality...</p>';
        
        try {
            // Call Python to assess data quality
            const selectedColumns = [...stateManager.get('selectedIVs'), ...stateManager.get('selectedDVs')];
            setPythonVariable('selected_columns_json', JSON.stringify(selectedColumns));

            const result = await runPython(`
import json
from preprocessing import assess_data_quality

selected_columns = json.loads(selected_columns_json)
quality_report = assess_data_quality(df, selected_columns)
json.dumps(quality_report)
            `);
            
            const qualityReport = JSON.parse(result);
            stateManager.setState({ dataQualityIssues: qualityReport });
            
            this.displayQualityReport(qualityReport);
            
        } catch (error) {
            container.innerHTML = `<p class="error">Failed to assess data quality: ${error.message}</p>`;
        }
    }
    
    /**
     * Display quality report
     */
    displayQualityReport(report) {
        const container = document.getElementById('quality-results');
        
        if (Object.keys(report).length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: #d1fae5; border-radius: 8px;">
                    <h3 style="color: #10b981;">✓ No Data Quality Issues Detected</h3>
                    <p>Your data looks clean and ready for analysis!</p>
                </div>
            `;
            return;
        }
        
        let html = '<h3>Data Quality Issues Found</h3>';
        
        for (let column in report) {
            const issues = report[column];
            html += `<div class="quality-issue">
                <h4>⚠️ ${column}</h4>`;
            
            if (issues.missing_count > 0) {
                html += `
                    <p><strong>Missing Values:</strong> ${issues.missing_count} (${issues.missing_percent.toFixed(1)}%)</p>
                    <div class="issue-options">
                        <label class="radio-label">
                            <input type="radio" name="missing-${column}" value="drop" checked>
                            <span>Drop rows with missing ${column}</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="missing-${column}" value="median">
                            <span>Impute with median (${formatNumber(issues.median)})</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="missing-${column}" value="mean">
                            <span>Impute with mean (${formatNumber(issues.mean)})</span>
                        </label>
                    </div>
                    <div class="recommendation">
                        ⓘ Recommendation: Impute with median (robust to outliers)
                    </div>
                `;
            }
            
            if (issues.outlier_count > 0) {
                html += `
                    <p style="margin-top: 1rem;"><strong>Outliers:</strong> ${issues.outlier_count} extreme values detected</p>
                    <div class="issue-options">
                        <label class="radio-label">
                            <input type="radio" name="outliers-${column}" value="keep" checked>
                            <span>Keep outliers (recommended unless measurement errors)</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="outliers-${column}" value="remove">
                            <span>Remove outliers (will drop ${issues.outlier_count} rows)</span>
                        </label>
                    </div>
                `;
            }
            
            html += '</div>';
        }
        
        container.innerHTML = html;
        
        // Setup change listeners
        this.setupQualityDecisionListeners();
    }
    
    /**
     * Setup quality decision listeners
     */
    setupQualityDecisionListeners() {
        const radios = document.querySelectorAll('#quality-results input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateQualityDecisions();
            });
        });
    }
    
    /**
     * Update quality decisions
     */
    updateQualityDecisions() {
        const missingStrategy = {};
        const outlierDecisions = {};
        
        const columns = Object.keys(stateManager.get('dataQualityIssues'));
        
        columns.forEach(col => {
            const missingRadio = document.querySelector(`input[name="missing-${col}"]:checked`);
            if (missingRadio) {
                missingStrategy[col] = missingRadio.value;
            }
            
            const outlierRadio = document.querySelector(`input[name="outliers-${col}"]:checked`);
            if (outlierRadio) {
                outlierDecisions[col] = outlierRadio.value;
            }
        });
        
        stateManager.setState({
            missingDataStrategy: missingStrategy,
            outlierDecisions: outlierDecisions
        });
    }
    
    /**
     * Run distribution analysis
     */
    async runDistributionAnalysis() {
        const container = document.getElementById('distribution-results');
        container.innerHTML = '<p>Analyzing distributions...</p>';

        try {
            const selectedColumns = [...stateManager.get('selectedIVs'), ...stateManager.get('selectedDVs')];
            setPythonVariable('selected_columns_json', JSON.stringify(selectedColumns));

            const result = await runPython(`
import json
from distribution import analyze_distributions

selected_columns = json.loads(selected_columns_json)
dist_results = analyze_distributions(df, selected_columns)
json.dumps(dist_results)
            `);
            
            const distResults = JSON.parse(result);
            stateManager.setState({ distributionTests: distResults });
            
            this.displayDistributionResults(distResults);
            
        } catch (error) {
            container.innerHTML = `<p class="error">Failed to analyze distributions: ${error.message}</p>`;
        }
    }
    
    /**
     * Display distribution results
     */
    displayDistributionResults(results) {
        const container = document.getElementById('distribution-results');
        let html = '';
        
        for (let column in results) {
            const result = results[column];
            html += `
                <div style="background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3>${column}</h3>
                    <div id="hist-${column}" style="width: 100%; height: 300px;"></div>
                    <div style="margin-top: 1rem;">
                        <p><strong>Descriptive Statistics:</strong></p>
                        <ul style="margin-left: 1.5rem;">
                            <li>Mean (Average): ${formatNumber(result.mean)}</li>
                            <li>Median: ${formatNumber(result.median)}</li>
                            <li>Standard Deviation: ${formatNumber(result.std)}</li>
                            <li>Minimum: ${formatNumber(result.min)}</li>
                            <li>Maximum: ${formatNumber(result.max)}</li>
                        </ul>
                    </div>
                    <div style="margin-top: 1rem;">
                        <p><strong>Normality Tests:</strong></p>
                        <ul style="margin-left: 1.5rem;">
                            <li>Shapiro-Wilk: ${formatPValue(result.shapiro_p)} ${result.is_normal ? '✓' : '❌'}</li>
                            <li>Skewness: ${formatNumber(result.skewness)}</li>
                            <li>Kurtosis: ${formatNumber(result.kurtosis)}</li>
                        </ul>
                        ${!result.is_normal ? `
                            <div style="background: #fef3c7; padding: 1rem; border-radius: 6px; margin-top: 1rem;">
                                ⚠️ This variable is NOT normally distributed. We recommend using Spearman correlation for this variable.
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
        
        // Create plots using Plotly
        for (let column in results) {
            this.createHistogram(column, results[column].values);
        }
    }
    
    /**
     * Create histogram
     */
    createHistogram(column, values) {
        const data = [{
            x: values,
            type: 'histogram',
            marker: { color: '#2563eb' }
        }];
        
        const layout = {
            title: `Distribution of ${column}`,
            xaxis: { title: column },
            yaxis: { title: 'Frequency' },
            margin: { t: 50, b: 50, l: 50, r: 50 }
        };
        
        Plotly.newPlot(`hist-${column}`, data, layout, { responsive: true });
    }
    
    /**
     * Save configuration
     */
    saveConfiguration() {
        const configJSON = stateManager.exportConfig();
        downloadFile(configJSON, 'eda_config.json', 'application/json');
        showToast('Configuration saved!', 'success');
    }
    
    /**
     * Load configuration
     */
    loadConfiguration(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const success = stateManager.importConfig(e.target.result);
            if (success) {
                showToast('Configuration loaded!', 'success');
                // Refresh UI with loaded config
                this.refreshConfigUI();
            } else {
                showToast('Failed to load configuration', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    /**
     * Refresh config UI
     */
    refreshConfigUI() {
        const config = stateManager.get('config');
        
        document.getElementById('config-pearson').checked = config.correlationMethods.pearson;
        document.getElementById('config-spearman').checked = config.correlationMethods.spearman;
        document.getElementById('config-kendall').checked = config.correlationMethods.kendall;
        
        document.querySelector(`input[name="report-detail"][value="${config.reportDetail}"]`).checked = true;
        document.querySelector(`input[name="alpha"][value="${config.alpha}"]`).checked = true;
    }
    
    /**
     * Start analysis
     */
    async startAnalysis() {
        stateManager.setStage(6);
        
        // Run analysis in data-handler.js
        await window.dataHandler.runFullAnalysis();
    }
}

// Initialize UI controller
const uiController = new UIController();
