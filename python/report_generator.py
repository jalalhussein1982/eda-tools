# report_generator.py - Generate HTML analysis report

import json
import numpy as np

def generate_html_report(all_results, config, df):
    """
    Generate comprehensive HTML report
    """
    if isinstance(all_results, str):
        all_results = json.loads(all_results)
    if isinstance(config, str):
        config = json.loads(config)
    
    html = f"""
    <div class="analysis-report">
        <div class="report-header">
            <h2>📊 EDA Analysis Report</h2>
            <p class="report-meta">
                Generated: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}<br>
                Dataset: {len(df)} rows, {len(df.columns)} columns<br>
                <strong>Citation:</strong> Statistical EDA Tool (Version 1.0.0). (2025). Retrieved from [Your University URL]
            </p>
        </div>
        
        <div class="executive-summary">
            <h3>🔍 Executive Summary</h3>
            {generate_executive_summary(all_results)}
        </div>
        
        <div class="section-divider"></div>
        
        <details open>
            <summary><h3>1. Data Quality Report</h3></summary>
            {generate_quality_section(df)}
        </details>
        
        <details>
            <summary><h3>2. Distribution Analysis</h3></summary>
            {generate_distribution_section(all_results.get('distributions', {}))}
        </details>
        
        <details>
            <summary><h3>3. Correlation Analysis</h3></summary>
            {generate_correlation_section(all_results.get('correlations', {}))}
        </details>
        
        <details>
            <summary><h3>4. Regression Analysis</h3></summary>
            {generate_regression_section(all_results.get('regressions', {}))}
        </details>
        
        <details>
            <summary><h3>5. Assumption Testing</h3></summary>
            {generate_assumptions_section(all_results.get('assumptions', {}))}
        </details>
        
        <details>
            <summary><h3>6. Interpretation Guide</h3></summary>
            {generate_interpretation_guide()}
        </details>
        
        <details>
            <summary><h3>7. Recommendations & Next Steps</h3></summary>
            {generate_recommendations(all_results)}
        </details>
    </div>
    
    <style>
        .analysis-report {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
        .report-header {{ background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; }}
        .report-meta {{ opacity: 0.9; margin-top: 1rem; }}
        .executive-summary {{ background: #eff6ff; padding: 2rem; border-radius: 12px; border-left: 4px solid #2563eb; margin-bottom: 2rem; }}
        .finding {{ background: white; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }}
        .confidence-bar {{ height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 0.5rem 0; }}
        .confidence-fill {{ height: 100%; transition: width 0.3s ease; }}
        .high-confidence {{ background: #10b981; }}
        .medium-confidence {{ background: #f59e0b; }}
        .low-confidence {{ background: #ef4444; }}
        details {{ background: white; padding: 1.5rem; border-radius: 12px; margin: 1rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        summary {{ cursor: pointer; font-weight: 600; font-size: 1.25rem; padding: 0.5rem; }}
        summary:hover {{ color: #2563eb; }}
        .stat-table {{ width: 100%; border-collapse: collapse; margin: 1rem 0; }}
        .stat-table th {{ background: #f3f4f6; padding: 0.75rem; text-align: left; border-bottom: 2px solid #e5e7eb; }}
        .stat-table td {{ padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }}
        .section-divider {{ height: 2px; background: #e5e7eb; margin: 2rem 0; }}
        .warning {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; margin: 1rem 0; }}
        .success {{ background: #d1fae5; border-left: 4px solid #10b981; padding: 1rem; margin: 1rem 0; }}
    </style>
    """
    
    return html

def generate_executive_summary(results):
    """Generate executive summary with key findings"""
    summary = """
    <p><strong>Key Findings:</strong></p>
    <div class="finding">
        <h4>✓ Analysis Complete</h4>
        <p>Comprehensive exploratory data analysis has been performed on your dataset. 
        Below are the main insights discovered:</p>
        <ul>
            <li>Correlation analysis reveals relationships between variables</li>
            <li>Regression models quantify predictive relationships</li>
            <li>Assumption tests validate the reliability of findings</li>
        </ul>
        <p><strong>Bottom Line:</strong> Review detailed sections below for specific findings 
        and confidence levels for each relationship.</p>
    </div>
    """
    return summary

def generate_quality_section(df):
    """Generate data quality section"""
    html = f"""
    <p><strong>Sample Size:</strong> {len(df)} observations</p>
    <p><strong>Variables Analyzed:</strong> {len(df.columns)}</p>
    <div class="success">
        ✓ Data preprocessing complete. Analysis performed on cleaned dataset.
    </div>
    """
    return html

def generate_distribution_section(distributions):
    """Generate distribution analysis section"""
    if not distributions:
        return "<p>No distribution analysis available.</p>"
    
    html = "<table class='stat-table'><thead><tr><th>Variable</th><th>Mean</th><th>Std Dev</th><th>Normality</th><th>Skewness</th></tr></thead><tbody>"
    
    for var, dist in distributions.items():
        normality = "✓ Normal" if dist.get('is_normal') else "❌ Non-normal"
        html += f"""
        <tr>
            <td><strong>{var}</strong></td>
            <td>{dist['mean']:.2f}</td>
            <td>{dist['std']:.2f}</td>
            <td>{normality}</td>
            <td>{dist['skewness']:.2f}</td>
        </tr>
        """
    
    html += "</tbody></table>"
    return html

def generate_correlation_section(correlations):
    """Generate correlation analysis section"""
    if not correlations:
        return "<p>No correlation analysis available.</p>"
    
    html = "<p>Correlation matrices calculated using multiple methods:</p>"
    
    if correlations.get('pearson'):
        html += "<h4>Pearson Correlation (Linear relationships)</h4>"
        html += "<p>Matrix visualization would be displayed here using Plotly.</p>"
    
    if correlations.get('spearman'):
        html += "<h4>Spearman Correlation (Monotonic relationships)</h4>"
        html += "<p>Recommended for non-normally distributed variables.</p>"
    
    if correlations.get('vif'):
        html += "<h4>Multicollinearity (VIF Scores)</h4>"
        html += "<table class='stat-table'><thead><tr><th>Variable</th><th>VIF</th><th>Status</th></tr></thead><tbody>"
        for var, vif in correlations['vif'].items():
            status = "❌ High" if vif and vif > 10 else "✓ Acceptable"
            vif_display = f"{vif:.2f}" if vif else "N/A"
            html += f"<tr><td>{var}</td><td>{vif_display}</td><td>{status}</td></tr>"
        html += "</tbody></table>"
    
    return html

def generate_regression_section(regressions):
    """Generate regression analysis section"""
    if not regressions:
        return "<p>No regression analysis available.</p>"
    
    html = ""
    for dv, models in regressions.items():
        html += f"<h4>Predicting: {dv}</h4>"
        
        if 'linear' in models:
            linear = models['linear']
            html += f"""
            <div class="finding">
                <p><strong>R² = {linear['r_squared']:.3f}</strong> (Adjusted R² = {linear['adj_r_squared']:.3f})</p>
                <p><strong>F-statistic:</strong> {linear['f_statistic']:.2f}, p = {linear['f_pvalue']:.4f}</p>
                <p><strong>Coefficients:</strong></p>
                <ul>
            """
            for var, coef in linear['coefficients'].items():
                p_val = linear['p_values'][var]
                sig = "***" if p_val < 0.001 else "**" if p_val < 0.01 else "*" if p_val < 0.05 else ""
                html += f"<li>{var}: {coef:.3f} {sig} (p = {p_val:.4f})</li>"
            html += "</ul></div>"
    
    return html

def generate_assumptions_section(assumptions):
    """Generate assumption testing section"""
    if not assumptions:
        return "<p>No assumption tests available.</p>"
    
    html = ""
    for dv, tests in assumptions.items():
        html += f"<h4>{dv}</h4>"
        html += "<table class='stat-table'><thead><tr><th>Assumption</th><th>Test</th><th>Result</th><th>Status</th></tr></thead><tbody>"
        
        for test_name, result in tests.items():
            passed = result.get('passed')
            status = "✓ Pass" if passed else "❌ Fail" if passed is False else "⚠️ Warning"
            html += f"<tr><td>{test_name.replace('_', ' ').title()}</td><td>Various</td><td>See details</td><td>{status}</td></tr>"
        
        html += "</tbody></table>"
    
    return html

def generate_interpretation_guide():
    """Generate interpretation guide"""
    return """
    <p><strong>How to interpret your results:</strong></p>
    <ul>
        <li><strong>Correlation (ρ):</strong> -1 to +1. Closer to ±1 = stronger relationship</li>
        <li><strong>P-value:</strong> < 0.05 = statistically significant</li>
        <li><strong>R²:</strong> Proportion of variance explained (0-1)</li>
        <li><strong>VIF:</strong> > 10 indicates problematic multicollinearity</li>
        <li><strong>Confidence levels:</strong> Higher = more reliable finding</li>
    </ul>
    <div class="warning">
        ⚠️ <strong>Important:</strong> Statistical significance does not equal practical importance. 
        Always consider effect sizes and real-world context.
    </div>
    """

def generate_recommendations(results):
    """Generate recommendations"""
    return """
    <p><strong>Recommended next steps:</strong></p>
    <ol>
        <li>Review flagged assumption violations and consider robust alternatives</li>
        <li>Investigate variables with high VIF scores for potential multicollinearity</li>
        <li>Consider transformations for non-normally distributed variables</li>
        <li>Validate findings with domain expertise and theoretical frameworks</li>
        <li>For causal claims, consider experimental or quasi-experimental designs</li>
    </ol>
    <div class="success">
        ✓ For publication, cite this tool and report all analysis parameters used.
    </div>
    """

import pandas as pd
