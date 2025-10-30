# eda_core.py - Main EDA orchestration

import pandas as pd
import numpy as np
import json
from preprocessing import assess_data_quality, preprocess_data
from distribution import analyze_distributions
from correlation import calculate_all_correlations
from modeling import fit_all_models
from assumptions import test_all_assumptions
from report_generator import generate_html_report

def run_full_analysis(df, config_json):
    """
    Main function to run complete EDA analysis
    
    Args:
        df: pandas DataFrame with data
        config_json: JSON string with configuration
    
    Returns:
        dict with all analysis results
    """
    config = json.loads(config_json) if isinstance(config_json, str) else config_json
    
    # Extract configuration
    selected_ivs = config.get('selectedIVs', [])
    selected_dvs = config.get('selectedDVs', [])
    selected_columns = selected_ivs + selected_dvs
    
    # Step 1: Data quality assessment
    quality_issues = assess_data_quality(df, selected_columns)
    
    # Step 2: Preprocessing
    df_clean = preprocess_data(
        df, 
        selected_columns,
        config.get('missingDataStrategy', {}),
        config.get('outlierDecisions', {})
    )
    
    # Step 3: Distribution analysis
    distributions = analyze_distributions(df_clean, selected_columns)
    
    # Step 4: Correlation analysis
    correlations = calculate_all_correlations(df_clean, selected_columns, config.get('config', {}))
    
    # Step 5: Regression modeling
    regressions = fit_all_models(df_clean, selected_ivs, selected_dvs, config.get('config', {}))
    
    # Step 6: Assumption testing
    assumptions = test_all_assumptions(df_clean, selected_ivs, selected_dvs)
    
    # Compile results
    results = {
        'metadata': {
            'original_rows': len(df),
            'cleaned_rows': len(df_clean),
            'n_variables': len(selected_columns),
            'independent_vars': selected_ivs,
            'dependent_vars': selected_dvs
        },
        'quality_issues': quality_issues,
        'distributions': distributions,
        'correlations': correlations,
        'regressions': regressions,
        'assumptions': assumptions
    }
    
    # Generate HTML report
    report_html = generate_html_report(results, config.get('config', {}), df_clean)
    results['report_html'] = report_html
    
    return results
