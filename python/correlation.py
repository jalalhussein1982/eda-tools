# correlation.py - Correlation analysis with multiple methods

import pandas as pd
import numpy as np
from scipy import stats
from statsmodels.stats.outliers_influence import variance_inflation_factor
import json

def calculate_all_correlations(df, selected_columns, config):
    """
    Calculate correlations using multiple methods
    """
    if isinstance(config, str):
        config = json.loads(config)
    
    results = {
        'pearson': None,
        'spearman': None,
        'kendall': None,
        'vif': None
    }
    
    # Pearson correlation
    if config.get('correlationMethods', {}).get('pearson', True):
        pearson_corr = df[selected_columns].corr(method='pearson')
        pearson_pvalues = calculate_pvalues(df[selected_columns], method='pearson')
        results['pearson'] = {
            'matrix': pearson_corr.values.tolist(),
            'pvalues': pearson_pvalues.tolist(),
            'labels': selected_columns
        }
    
    # Spearman correlation
    if config.get('correlationMethods', {}).get('spearman', True):
        spearman_corr = df[selected_columns].corr(method='spearman')
        spearman_pvalues = calculate_pvalues(df[selected_columns], method='spearman')
        results['spearman'] = {
            'matrix': spearman_corr.values.tolist(),
            'pvalues': spearman_pvalues.tolist(),
            'labels': selected_columns
        }
    
    # Kendall correlation
    if config.get('correlationMethods', {}).get('kendall', False):
        kendall_corr = df[selected_columns].corr(method='kendall')
        kendall_pvalues = calculate_pvalues(df[selected_columns], method='kendall')
        results['kendall'] = {
            'matrix': kendall_corr.values.tolist(),
            'pvalues': kendall_pvalues.tolist(),
            'labels': selected_columns
        }
    
    # VIF calculation
    if config.get('calculateVIF', True) and len(selected_columns) > 1:
        vif_scores = calculate_vif(df[selected_columns])
        results['vif'] = vif_scores
    
    return results

def calculate_pvalues(df, method='pearson'):
    """
    Calculate p-values for correlation matrix
    """
    n = len(df.columns)
    pvalues = np.zeros((n, n))
    
    for i in range(n):
        for j in range(n):
            if i != j:
                if method == 'pearson':
                    _, p = stats.pearsonr(df.iloc[:, i], df.iloc[:, j])
                elif method == 'spearman':
                    _, p = stats.spearmanr(df.iloc[:, i], df.iloc[:, j])
                elif method == 'kendall':
                    _, p = stats.kendalltau(df.iloc[:, i], df.iloc[:, j])
                pvalues[i, j] = p
            else:
                pvalues[i, j] = 0.0
    
    return pvalues

def calculate_vif(df):
    """
    Calculate Variance Inflation Factor for each variable
    """
    vif_data = {}
    
    for i, col in enumerate(df.columns):
        try:
            vif = variance_inflation_factor(df.values, i)
            vif_data[col] = float(vif) if not np.isinf(vif) else 999.0
        except:
            vif_data[col] = None
    
    return vif_data
