// data-handler.js - Core data processing and analysis

class DataHandler {
    constructor() {
        this.progressSteps = [
            { id: 'step-preprocess', label: 'Data preprocessing', percent: 10 },
            { id: 'step-distribution', label: 'Distribution analysis', percent: 25 },
            { id: 'step-correlation', label: 'Correlation calculations', percent: 45 },
            { id: 'step-regression', label: 'Regression diagnostics', percent: 60 },
            { id: 'step-assumptions', label: 'Assumption testing', percent: 75 },
            { id: 'step-visualizations', label: 'Generating visualizations', percent: 85 },
            { id: 'step-report', label: 'Compiling report', percent: 95 }
        ];
    }
    
    updateProgress(stepIndex, status = 'active') {
        const step = this.progressSteps[stepIndex];
        const progressBar = document.getElementById('analysis-progress');
        const stepMessage = document.getElementById('analysis-step');
        const percentage = document.getElementById('analysis-percentage');
        
        progressBar.style.width = `${step.percent}%`;
        progressBar.setAttribute('aria-valuenow', step.percent);
        stepMessage.textContent = step.label;
        percentage.textContent = `${step.percent}%`;
        
        // Update step visual
        const stepEl = document.getElementById(step.id);
        if (stepEl) {
            const icon = stepEl.querySelector('.step-icon');
            if (status === 'completed') {
                icon.textContent = '✓';
                stepEl.classList.remove('active');
                stepEl.classList.add('completed');
            } else {
                icon.textContent = '⏳';
                stepEl.classList.add('active');
            }
        }
    }
    
    async runFullAnalysis() {
        try {
            // Step 1: Preprocess
            this.updateProgress(0);
            await this.preprocessData();
            this.updateProgress(0, 'completed');
            
            // Step 2: Distribution
            this.updateProgress(1);
            const distResults = await this.analyzeDistributions();
            this.updateProgress(1, 'completed');
            
            // Step 3: Correlation
            this.updateProgress(2);
            const corrResults = await this.calculateCorrelations();
            this.updateProgress(2, 'completed');
            
            // Step 4: Regression
            this.updateProgress(3);
            const regressionResults = await this.fitRegressionModels();
            this.updateProgress(3, 'completed');
            
            // Step 5: Assumptions
            this.updateProgress(4);
            const assumptionResults = await this.testAssumptions();
            this.updateProgress(4, 'completed');
            
            // Step 6: Visualizations
            this.updateProgress(5);
            const visualizations = await this.generateVisualizations();
            this.updateProgress(5, 'completed');
            
            // Step 7: Report
            this.updateProgress(6);
            const report = await this.generateReport({
                distributions: distResults,
                correlations: corrResults,
                regressions: regressionResults,
                assumptions: assumptionResults,
                visualizations: visualizations
            });
            this.updateProgress(6, 'completed');
            
            // Show results
            await new Promise(resolve => setTimeout(resolve, 500));
            this.displayResults(report);
            
        } catch (error) {
            console.error('Analysis error:', error);
            showToast('Analysis failed: ' + error.message, 'error');
        }
    }
    
    async preprocessData() {
        const missingStrategy = stateManager.get('missingDataStrategy');
        const outlierDecisions = stateManager.get('outlierDecisions');
        const selectedColumns = [...stateManager.get('selectedIVs'), ...stateManager.get('selectedDVs')];

        setPythonVariable('missing_strategy_json', JSON.stringify(missingStrategy));
        setPythonVariable('outlier_decisions_json', JSON.stringify(outlierDecisions));
        setPythonVariable('selected_columns_json', JSON.stringify(selectedColumns));

        await runPython(`
import json
from preprocessing import preprocess_data
selected_columns = json.loads(selected_columns_json)
missing_strategy = json.loads(missing_strategy_json)
outlier_decisions = json.loads(outlier_decisions_json)
df_clean = preprocess_data(df, selected_columns, missing_strategy, outlier_decisions)
        `);
    }
    
    async analyzeDistributions() {
        const selectedColumns = [...stateManager.get('selectedIVs'), ...stateManager.get('selectedDVs')];
        setPythonVariable('selected_columns_json', JSON.stringify(selectedColumns));

        const result = await runPython(`
import json
from distribution import analyze_distributions
selected_columns = json.loads(selected_columns_json)
dist_results = analyze_distributions(df_clean, selected_columns)
json.dumps(dist_results)
        `);
        return JSON.parse(result);
    }
    
    async calculateCorrelations() {
        const config = stateManager.get('config');
        const selectedColumns = [...stateManager.get('selectedIVs'), ...stateManager.get('selectedDVs')];

        setPythonVariable('config_json', JSON.stringify(config));
        setPythonVariable('selected_columns_json', JSON.stringify(selectedColumns));

        const result = await runPython(`
import json
from correlation import calculate_all_correlations
selected_columns = json.loads(selected_columns_json)
config = json.loads(config_json)
corr_results = calculate_all_correlations(df_clean, selected_columns, config)
json.dumps(corr_results)
        `);
        return JSON.parse(result);
    }
    
    async fitRegressionModels() {
        const ivs = stateManager.get('selectedIVs');
        const dvs = stateManager.get('selectedDVs');
        const config = stateManager.get('config');

        setPythonVariable('ivs_json', JSON.stringify(ivs));
        setPythonVariable('dvs_json', JSON.stringify(dvs));
        setPythonVariable('config_json', JSON.stringify(config));

        const result = await runPython(`
import json
from modeling import fit_all_models
ivs = json.loads(ivs_json)
dvs = json.loads(dvs_json)
config = json.loads(config_json)
regression_results = fit_all_models(df_clean, ivs, dvs, config)
json.dumps(regression_results)
        `);
        return JSON.parse(result);
    }
    
    async testAssumptions() {
        const ivs = stateManager.get('selectedIVs');
        const dvs = stateManager.get('selectedDVs');

        setPythonVariable('ivs_json', JSON.stringify(ivs));
        setPythonVariable('dvs_json', JSON.stringify(dvs));

        const result = await runPython(`
import json
from assumptions import test_all_assumptions
ivs = json.loads(ivs_json)
dvs = json.loads(dvs_json)
assumption_results = test_all_assumptions(df_clean, ivs, dvs)
json.dumps(assumption_results)
        `);
        return JSON.parse(result);
    }
    
    async generateVisualizations() {
        return {}; // Plotly visualizations created on demand
    }
    
    async generateReport(results) {
        const config = stateManager.get('config');

        setPythonVariable('all_results_json', JSON.stringify(results));
        setPythonVariable('config_json', JSON.stringify(config));

        const report = await runPython(`
import json
from report_generator import generate_html_report
all_results = json.loads(all_results_json)
config = json.loads(config_json)
report_html = generate_html_report(all_results, config, df_clean)
report_html
        `);
        return report;
    }
    
    displayResults(reportHTML) {
        stateManager.setStage(7);
        const container = document.getElementById('results-container');
        container.innerHTML = reportHTML;
        
        // Add download button
        const downloadBtn = createDownloadLink(
            reportHTML,
            `eda_report_${new Date().toISOString().split('T')[0]}.html`,
            'Download Full Report'
        );
        container.insertBefore(downloadBtn, container.firstChild);
    }
}

// Create global instance
window.dataHandler = new DataHandler();
